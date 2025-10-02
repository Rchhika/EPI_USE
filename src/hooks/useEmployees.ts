import { useMemo, useState } from 'react';
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData, // v5 helper for placeholderData
} from '@tanstack/react-query';
import {
  listEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from '@/features/auth/employees/api';
import type { Employee, EmployeeCreateInput, EmployeeUpdateInput } from '@/types/employee';

type Filters = {
  search?: string;
  role?: string;
  hasManager?: boolean;
  salaryMin?: number;
  salaryMax?: number;
  birthDateFrom?: Date;
  birthDateTo?: Date;
};

type EmployeesResponse = {
  data: Employee[];
  total: number;
  page: number;
  limit: number;
};

// Coerce unknown to Date when needed
const toDate = (d: unknown) =>
  d instanceof Date ? d : d ? new Date(String(d)) : undefined;

export function useEmployees() {
  const qc = useQueryClient();

  const [filters, setFilters] = useState<Filters>({});
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  const query = useQuery<EmployeesResponse>({
    queryKey: ['employees', { page, limit, q: (filters.search ?? '').trim() }],
    queryFn: () =>
      listEmployees({
        page,
        limit,
        q: (filters.search ?? '').trim() || undefined,
        sort: '-createdAt',
      }),
    // keeps previous page data while fetching the next
    placeholderData: keepPreviousData,
  });

  const rows = query.data?.data ?? [];

  const employees = useMemo(() => {
    let out = rows;

    if (filters.role) out = out.filter((e) => e.role === filters.role);

    if (typeof filters.hasManager === 'boolean') {
      out = out.filter((e) => Boolean(e.manager) === filters.hasManager);
    }

    if (typeof filters.salaryMin === 'number') {
      out = out.filter((e) => (e.salary ?? 0) >= filters.salaryMin!);
    }

    if (typeof filters.salaryMax === 'number') {
      out = out.filter((e) => (e.salary ?? 0) <= filters.salaryMax!);
    }

    if (filters.birthDateFrom) {
      out = out.filter((e) => {
        const bd = toDate(e.birthDate);
        return bd && bd >= filters.birthDateFrom!;
      });
    }

    if (filters.birthDateTo) {
      out = out.filter((e) => {
        const bd = toDate(e.birthDate);
        return bd && bd <= filters.birthDateTo!;
      });
    }

    return out;
  }, [rows, filters]);

  const allEmployees = rows;

  const mCreate = useMutation({
    mutationFn: (body: EmployeeCreateInput) => createEmployee(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['employees'] }),
  });

  const mUpdate = useMutation({
    mutationFn: ({ id, ...rest }: EmployeeUpdateInput) => updateEmployee(id, rest),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['employees'] }),
  });

  const mDelete = useMutation({
    mutationFn: (id: string) => deleteEmployee(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['employees'] }),
  });

  return {
    isLoading: query.isLoading,
    error: query.error as unknown,
    employees,
    allEmployees,
    pagination: { page, limit, total: query.data?.total ?? rows.length },
    setPage,
    filters,
    setFilters,
    refetch: query.refetch,

    createEmployee: mCreate.mutateAsync,
    updateEmployee: mUpdate.mutateAsync,
    deleteEmployee: mDelete.mutateAsync,

    isCreating: mCreate.isPending,
    isUpdating: mUpdate.isPending,
    isDeleting: mDelete.isPending,
  };
}
