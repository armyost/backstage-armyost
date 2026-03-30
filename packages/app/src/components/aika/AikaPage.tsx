import { useEffect, useState } from 'react';
import { useApi, configApiRef } from '@backstage/core-plugin-api';
import {
  Content,
  ContentHeader,
  Header,
  Page,
  SupportButton,
  InfoCard,
} from '@backstage/core-components';
import {
  Box,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
  Paper,
} from '@material-ui/core';

type ChatMessage = {
  from: 'user' | 'aika';
  text: string;
};

export const AikaPage = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const configApi = useApi(configApiRef);
  const backendBaseUrl = configApi.getString('backend.baseUrl');

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          from: 'aika',
          text: 'Hi! I am AiKA, your armyost AI assistant. Ask me anything about your catalog, docs, or CI/CD workflows.',
        },
      ]);
    }
  }, [messages]);

  const send = async () => {
    if (!draft.trim()) {
      return;
    }

    const userMessage: ChatMessage = { from: 'user', text: draft.trim() };
    setMessages(prev => [...prev, userMessage]);
    setDraft('');
    setLoading(true);
    setError(null);

    try {
      const apiUrl = `${backendBaseUrl}/api/aika/chat`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: userMessage.text,
        }),
      });

      if (!response.ok) {
        throw new Error(`AiKA request failed: ${response.status} ${response.statusText}`);
      }

      const payload = await response.json();
      const answer = payload?.answer || payload?.response || 'No answer received from AiKA';

      setMessages(prev => [...prev, { from: 'aika', text: answer }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
      setMessages(prev => [
        ...prev,
        { from: 'aika', text: 'Sorry, I could not complete that request.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page themeId="tool">
      <Content>
        <ContentHeader title="AiKA" description="AI-powered knowledge assistant for Armyost.">
          <SupportButton>Show help & hints for AiKA</SupportButton>
        </ContentHeader>

        <Header
          title="AiKA Chat"
          subtitle="Ask your team’s intelligent assistant questions about services, docs, and workflow."
        />

        <Box mb={2}>
          <Paper style={{ minHeight: 300, padding: 16, overflowY: 'auto', maxHeight: 400 }}>
            <List>
              {messages.map((message, index) => (
                <ListItem key={`${message.from}-${index}`}>
                  <ListItemText
                    primary={message.text}
                    secondary={message.from === 'user' ? 'You' : 'AiKA'}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Box>

        {error && (
          <Box mb={1}>
            <Typography color="error">{error}</Typography>
          </Box>
        )}

        <Box display="flex" alignItems="center" gap={8}>
          <TextField
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder="Type your question here..."
            variant="outlined"
            fullWidth
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={send}
            disabled={loading || !draft.trim()}
          >
            {loading ? <CircularProgress size={18} /> : 'Send'}
          </Button>
        </Box>

        <InfoCard title="AiKA integration details" style={{ marginTop: 16 }}>
          <Typography variant="body2">
            This is a minimal interactive chatbot UI. It uses the backend plugin route
            `/api/aika/chat` by default. Configure your provider in `app-config.yaml` under `aika`.
          </Typography>
        </InfoCard>
      </Content>
    </Page>
  );
};
