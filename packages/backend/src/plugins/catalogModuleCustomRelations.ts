import { catalogRelationTypeExtensionPoint } from '@backstage/plugin-catalog-node/alpha';
import { createBackendModule } from '@backstage/backend-plugin-api';

/**
 * Module to register custom relation types for the catalog
 * Registers: featureOf, hasFeature
 */
export const catalogModuleCustomRelations = createBackendModule({
  pluginId: 'catalog',
  moduleId: 'custom-relations',
  register(env) {
    env.registerInit({
      deps: {
        catalog: catalogRelationTypeExtensionPoint,
      },
      async init({ catalog }) {
        // Register custom relation types
        catalog.addRelationTypes(['featureOf', 'hasFeature']);
      },
    });
  },
});

export default catalogModuleCustomRelations;
