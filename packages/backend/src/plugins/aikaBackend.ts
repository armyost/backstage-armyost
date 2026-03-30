import express from 'express';
import fs from 'fs';
import path from 'path';
import {
  createBackendPlugin,
  coreServices,
} from '@backstage/backend-plugin-api';
import { catalogServiceRef } from '@backstage/plugin-catalog-node';

export const aikaPlugin = createBackendPlugin({
  pluginId: 'aika',
  register(env) {
    env.registerInit({
      deps: {
        httpRouter: coreServices.httpRouter,
        logger: coreServices.logger,
        config: coreServices.rootConfig,
        catalog: catalogServiceRef,
        auth: coreServices.auth,
      },
      async init({ httpRouter, logger, config, catalog, auth }) {
        const router = express.Router();

        router.use(express.json());

        router.post('/chat', async (req, res) => {
          const query = req.body?.query?.toString?.().trim();

          if (!query) {
            return res.status(400).json({ error: 'Missing or empty query' });
          }

          const provider = config.getOptionalString('aika.provider') || 'openai';
          const providerUrl =
            config.getOptionalString('aika.providerUrl') ||
            'https://api.openai.com/v1/chat/completions';
          const apiKey = config.getOptionalString('aika.apiKey');
          const model = config.getOptionalString('aika.model') || 'gpt-3.5-turbo';
          const systemPrompt =
            config.getOptionalString('aika.systemPrompt') ||
            'You are AiKA, a helpful Backstage assistant for Armyost users.';

          // RAG: use Backstage catalog service for Component/API info first
          let ragContext = '';
          try {
            const ownCredentials = await auth.getOwnServiceCredentials();
            const componentResp = await catalog.getEntities(
              { filter: [{ kind: 'Component' }] },
              { credentials: ownCredentials },
            );
            const apiResp = await catalog.getEntities(
              { filter: [{ kind: 'API' }] },
              { credentials: ownCredentials },
            );

            const componentText = (componentResp.items || [])
              .slice(0, 20)
              .map((e: any) => `Component ${e.metadata.name} (${e.spec?.type || ''}) owner ${e.spec?.owner || ''} - ${e.metadata.description || ''}`)
              .join('\n');

            const apiText = (apiResp.items || [])
              .slice(0, 20)
              .map((e: any) => `API ${e.metadata.name} (${e.spec?.type || ''}) lifecycle ${e.spec?.lifecycle || ''} - ${e.metadata.description || ''}`)
              .join('\n');

            ragContext = `Components:\n${componentText}\n\nAPIs:\n${apiText}`;

            if (ragContext.length > 16000) {
              ragContext = ragContext.slice(0, 16000) + '\n...(truncated)...';
            }
          } catch (e) {
            logger.warn('AiKA catalog RAG context unavailable', e);
            // fallback: local file-based context for now
            try {
              const exampleEntitiesPath = path.resolve(process.cwd(), 'examples', 'entities.yaml');
              ragContext = await fs.promises.readFile(exampleEntitiesPath, 'utf-8');
              if (ragContext.length > 16000) {
                ragContext = ragContext.slice(0, 16000) + '\n...(truncated)...';
              }
            } catch (inner) {
              logger.warn('AiKA local example context unavailable', inner);
            }
          }

          const userQueryWithContext = `Backstage catalog content:\n${ragContext}\n\nUser question:\n${query}`;

          try {
            if (provider === 'openai' && !apiKey) {
              return res
                .status(500)
                .json({ error: 'Missing AiKA provider apiKey (aika.apiKey)' });
            }

            const payload: any =
              provider === 'openai'
                ? {
                    model,
                    messages: [
                      {
                        role: 'system',
                        content: systemPrompt,
                      },
                      { role: 'user', content: userQueryWithContext },
                    ],
                    temperature: 0.2,
                  }
                : {
                    prompt: `${systemPrompt}\n\n${userQueryWithContext}`,
                  };

            const headers: Record<string, string> = {
              'Content-Type': 'application/json',
            };

            if (provider === 'openai') {
              headers.Authorization = `Bearer ${apiKey}`;
            } else if (apiKey) {
              headers['Authorization'] = `Bearer ${apiKey}`;
            }

            const providerResp = await fetch(providerUrl, {
              method: 'POST',
              headers,
              body: JSON.stringify(payload),
            });

            if (!providerResp.ok) {
              const text = await providerResp.text();
              logger.error(
                `AiKA provider request failed ${providerResp.status}: ${text}`,
              );
              return res.status(502).json({
                error: 'AiKA provider error',
                status: providerResp.status,
                details: text,
              });
            }

            const body = await providerResp.json();

            let answer = 'No response from provider';

            if (provider === 'openai') {
              answer =
                body?.choices?.[0]?.message?.content ||
                body?.choices?.[0]?.text ||
                JSON.stringify(body);
            } else {
              answer =
                body?.answer || body?.response || body?.text || JSON.stringify(body);
            }

            return res.json({ answer });
          } catch (error) {
            logger.error('AiKA chat request failed', error);
            return res.status(500).json({
              error: 'AiKA chat failed',
              message: (error as Error).message || String(error),
            });
          }
        });

        httpRouter.use(router);

        // Allow unauthenticated access for AiKA chat endpoint by default.
        // Adjust to your security policy as needed.
        httpRouter.addAuthPolicy({
          path: '/chat',
          allow: 'unauthenticated',
        });
      },
    });
  },
});

export default aikaPlugin;
