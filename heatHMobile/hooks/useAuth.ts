import { useState } from 'react';

export function useAuth() {
  const [token, setToken] = useState<string | null>(null);
  return { token, setToken };
}


