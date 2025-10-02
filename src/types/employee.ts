export interface Employee {
  id: string;
  name: string;
  surname: string;
  email: string;
  birthDate: Date;
  employeeNumber: string;
  salary: number;
  role: string;
  manager?: string; // Employee ID of manager

  /** Added to match backend schema */
  isActive?: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export interface EmployeeCreateInput {
  name: string;
  surname: string;
  email: string;
  birthDate: Date;
  employeeNumber: string;
  salary: number;
  role: string;
  manager?: string;
}

export interface EmployeeUpdateInput extends Partial<EmployeeCreateInput> {
  id: string;
}

export interface EmployeeFilters {
  search?: string;
  role?: string;
  hasManager?: boolean;
  salaryMin?: number;
  salaryMax?: number;
  birthDateFrom?: Date;
  birthDateTo?: Date;
}

export interface EmployeeSortConfig {
  field: keyof Employee;
  direction: 'asc' | 'desc';
}

export interface EmployeePagination {
  page: number;
  limit: number;
  total: number;
}

export interface OrgChartNode {
  id: string;
  label: string;
  avatarUrl: string;
  role: string;
}

export interface OrgChartEdge {
  id: string;
  source: string;
  target: string;
}

export interface OrgChartData {
  nodes: OrgChartNode[];
  edges: OrgChartEdge[];
}

export const EMPLOYEE_ROLES = [
  'CEO',
  'CTO',
  'VP Engineering',
  'Engineering Manager',
  'Senior Software Engineer',
  'Software Engineer',
  'Junior Software Engineer',
  'Product Manager',
  'Senior Product Manager',
  'Designer',
  'Senior Designer',
  'Marketing Manager',
  'Sales Manager',
  'HR Manager',
  'Finance Manager',
  'Intern',
] as const;

export type EmployeeRole = typeof EMPLOYEE_ROLES[number];
