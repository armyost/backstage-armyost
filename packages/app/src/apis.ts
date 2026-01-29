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
  //   api: scmIntegrationsApiRef,
  //   deps: { configApi: configApiRef },
  //   factory: ({ configApi }) => ScmIntegrationsApi.fromConfig(configApi),
  // }),
  // ScmAuth.createDefaultApiFactory(),
    api: catalogGraphApiRef,
    deps: {},
    factory: () =>
      new DefaultCatalogGraphApi({
        // The relations to support
        knownRelations: [...ALL_RELATIONS, 'myRelationOf', 'myRelationFor'],
        // The relation pairs to support
        knownRelationPairs: [
          ...ALL_RELATION_PAIRS,
          ['myRelationOf', 'myRelationFor'],
        ],
        // Select what relations to be shown by default, either by including them,
        // or excluding some from all known relations:
        defaultRelationTypes: {
          // Don't show/select these by default
          exclude: ['myRelationOf', 'myRelationFor'],
        },
      }),
  }),
];
