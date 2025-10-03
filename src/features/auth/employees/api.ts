import { jsonFetch, API } from '@/lib/api';
import { EmployeeCreateInput } from '@/types/employee';
import { parseEmployee, toApiEmployee } from './mapper';

/* ---------- List ---------- */
export const listEmployees = (
  p: { q?: string; page?: number; limit?: number; sort?: string } = {}
) =>
  jsonFetch<{ data: any[]; total: number; page: number; limit: number }>(
    `/employees?` +
      new URLSearchParams(
        Object.entries(p).filter(([, v]) => v != null) as any
      )
  ).then((r) => ({ ...r, data: r.data.map(parseEmployee) }));

/* ---------- List All for Org Chart ---------- */
export const listAllEmployeesForOrg = () =>
  jsonFetch<any[]>(`/employees/all-for-org`).then((data) => 
    data.map(parseEmployee)
  );

/* ---------- Create ---------- */
export const createEmployee = (body: EmployeeCreateInput) =>
  jsonFetch<any>(`/employees`, {
    method: 'POST',
    body: toApiEmployee(body),
  }).then(parseEmployee);

/* ---------- Update (PATCH) ---------- */
export const updateEmployee = (id: string, body: Partial<EmployeeCreateInput>) =>
  jsonFetch<any>(`/employees/${id}`, {
    method: 'PATCH',
    body: toApiEmployee(body),
  }).then(parseEmployee);

/* ---------- Delete ---------- */
export const deleteEmployee = (id: string) =>
  fetch(`${API}/employees/${id}`, { method: 'DELETE', credentials: 'include' })
    .then(async (r) => {
      if (!r.ok) throw await safeJson(r);
    });

async function safeJson(r: Response) {
  try { return await r.json(); } catch { return { message: r.statusText }; }
}
