import { useState } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { Employee } from '@/types/employee';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ArrowUpDown, MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react';
import { getGravatarUrl, getInitials } from '@/utils/gravatar';
import { format } from 'date-fns';

interface EmployeeTableProps {
  data: Employee[];
  allEmployees: Employee[];
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
  onView: (employee: Employee) => void;
}

export default function EmployeeTable({ 
  data, 
  allEmployees, 
  onEdit, 
  onDelete, 
  onView 
}: EmployeeTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const getManagerName = (managerId?: string) => {
    if (!managerId) return 'No Manager';
    const manager = allEmployees.find(emp => emp.id === managerId);
    return manager ? `${manager.name} ${manager.surname}` : 'Unknown';
  };

  const columns: ColumnDef<Employee>[] = [
    {
      accessorKey: 'avatar',
      header: '',
      cell: ({ row }) => {
        const employee = row.original;
        return (
          <div className="flex items-center justify-center">
            <div className="relative">
              <img
                src={getGravatarUrl(employee.email, 32)}
                alt={`${employee.name} ${employee.surname}`}
                className="h-8 w-8 rounded-full shadow-custom-sm"
              />
              <div className="absolute inset-0 rounded-full bg-gradient-primary opacity-10"></div>
            </div>
          </div>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 px-2 lg:px-3"
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const employee = row.original;
        return (
          <div className="font-medium">
            <div className="text-sm text-foreground">{employee.name} {employee.surname}</div>
            <div className="text-xs text-muted-foreground">{employee.employeeNumber}</div>
          </div>
        );
      },
    },
    {
      accessorKey: 'email',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 px-2 lg:px-3"
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">{row.getValue('email')}</div>
      ),
    },
    {
      accessorKey: 'role',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 px-2 lg:px-3"
        >
          Role
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <Badge variant="secondary" className="text-xs">
          {row.getValue('role')}
        </Badge>
      ),
    },
    {
      accessorKey: 'manager',
      header: 'Manager',
      cell: ({ row }) => {
        const employee = row.original;
        const managerName = getManagerName(employee.manager);
        return (
          <div className="text-sm text-muted-foreground">
            {managerName}
          </div>
        );
      },
    },
    {
      accessorKey: 'salary',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 px-2 lg:px-3"
        >
          Salary
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue('salary'));
        const formatted = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(amount);

        return <div className="text-sm font-medium">{formatted}</div>;
      },
    },
    {
      accessorKey: 'birthDate',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 px-2 lg:px-3"
        >
          Birth Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const date = row.getValue('birthDate') as Date;
        return <div className="text-sm text-muted-foreground">{format(date, 'MMM dd, yyyy')}</div>;
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const employee = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onView(employee)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(employee)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Employee
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDelete(employee)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Employee
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      enableSorting: false,
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  return (
    <div className="rounded-xl border border-border bg-card shadow-custom-md overflow-hidden">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="bg-muted/50">
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="font-medium">
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
                className="hover:bg-muted/50 transition-colors"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                <div className="flex flex-col items-center justify-center text-muted-foreground">
                  <p>No employees found.</p>
                  <p className="text-sm">Try adjusting your search or filters.</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}