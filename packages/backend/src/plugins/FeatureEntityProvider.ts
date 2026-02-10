import { Entity } from '@backstage/catalog-model';

/**
 * Feature Entity Kind definition
 * Validates Feature entities in the catalog
 */
export interface FeatureEntityV1alpha1 extends Entity {
  apiVersion: 'backstage.io/v1alpha1' | 'backstage.io/v1beta1';
  kind: 'Feature';
  spec: {
    type: string;
    lifecycle: string;
    owner: string;
    system?: string;
    featureOf?: string[];
    upstreamOf?: string[];
    downstreamOf?: string[];
  };
}

/**
 * Type guard for Feature entities
 */
export function isFeatureEntity(entity: Entity): entity is FeatureEntityV1alpha1 {
  return entity.kind === 'Feature';
}
