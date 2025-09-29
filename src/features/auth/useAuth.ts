import { useQuery, useQueryClient } from '@tanstack/react-query';
import { me } from './api';

export function useAuth() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['me'], queryFn: me, retry: false });
  return {
    isAuthed: Boolean(data?.email),
    user: data ?? null,
    isLoading,
    isError,
    refetchMe: refetch,
    queryClient,
  };
}


