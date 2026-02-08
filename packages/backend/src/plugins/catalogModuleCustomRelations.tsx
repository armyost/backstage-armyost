import { catalogRelationTypeExtensionPoint } from '@backstage/plugin-catalog-node/alpha';
import { createBackendModule } from '@backstage/backend-defaults';

export const catalogModuleCustomRelations = createBackendModule({
  pluginId: 'catalog',
  moduleId: 'custom-relations',
  register(env) {
    env.registerInit({
      deps: {
        catalog: catalogRelationTypeExtensionPoint,
      },
      async init({ catalog }) {
        // 여기에 커스텀 관계 타입을 등록합니다.
        catalog.addRelationTypes('featureOf', 'hasFeature');
      },
    });
  },
});