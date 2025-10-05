import { useQuery, useQueryClient } from '@tanstack/react-query';
import { me } from './api';

export function useAuth() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch } = useQuery({ 
    queryKey: ['me'], 
    queryFn: me, 
    retry: false,
    // Safari-specific: add staleTime to prevent unnecessary refetches
    staleTime: 5 * 60 * 1000, // 5 minutes
    // Safari-specific: add retry delay for network issues
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
  
  return {
    isAuthed: Boolean(data?.email),
    user: data ?? null,
    isLoading,
    isError,
    refetchMe: refetch,
    queryClient,
  };
}


