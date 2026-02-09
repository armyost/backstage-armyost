import { CatalogProcessor, CatalogProcessorEmit, processingResult } from '@backstage/plugin-catalog-node';
import { LocationSpec } from '@backstage/plugin-catalog-common';
import { Entity } from '@backstage/catalog-model';

/**
 * Custom catalog processor that adds featureOf/hasFeature relations
 * based on custom fields in entity spec
 */
export class CustomRelationProcessor implements CatalogProcessor {
  getProcessorName(): string {
    return 'CustomRelationProcessor';
  }

  async preProcessEntity(
    entity: Entity,
    location: LocationSpec,
    emit: CatalogProcessorEmit,
  ): Promise<Entity> {
    // Handle hasFeature field
    const hasFeature = (entity.spec?.hasFeature as string[] | string | undefined);
    if (hasFeature) {
      const features = Array.isArray(hasFeature) ? hasFeature : [hasFeature];
      
      for (const targetRef of features) {
        emit(processingResult.relation({
          source: {
            kind: entity.kind,
            namespace: entity.metadata.namespace || 'default',
            name: entity.metadata.name,
          },
          type: 'hasFeature',
          target: {
            kind: targetRef.split(':')[0] || 'Resource',
            namespace: targetRef.split('/')[0].split(':')[1] || 'default',
            name: targetRef.split('/')[1] || targetRef,
          },
        }));
      }
      
      // Remove from spec after processing to avoid validation errors
      delete entity.spec.hasFeature;
    }

    // Handle featureOf field
    const featureOf = (entity.spec?.featureOf as string[] | string | undefined);
    if (featureOf) {
      const components = Array.isArray(featureOf) ? featureOf : [featureOf];
      
      for (const targetRef of components) {
        emit(processingResult.relation({
          source: {
            kind: entity.kind,
            namespace: entity.metadata.namespace || 'default',
            name: entity.metadata.name,
          },
          type: 'featureOf',
          target: {
            kind: targetRef.split(':')[0] || 'Component',
            namespace: targetRef.split('/')[0].split(':')[1] || 'default',
            name: targetRef.split('/')[1] || targetRef,
          },
        }));
      }
      
      // Remove from spec after processing to avoid validation errors
      delete entity.spec.featureOf;
    }

///// Up/Down Stream feature

    // Handle upstream field
    const upstreamOf = (entity.spec?.upstreamOf as string[] | string | undefined);
    if (upstreamOf) {
      const apis = Array.isArray(upstreamOf) ? upstreamOf : [upstreamOf];
      
      for (const targetRef of apis) {
        emit(processingResult.relation({
          source: {
            kind: entity.kind,
            namespace: entity.metadata.namespace || 'default',
            name: entity.metadata.name,
          },
          type: 'upstreamOf',
          target: {
            kind: targetRef.split(':')[0] || 'Api',
            namespace: targetRef.split('/')[0].split(':')[1] || 'default',
            name: targetRef.split('/')[1] || targetRef,
          },
        }));
      }

      // Remove from spec after processing to avoid validation errors
      delete entity.spec.upstreamOf;
    }

          // Handle upstream field
    const upstreamBy = (entity.spec?.upstreamBy as string[] | string | undefined);
    if (upstreamBy) {
      const apis = Array.isArray(upstreamBy) ? upstreamBy : [upstreamBy];
      
      for (const targetRef of apis) {
        emit(processingResult.relation({
          source: {
            kind: entity.kind,
            namespace: entity.metadata.namespace || 'default',
            name: entity.metadata.name,
          },
          type: 'upstreamBy',
          target: {
            kind: targetRef.split(':')[0] || 'Resource',
            namespace: targetRef.split('/')[0].split(':')[1] || 'default',
            name: targetRef.split('/')[1] || targetRef,
          },
        }));
      }
      
      // Remove from spec after processing to avoid validation errors
      delete entity.spec.upstreamBy;
    }

    // Handle upstream field
    const downstreamOf = (entity.spec?.downstreamOf as string[] | string | undefined);
    if (downstreamOf) {
      const apis = Array.isArray(downstreamOf) ? downstreamOf : [downstreamOf];
      
      for (const targetRef of apis) {
        emit(processingResult.relation({
          source: {
            kind: entity.kind,
            namespace: entity.metadata.namespace || 'default',
            name: entity.metadata.name,
          },
          type: 'downstreamOf',
          target: {
            kind: targetRef.split(':')[0] || 'Api',
            namespace: targetRef.split('/')[0].split(':')[1] || 'default',
            name: targetRef.split('/')[1] || targetRef,
          },
        }));
      }
      
      // Remove from spec after processing to avoid validation errors
      delete entity.spec.downstreamOf;
    }

    // Handle upstream field
    const downstreamBy = (entity.spec?.downstreamBy as string[] | string | undefined);
    if (downstreamBy) {
      const apis = Array.isArray(downstreamBy) ? downstreamBy : [downstreamBy];
      
      for (const targetRef of apis) {
        emit(processingResult.relation({
          source: {
            kind: entity.kind,
            namespace: entity.metadata.namespace || 'default',
            name: entity.metadata.name,
          },
          type: 'downstreamBy',
          target: {
            kind: targetRef.split(':')[0] || 'Resource',
            namespace: targetRef.split('/')[0].split(':')[1] || 'default',
            name: targetRef.split('/')[1] || targetRef,
          },
        }));
      }
      
      // Remove from spec after processing to avoid validation errors
      delete entity.spec.downstreamBy;
    }

    return entity;
  }
}
