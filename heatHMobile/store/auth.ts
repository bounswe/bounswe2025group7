export type AuthState = { token: string | null };

let authState: AuthState = { token: null };

export function setToken(token: string | null) {
  authState = { token };
}

export function getAuthState(): AuthState {
  return authState;
}


