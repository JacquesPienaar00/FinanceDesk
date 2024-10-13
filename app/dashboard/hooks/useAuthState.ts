import { useSession } from 'next-auth/react';

export function useAuthState() {
  const { data: session, status } = useSession();

  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';

  return {
    session,
    isLoading,
    isAuthenticated,
  };
}
