import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, Download } from 'lucide-react';
import EmployeeTable from '@/components/employees/EmployeeTable';
import EmployeeFilters from '@/components/employees/EmployeeFilters';
import { useEmployees } from '@/hooks/useEmployees';
import type { Employee } from '@/types/employee';

export default function Employees() {
  const {
    isLoading,
    error,
    employees,
    allEmployees,
    filters,
    setFilters,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    refetch,
    pagination,
    setPage,
  } = useEmployees();

  const [adding, setAdding] = useState(false);
  const [exporting, setExporting] = useState(false);

  // ----- Actions -----
  const handleEdit = async (employee: Employee) => {
    // TODO: open your edit modal here and pass the form values to updateEmployee
    try {
      await updateEmployee({ id: employee.id, role: employee.role });
      // Optionally refetch if your table isn't optimistic
      await refetch();
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? 'Failed to update employee');
    }
  };

  const handleDelete = async (employee: Employee) => {
    if (!confirm(`Delete ${employee.name} ${employee.surname}?`)) return;
    try {
      await deleteEmployee(employee.id);
      await refetch();
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? 'Failed to delete employee');
    }
  };

  const handleView = (employee: Employee) => {
    // TODO: open a side panel / modal if desired
    console.log('View employee:', employee);
  };

  const handleQuickAdd = async () => {
    // Replace with your "Create Employee" dialog + form; this is a smoke test
    try {
      setAdding(true);
      await createEmployee({
        name: 'Rohan',
        surname: 'Chhika',
        email: `rohan+${Date.now()}@example.com`,
        birthDate: new Date('1999-01-01'),
        employeeNumber: 'EMP' + Math.floor(Math.random() * 10000),
        salary: 100000,
        role: 'CEO',
      });
      await refetch();
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? 'Failed to add employee');
    } finally {
      setAdding(false);
    }
  };

  const exportCSV = () => {
    try {
      setExporting(true);
      const rows = employees;
      if (!rows?.length) {
        alert('No employees to export.');
        return;
      }
      const header = [
        'id',
        'name',
        'surname',
        'email',
        'birthDate',
        'employeeNumber',
        'salary',
        'role',
        'manager',
        'createdAt',
        'updatedAt',
      ];
      const csv = [
        header.join(','),
        ...rows.map((e) =>
          [
            e.id,
            csvQuote(e.name),
            csvQuote(e.surname),
            e.email,
            e.birthDate ? e.birthDate.toISOString() : '',
            e.employeeNumber ?? '',
            e.salary ?? 0,
            csvQuote(e.role ?? ''),
            e.manager ?? '',
            e.createdAt ? e.createdAt.toISOString() : '',
            e.updatedAt ? e.updatedAt.toISOString() : '',
          ].join(',')
        ),
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'employees.csv';
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  // ----- UI helpers -----
  const csvQuote = (s?: string) => `"${(s ?? '').replace(/"/g, '""')}"`;

  // ----- Rendering -----
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Header
          onExport={exportCSV}
          onAdd={handleQuickAdd}
          exporting={exporting}
          adding={adding}
        />
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">Loading…</div>
          </CardContent>
        </Card>
        <div className="text-sm text-muted-foreground">Loading employees…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Header
          onExport={exportCSV}
          onAdd={handleQuickAdd}
          exporting={exporting}
          adding={adding}
        />
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <EmployeeFilters filters={filters} onFiltersChange={setFilters} />
          </CardContent>
        </Card>
        <div className="text-red-600">
          Failed to load employees. <button className="underline" onClick={() => refetch()}>Retry</button>
        </div>
      </div>
    );
  }

  const hasData = employees.length > 0;

  return (
    <div className="space-y-6">
      <Header
        onExport={exportCSV}
        onAdd={handleQuickAdd}
        exporting={exporting}
        adding={adding}
        total={pagination?.total}
      />

      <Card className="hover-lift">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <EmployeeFilters filters={filters} onFiltersChange={setFilters} />
        </CardContent>
      </Card>

      {!hasData ? (
        <EmptyState onAdd={handleQuickAdd} adding={adding} />
      ) : (
        <EmployeeTable
          data={employees}
          allEmployees={allEmployees}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          // If your table supports pagination props, pass them here:
          // page={pagination.page} onPageChange={setPage} pageSize={pagination.limit}
        />
      )}
    </div>
  );
}

/* ------------------ Small presentational bits ------------------ */

function Header({
  onExport,
  onAdd,
  exporting,
  adding,
  total,
}: {
  onExport: () => void;
  onAdd: () => void;
  exporting: boolean;
  adding: boolean;
  total?: number;
}) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-playfair font-bold text-foreground">Employees</h1>
        <p className="text-muted-foreground mt-1">
          Manage your team members{typeof total === 'number' ? ` • ${total} total` : ''}
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onExport} disabled={exporting}>
          <Download className="mr-2 h-4 w-4" />
          {exporting ? 'Exporting…' : 'Export CSV'}
        </Button>
        <Button className="bg-gradient-primary hover:opacity-90" onClick={onAdd} disabled={adding}>
          <UserPlus className="mr-2 h-4 w-4" />
          {adding ? 'Adding…' : 'Add Employee'}
        </Button>
      </div>
    </div>
  );
}

function EmptyState({ onAdd, adding }: { onAdd: () => void; adding: boolean }) {
  return (
    <Card className="hover-lift">
      <CardContent className="py-12 text-center">
        <div className="text-lg font-medium">No employees found</div>
        <p className="text-muted-foreground mt-1">Start by adding your first employee.</p>
        <div className="mt-4">
          <Button className="bg-gradient-primary hover:opacity-90" onClick={onAdd} disabled={adding}>
            <UserPlus className="mr-2 h-4 w-4" />
            {adding ? 'Adding…' : 'Add Employee'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
