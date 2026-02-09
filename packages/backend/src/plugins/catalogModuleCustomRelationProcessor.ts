import { catalogProcessingExtensionPoint } from '@backstage/plugin-catalog-node/alpha';
import { createBackendModule } from '@backstage/backend-plugin-api';
import { CustomRelationProcessor } from './CustomRelationProcessor';

/**
 * Module to register custom relation processor for the catalog
 * Processes: hasFeature, featureOf custom relations
 */
export const catalogModuleCustomRelationProcessor = createBackendModule({
  pluginId: 'catalog',
  moduleId: 'custom-relation-processor',
  register(env) {
    env.registerInit({
      deps: {
        catalog: catalogProcessingExtensionPoint,
      },
      async init({ catalog }) {
        catalog.addProcessor(new CustomRelationProcessor());
      },
    });
  },
});

export default catalogModuleCustomRelationProcessor;
