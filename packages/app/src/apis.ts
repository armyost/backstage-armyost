import {
  ScmIntegrationsApi,
  scmIntegrationsApiRef,
  ScmAuth,
} from '@backstage/integration-react';
import {
  AnyApiFactory,
  configApiRef,
  createApiFactory,
} from '@backstage/core-plugin-api';
import {
  ALL_RELATIONS,
  ALL_RELATION_PAIRS,
  catalogGraphApiRef,
  DefaultCatalogGraphApi,
} from '@backstage/plugin-catalog-graph';

export const apis: AnyApiFactory[] = [
  createApiFactory({
    api: scmIntegrationsApiRef,
    deps: { configApi: configApiRef },
    factory: ({ configApi }) => ScmIntegrationsApi.fromConfig(configApi),
  }),
  ScmAuth.createDefaultApiFactory(),
  createApiFactory({
    api: catalogGraphApiRef,
    deps: {},
    factory: () =>
      new DefaultCatalogGraphApi({
        // The relations to support
        knownRelations: [...ALL_RELATIONS, 'featureOf', 'hasFeature'],
        // The relation pairs to support
        knownRelationPairs: [
          ...ALL_RELATION_PAIRS,
          ['featureOf', 'hasFeature'],
        ],
        // Select what relations to be shown by default
        defaultRelationTypes: {
          // Don't exclude any custom relations - show them by default
          exclude: [],
        },
      }),
  }),
];
