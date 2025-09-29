import { jsonFetch, API } from '@/lib/api';
import { Employee, EmployeeCreateInput, EmployeeUpdateInput } from '@/types/employee';
import { parseEmployee } from './mapper';

export const listEmployees = (p: { q?: string; page?: number; limit?: number; sort?: string } = {}) =>
  jsonFetch<{ data: any[]; total: number; page: number; limit: number }>(
    `/employees?` + new URLSearchParams(Object.entries(p).filter(([, v]) => v != null) as any)
  ).then(r => ({ ...r, data: r.data.map(parseEmployee) }));

export const createEmployee = (body: EmployeeCreateInput) =>
  jsonFetch<any>(`/employees`, { method: 'POST', body: toApiBody(body) }).then(parseEmployee);

export const updateEmployee = (id: string, body: EmployeeUpdateInput) =>
  jsonFetch<any>(`/employees/${id}`, { method: 'PATCH', body: toApiBody(body) }).then(parseEmployee);

export const deleteEmployee = (id: string) =>
  fetch(`${API}/employees/${id}`, { method: 'DELETE', credentials: 'include' })
    .then(r => { if (!r.ok) return r.json().then(e => Promise.reject(e)); });

// helper: convert Date fields to ISO for API
function toApiBody(input: Partial<EmployeeCreateInput | EmployeeUpdateInput>) {
  const b: any = { ...input };
  if (b.birthDate instanceof Date) b.birthDate = b.birthDate.toISOString();
  return b;
}
