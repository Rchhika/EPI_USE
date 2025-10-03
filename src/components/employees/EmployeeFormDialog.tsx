import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmployeeAvatar } from "@/components/ui/avatar";
import { EMPLOYEE_ROLES } from "@/types/employee";

/**
 * IMPORTANT:
 * Keep salary as STRING in the form schema to avoid zod -> RHF type mismatch.
 * Validate it's numeric if provided; convert to number in the parent before POST.
 */
const schema = z.object({
    name: z.string().min(1, "Required"),
    surname: z.string().min(1, "Required"),
    email: z.string().email("Invalid email"),
    birthDate: z.string().optional(),
    employeeNumber: z.string().min(1, "Required"), // <-- was optional
    salary: z
      .string()
      .optional()
      .refine((v) => v === undefined || v === "" || !Number.isNaN(Number(v)), "Must be a number"),
    role: z.string().min(1, "Required"),
    manager: z.string().optional(),
  });

export type EmployeeFormValues = z.infer<typeof schema>;
// => salary?: string | undefined

type Props = {
  open: boolean;
  title: string;
  submitting?: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmit: (values: EmployeeFormValues) => Promise<void> | void; // parent will convert salary
  managers: { id: string; name: string; surname: string }[];
  defaultValues?: Partial<EmployeeFormValues>;
};

export default function EmployeeFormDialog({
  open, onOpenChange, title, managers, submitting, onSubmit, defaultValues
}: Props) {
  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "", surname: "", email: "",
      birthDate: "", employeeNumber: "",
      salary: "", role: "", manager: "",
    },
  });

  const values = form.watch();

  // Reset form when defaultValues change (for edit mode)
  useEffect(() => {
    if (defaultValues) {
      form.reset(defaultValues);
    } else {
      form.reset({
        name: "", surname: "", email: "",
        birthDate: "", employeeNumber: "",
        salary: "", role: "", manager: "",
      });
    }
  }, [defaultValues, form]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      form.reset({
        name: "", surname: "", email: "",
        birthDate: "", employeeNumber: "",
        salary: "", role: "", manager: "",
      });
    }
  }, [open, form]);

  // Explicitly type vals to EmployeeFormValues
  const handleSubmit = form.handleSubmit(async (vals) => {
    const payload: EmployeeFormValues = {
      ...vals,
      manager: vals.manager === "__none__" ? undefined : vals.manager,
    };
    try {
      await onSubmit(payload);
      onOpenChange(false);        
      // Reset form to default values after successful submit
      form.reset({
        name: "", surname: "", email: "",
        birthDate: "", employeeNumber: "",
        salary: "", role: "", manager: "",
      });
    } catch (err: any) {
        const msg = err?.message || 'Failed to save employee';
        if (/employee number/i.test(msg)) {
          form.setError('employeeNumber', { type: 'manual', message: msg });
        } else {
          alert(msg);
        }
        console.error('Create/Update failed:', err);
      }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 overflow-visible">
          {/* Avatar Preview */}
          {(values.name || values.surname || values.email) && (
            <div className="flex items-center space-x-4 p-4 bg-muted/30 rounded-lg border border-border/50">
              <EmployeeAvatar 
                employee={{
                  name: values.name || '',
                  surname: values.surname || '',
                  email: values.email || ''
                }} 
                size={48}
                className="flex-shrink-0"
              />
              <div className="text-sm text-muted-foreground">
                <div className="font-medium">Avatar Preview</div>
                <div className="text-xs">Gravatar will be automatically generated from email</div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label>Name</Label>
              <Input {...form.register("name")} className="input-solid" />
              <FieldError msg={form.formState.errors.name?.message} />
            </div>
            <div>
              <Label>Surname</Label>
              <Input {...form.register("surname")} className="input-solid" />
              <FieldError msg={form.formState.errors.surname?.message} />
            </div>
          </div>

          <div>
            <Label>Email</Label>
            <Input type="email" {...form.register("email")} className="input-solid" />
            <FieldError msg={form.formState.errors.email?.message} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label>Birth date</Label>
              <Input
                type="date"
                value={values.birthDate ?? ""}
                onChange={(e) => form.setValue("birthDate", e.target.value)}
                className="input-solid"
              />
              <FieldError msg={form.formState.errors.birthDate?.message} />
            </div>
            <div>
              <Label>Employee #</Label>
              <Input {...form.register("employeeNumber")} className="input-solid" />
              <FieldError msg={form.formState.errors.employeeNumber?.message} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label>Salary</Label>
              <Input type="number" step="1" inputMode="numeric" {...form.register("salary")} className="input-solid" />
              <FieldError msg={form.formState.errors.salary?.message?.toString()} />
            </div>
            <div>
              <Label>Role</Label>
              <Select
                value={values.role || undefined}
                onValueChange={(v) => form.setValue("role", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" className="truncate text-center" />
                </SelectTrigger>
                <SelectContent position="popper">
                  {EMPLOYEE_ROLES.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError msg={form.formState.errors.role?.message} />
            </div>
          </div>

          <div>
            <Label>Manager (optional)</Label>
            <Select
              value={values.manager || undefined}
              onValueChange={(v) => form.setValue("manager", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a manager" className="truncate text-center" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="__none__">No manager</SelectItem>
                {managers.map(m => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name} {m.surname}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="btn-outline-polished">Cancel</Button>
            <Button type="submit" disabled={submitting} className="btn-primary-polished">{submitting ? "Saving…" : "Save"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-sm text-red-600 mt-1">{msg}</p>;
}
