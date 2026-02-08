import { createBackendModule } from '@backstage/backend-plugin-api';
import {
  permissionPolicyExtensionPoint,
  BackendPermissionHandler,
} from '@backstage/plugin-permission-node';
import {
  AuthorizeResult,
  PolicyDecision,
} from '@backstage/plugin-permission-common';

/**
 * Custom Permission Policy
 * Grants admin access to specified users in app-config.yaml
 */
class CustomPermissionPolicy implements BackendPermissionHandler {
  private adminUsers: Set<string>;

  constructor(adminUsers: string[] = []) {
    this.adminUsers = new Set(adminUsers);
  }

  async handle(
    _request: any,
    user: any,
  ): Promise<PolicyDecision> {
    // Get the user's entity ref (e.g., "user:default/armyost")
    const userEntityRef = user?.identity?.userEntityRef;

    // Grant admin access to specified users
    if (userEntityRef && this.adminUsers.has(userEntityRef)) {
      return {
        result: AuthorizeResult.ALLOW,
      };
    }

    // Allow all for non-admin users (development mode)
    return {
      result: AuthorizeResult.ALLOW,
    };
  }
}

export const customPermissionPolicy = createBackendModule({
  pluginId: 'permission',
  moduleId: 'custom-policy',
  register(env) {
    env.registerInit({
      deps: {
        policy: permissionPolicyExtensionPoint,
      },
      async init({ policy }) {
        // Get admin users from environment or hardcode
        const adminUsers = [
          'user:default/armyost', // Replace with your GitHub username
        ];

        policy.setPolicy(new CustomPermissionPolicy(adminUsers));
      },
    });
  },
});

export default customPermissionPolicy;

