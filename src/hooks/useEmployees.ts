import { useMemo, useState } from 'react';
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData, // v5 helper
} from '@tanstack/react-query';
import {
  listEmployees,
  listAllEmployeesForOrg,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from '@/features/auth/employees/api';
import type {
  Employee,
  EmployeeCreateInput,
  EmployeeUpdateInput,
} from '@/types/employee';

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

  // Pull more rows so dashboard metrics (avg salary, etc.) are meaningful.
  // If you expect thousands of records, consider a dedicated /summary endpoint instead.
  const [limit] = useState(500);

  const trimmedQ = (filters.search ?? '').trim();

  const query = useQuery<EmployeesResponse>({
    queryKey: ['employees', { page, limit, q: trimmedQ }],
    queryFn: () =>
      listEmployees({
        page,
        limit,
        q: trimmedQ || undefined,
        sort: '-createdAt',
      }),
    placeholderData: keepPreviousData,
  });

  // Fetch all employees for manager lookup (separate from search results)
  const allEmployeesQuery = useQuery({
    queryKey: ['employees-all'],
    queryFn: listAllEmployeesForOrg,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const rows = query.data?.data ?? [];
  const allEmployees = allEmployeesQuery.data ?? [];

  // Local filtering (UI filters beyond the server's search)
  const employees = useMemo(() => {
    let out = rows;

    if (filters.role) out = out.filter((e) => e.role === filters.role);

    if (typeof filters.hasManager === 'boolean') {
      out = out.filter((e) => Boolean(e.manager) === filters.hasManager);
    }

    if (typeof filters.salaryMin === 'number') {
      out = out.filter((e) => (e.salary ?? 0) >= filters.salaryMin);
    }

    if (typeof filters.salaryMax === 'number') {
      out = out.filter((e) => (e.salary ?? 0) <= filters.salaryMax);
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

  // Mutations
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

  // Use server total (better for KPIs than employees.length)
  const total = query.data?.total ?? rows.length;

  return {
    // query state
    isLoading: query.isLoading || allEmployeesQuery.isLoading,
    isFetching: query.isFetching,
    error: query.error as unknown,

    // data
    employees,
    allEmployees,
    total, // <— expose this for the Dashboard KPI

    // pagination
    pagination: { page, limit, total },
    setPage,

    // filters
    filters,
    setFilters,

    // controls
    refetch: query.refetch,

    // mutations
    createEmployee: mCreate.mutateAsync,
    updateEmployee: mUpdate.mutateAsync,
    deleteEmployee: mDelete.mutateAsync,
    isCreating: mCreate.isPending,
    isUpdating: mUpdate.isPending,
    isDeleting: mDelete.isPending,
  };
}
