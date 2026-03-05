import { UserManager, WebStorageStateStore } from 'oidc-client-ts'

export const userManager = new UserManager({
  authority: import.meta.env.VITE_OIDC_AUTHORITY ?? 'http://localhost:8180/realms/portal',
  client_id: import.meta.env.VITE_OIDC_CLIENT_ID ?? 'portal-shell',
  redirect_uri: `${window.location.origin}/callback`,
  post_logout_redirect_uri: window.location.origin,
  scope: 'openid profile email',
  // Fetch the userinfo endpoint after sign-in so custom claims (e.g. groups)
  // are merged into user.profile regardless of what ends up in the ID token.
  loadUserInfo: true,
  userStore: new WebStorageStateStore({ store: window.sessionStorage }),
  // PKCE state must survive the cross-origin redirect to Keycloak — use
  // localStorage (persists across navigations) instead of sessionStorage.
  stateStore: new WebStorageStateStore({ store: window.localStorage }),
})
