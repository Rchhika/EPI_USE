import type { Employee, EmployeeCreateInput, EmployeeUpdateInput } from "@/types/employee";

/** Convert API -> app Employee */
export function parseEmployee(api: any): Employee {
  return {
    id: api.id ?? api._id ?? String(api.id ?? api._id ?? ""),
    name: api.firstName ?? api.name ?? "",
    surname: api.surname ?? api.lastName ?? "",
    email: api.email ?? "",
    birthDate: api.birthDate ? new Date(api.birthDate) : undefined,
    employeeNumber: api.employeeNumber ?? api.empNo ?? api.employee_code ?? "",
    salary: typeof api.salary === "number" ? api.salary : (api.salary ? Number(api.salary) : undefined),
    role: api.role ?? api.title ?? "",
    // support either 'manager' or 'managerId' from the API
    manager: api.manager ?? api.managerId ?? undefined,
    createdAt: api.createdAt ? new Date(api.createdAt) : undefined,
    updatedAt: api.updatedAt ? new Date(api.updatedAt) : undefined,
  };
}

/** Convert app -> API body (PATCH/POST) */
export function toApiEmployee(input: Partial<EmployeeCreateInput | EmployeeUpdateInput>) {
  const out: any = {};

  if (input.name !== undefined) out.firstName = input.name; // <-- map name -> firstName
  if (input.surname !== undefined) out.surname = input.surname;
  if (input.email !== undefined) out.email = input.email;
  if (input.birthDate !== undefined) {
    out.birthDate = input.birthDate instanceof Date ? input.birthDate.toISOString() : input.birthDate;
  }
  if (input.employeeNumber !== undefined) out.employeeNumber = input.employeeNumber;
  if (input.salary !== undefined) out.salary = input.salary;
  if (input.role !== undefined) out.role = input.role;

  // Manager: send both keys so whichever your backend expects will work.
  if (input.manager) {
    out.manager = input.manager;
    out.managerId = input.manager;
  } else {
    // remove empties
    delete out.manager;
    delete out.managerId;
  }

  // strip empty strings
  Object.keys(out).forEach((k) => {
    if (out[k] === "") delete out[k];
  });

  return out;
}
