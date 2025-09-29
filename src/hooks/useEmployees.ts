import { useState, useMemo } from 'react';
import { Employee, EmployeeFilters, EmployeeSortConfig, EmployeePagination } from '@/types/employee';
import { mockEmployees } from '@/data/mockEmployees';

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [filters, setFilters] = useState<EmployeeFilters>({});
  const [sort, setSort] = useState<EmployeeSortConfig>({ field: 'name', direction: 'asc' });
  const [pagination, setPagination] = useState<EmployeePagination>({ page: 1, limit: 10, total: 0 });

  const filteredAndSortedEmployees = useMemo(() => {
    let result = [...employees];

    // Apply filters
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(emp => 
        emp.name.toLowerCase().includes(searchLower) ||
        emp.surname.toLowerCase().includes(searchLower) ||
        emp.role.toLowerCase().includes(searchLower) ||
        emp.email.toLowerCase().includes(searchLower)
      );
    }

    if (filters.role) {
      result = result.filter(emp => emp.role === filters.role);
    }

    if (filters.hasManager !== undefined) {
      result = result.filter(emp => filters.hasManager ? !!emp.manager : !emp.manager);
    }

    if (filters.salaryMin !== undefined) {
      result = result.filter(emp => emp.salary >= filters.salaryMin!);
    }

    if (filters.salaryMax !== undefined) {
      result = result.filter(emp => emp.salary <= filters.salaryMax!);
    }

    if (filters.birthDateFrom) {
      result = result.filter(emp => emp.birthDate >= filters.birthDateFrom!);
    }

    if (filters.birthDateTo) {
      result = result.filter(emp => emp.birthDate <= filters.birthDateTo!);
    }

    // Apply sorting
    result.sort((a, b) => {
      const aValue = a[sort.field];
      const bValue = b[sort.field];
      
      if (aValue < bValue) return sort.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sort.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [employees, filters, sort]);

  const paginatedEmployees = useMemo(() => {
    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    
    setPagination(prev => ({ 
      ...prev, 
      total: filteredAndSortedEmployees.length 
    }));
    
    return filteredAndSortedEmployees.slice(startIndex, endIndex);
  }, [filteredAndSortedEmployees, pagination.page, pagination.limit]);

  const createEmployee = (employeeData: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newEmployee: Employee = {
      ...employeeData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setEmployees(prev => [...prev, newEmployee]);
    return newEmployee;
  };

  const updateEmployee = (id: string, updates: Partial<Employee>) => {
    setEmployees(prev => 
      prev.map(emp => 
        emp.id === id 
          ? { ...emp, ...updates, updatedAt: new Date() }
          : emp
      )
    );
  };

  const deleteEmployee = (id: string) => {
    // Check if employee is a manager
    const hasReports = employees.some(emp => emp.manager === id);
    if (hasReports) {
      throw new Error('Cannot delete employee who is managing other employees');
    }
    setEmployees(prev => prev.filter(emp => emp.id !== id));
  };

  const getEmployee = (id: string) => {
    return employees.find(emp => emp.id === id);
  };

  return {
    employees: paginatedEmployees,
    allEmployees: employees,
    filteredEmployees: filteredAndSortedEmployees,
    filters,
    sort,
    pagination,
    setFilters,
    setSort,
    setPagination,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    getEmployee,
  };
}