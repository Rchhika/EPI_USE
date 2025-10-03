import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, Download } from "lucide-react";
import EmployeeTable from "@/components/employees/EmployeeTable";
import EmployeeFilters from "@/components/employees/EmployeeFilters";
import { LoadingText } from "@/components/ui/loading";
import { useEmployees } from "@/hooks/useEmployees";
import type { Employee } from "@/types/employee";
import EmployeeFormDialog, { EmployeeFormValues } from "@/components/employees/EmployeeFormDialog";

type Mode = { type: "create" } | { type: "edit"; employee: Employee } | null;

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
    // if your hook exposes these (from earlier), great; if not, it's fine—`submitting` will stay false
    isCreating,
    isUpdating,
  } = useEmployees() as any;

  const [exporting, setExporting] = useState(false);
  const [formMode, setFormMode] = useState<Mode>(null);

  // Managers list for the dialog (id + display name)
  const managers = useMemo(
    () => allEmployees.map((e: Employee) => ({ id: e.id, name: e.name, surname: e.surname })),
    [allEmployees]
  );

  // ----- Actions -----
  const handleCreate = async (vals: EmployeeFormValues) => {
    const body = {
      ...vals,
      birthDate: vals.birthDate ? new Date(vals.birthDate) : undefined,
      salary: vals.salary ? Number(vals.salary) : undefined,
      manager: vals.manager === "__none__" ? undefined : vals.manager,
    };
    // simple client-side guard for employeeNumber
    if (!body.employeeNumber?.trim()) {
      alert("Employee number is required");
      return;
    }
    await createEmployee(body);  // will throw if backend returns error -> dialog catches it
    await refetch();
  };
  const handleUpdate = async (employee: Employee, vals: EmployeeFormValues) => {
    const body = {
      ...vals,
      birthDate: vals.birthDate ? new Date(vals.birthDate) : undefined,
      salary: vals.salary ? Number(vals.salary) : undefined,
      manager: vals.manager === "__none__" ? undefined : vals.manager,
    };
    if (!body.employeeNumber?.trim()) {
      alert("Employee number is required");
      return;
    }
    await updateEmployee({ id: employee.id, ...body }); // will throw on 409 duplicate, etc.
    await refetch();
  };

  const handleEdit = (employee: Employee) => {
    setFormMode({ type: "edit", employee });
  };

  const handleDelete = async (employee: Employee) => {
    if (!confirm(`Delete ${employee.name} ${employee.surname}?`)) return;
    await deleteEmployee(employee.id);
    await refetch();
  };


  const exportCSV = () => {
    try {
      setExporting(true);
      const rows: Employee[] = employees ?? [];
      if (!rows.length) {
        alert("No employees to export.");
        return;
      }
      const header = [
        "id",
        "name",
        "surname",
        "email",
        "birthDate",
        "employeeNumber",
        "salary",
        "role",
        "manager",
      ];
      const csv = [
        header.join(","),
        ...rows.map((e) =>
          [
            e.id,
            csvQuote(e.name),
            csvQuote(e.surname),
            e.email,
            e.birthDate ? new Date(e.birthDate as any).toISOString() : "",
            e.employeeNumber ?? "",
            e.salary ?? 0,
            csvQuote(e.role ?? ""),
            e.manager ?? "",
          ].join(",")
        ),
      ].join("\n");

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "employees.csv";
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  // ----- UI helpers -----
  const csvQuote = (s?: string) => `"${(s ?? "").replace(/"/g, '""')}"`;
  const submitting = Boolean(isCreating) || Boolean(isUpdating);

  // ----- Rendering -----
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Header onExport={exportCSV} onAdd={() => setFormMode({ type: "create" })} exporting={exporting} total={pagination?.total} />
        <Card className="card-polished">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <LoadingText variant="futuristic" text="Loading filters..." />
          </CardContent>
        </Card>
        <LoadingText variant="futuristic" text="Loading employees..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Header onExport={exportCSV} onAdd={() => setFormMode({ type: "create" })} exporting={exporting} total={pagination?.total} />
        <Card className="card-polished">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <EmployeeFilters filters={filters} onFiltersChange={setFilters} />
          </CardContent>
        </Card>
        <div className="text-red-600">
          Failed to load employees.{" "}
          <button className="underline" onClick={() => refetch()}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  const hasData = employees.length > 0;

  return (
    <div className="space-y-6">
      <Header
        onExport={exportCSV}
        onAdd={() => setFormMode({ type: "create" })}
        exporting={exporting}
        total={pagination?.total}
      />

      <Card className="card-premium">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <EmployeeFilters filters={filters} onFiltersChange={setFilters} />
        </CardContent>
      </Card>

      {!hasData ? (
        <EmptyState onAdd={() => setFormMode({ type: "create" })} />
      ) : (
        <EmployeeTable
          data={employees}
          allEmployees={allEmployees}
          onEdit={handleEdit}
          onDelete={handleDelete}
          // If your table supports pagination props, pass them here:
          // page={pagination.page} onPageChange={setPage} pageSize={pagination.limit}
        />
      )}

      {/* Create */}
      <EmployeeFormDialog
        open={formMode?.type === "create"}
        onOpenChange={(v) => !v && setFormMode(null)}
        title="Add employee"
        managers={managers}
        submitting={submitting}
        onSubmit={handleCreate}
      />

      {/* Edit */}
      <EmployeeFormDialog
        open={formMode?.type === "edit"}
        onOpenChange={(v) => !v && setFormMode(null)}
        title="Edit employee"
        managers={managers}
        submitting={submitting}
        defaultValues={
          formMode?.type === "edit"
            ? {
                name: formMode.employee.name,
                surname: formMode.employee.surname,
                email: formMode.employee.email,
                birthDate: formMode.employee.birthDate
                  ? new Date(formMode.employee.birthDate as any).toISOString().slice(0, 10)
                  : "",
                employeeNumber: formMode.employee.employeeNumber,
                salary: formMode.employee.salary != null ? String(formMode.employee.salary) : "",
                role: formMode.employee.role,
                manager: formMode.employee.manager || "",
              }
            : undefined
        }
        onSubmit={(vals) =>
          formMode?.type === "edit" ? handleUpdate(formMode.employee, vals) : Promise.resolve()
        }
      />
    </div>
  );
}

/* ------------------ Small presentational bits ------------------ */

function Header({
  onExport,
  onAdd,
  exporting,
  total,
}: {
  onExport: () => void;
  onAdd: () => void;
  exporting: boolean;
  total?: number;
}) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-playfair font-bold text-foreground">Employees</h1>
        <p className="text-muted-foreground mt-1">
          Manage your team members{typeof total === "number" ? ` • ${total} total` : ""}
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onExport} disabled={exporting} className="btn-outline-polished">
          <Download className="mr-2 h-4 w-4" />
          {exporting ? "Exporting…" : "Export CSV"}
        </Button>
        <Button className="btn-primary-polished" onClick={onAdd}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Employee
        </Button>
      </div>
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <Card className="card-premium">
      <CardContent className="py-12 text-center">
        <div className="text-lg font-medium">No employees found</div>
        <p className="text-muted-foreground mt-1">Start by adding your first employee.</p>
        <div className="mt-4">
          <Button className="btn-primary-polished" onClick={onAdd}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Employee
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
