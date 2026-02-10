import { catalogProcessingExtensionPoint } from '@backstage/plugin-catalog-node/alpha';
import { createBackendModule } from '@backstage/backend-plugin-api';
import { CatalogProcessor, CatalogProcessorEmit } from '@backstage/plugin-catalog-node';
import { Entity } from '@backstage/catalog-model';
import { LocationSpec } from '@backstage/plugin-catalog-common';

/**
 * Custom processor that validates and processes Feature entities
 */
class FeatureEntityProcessor implements CatalogProcessor {
  getProcessorName(): string {
    return 'FeatureEntityProcessor';
  }

  async validateEntityKind(entity: Entity): Promise<boolean> {
    return entity.kind === 'Feature';
  }

  async postProcessEntity(
    entity: Entity,
    _location: LocationSpec,
    _emit: CatalogProcessorEmit,
  ): Promise<Entity> {
    // Accept and pass through Feature entities
    if (entity.kind === 'Feature') {
      // Basic validation
      if (!entity.spec) {
        throw new Error('Feature entity must have a spec');
      }

      if (!entity.spec.type) {
        throw new Error('Feature entity must have a spec.type');
      }

      if (!entity.spec.lifecycle) {
        throw new Error('Feature entity must have a spec.lifecycle');
      }

      if (!entity.spec.owner) {
        throw new Error('Feature entity must have a spec.owner');
      }
    }

    return entity;
  }
}

/**
 * Module to register Feature entity kind processor
 */
export const catalogModuleFeatureEntityKind = createBackendModule({
  pluginId: 'catalog',
  moduleId: 'feature-entity-kind',
  register(env) {
    env.registerInit({
      deps: {
        catalog: catalogProcessingExtensionPoint,
      },
      async init({ catalog }) {
        catalog.addProcessor(new FeatureEntityProcessor());
      },
    });
  },
});

export default catalogModuleFeatureEntityKind;
