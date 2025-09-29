import { Employee } from '@/types/employee';

export const parseEmployee = (raw: any): Employee => ({
  id: raw.id ?? raw._id, // backend sends id; fallback if needed
  name: raw.name,
  surname: raw.surname,
  email: raw.email,
  birthDate: raw.birthDate ? new Date(raw.birthDate) : new Date(0),
  employeeNumber: raw.employeeNumber ?? '',
  salary: Number(raw.salary ?? 0),
  role: raw.role ?? '',
  manager: raw.manager ?? undefined,
  createdAt: new Date(raw.createdAt),
  updatedAt: new Date(raw.updatedAt),
});
