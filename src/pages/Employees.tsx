import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, Download } from 'lucide-react';
import EmployeeTable from '@/components/employees/EmployeeTable';
import EmployeeFilters from '@/components/employees/EmployeeFilters';
import { useEmployees } from '@/hooks/useEmployees';
import { Employee } from '@/types/employee';

export default function Employees() {
  const { 
    employees, 
    allEmployees, 
    filters, 
    setFilters 
  } = useEmployees();

  const handleEdit = (employee: Employee) => {
    console.log('Edit employee:', employee);
  };

  const handleDelete = (employee: Employee) => {
    console.log('Delete employee:', employee);
  };

  const handleView = (employee: Employee) => {
    console.log('View employee:', employee);
  };

  const exportCSV = () => {
    console.log('Export CSV');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-playfair font-bold text-foreground">Employees</h1>
          <p className="text-muted-foreground mt-1">Manage your team members</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button className="bg-gradient-primary hover:opacity-90">
            <UserPlus className="mr-2 h-4 w-4" />
            Add Employee
          </Button>
        </div>
      </div>

      <Card className="hover-lift">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <EmployeeFilters filters={filters} onFiltersChange={setFilters} />
        </CardContent>
      </Card>

      <EmployeeTable 
        data={employees}
        allEmployees={allEmployees}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
      />
    </div>
  );
}