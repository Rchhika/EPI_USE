import { useState } from 'react';
import { EmployeeFilters } from '@/types/employee';
import { EMPLOYEE_ROLES } from '@/types/employee';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toSelectValue } from '@/lib/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Filter, X, Search } from 'lucide-react';

interface EmployeeFiltersProps {
  filters: EmployeeFilters;
  onFiltersChange: (filters: EmployeeFilters) => void;
}

export default function EmployeeFiltersComponent({ filters, onFiltersChange }: EmployeeFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const updateFilter = (key: keyof EmployeeFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.keys(filters).some(key => {
    const value = filters[key as keyof EmployeeFilters];
    return value !== undefined && value !== '' && value !== null;
  });

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
      {/* Search */}
      <div className="relative flex-1 min-w-0">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search employees..."
          value={filters.search || ''}
          onChange={(e) => updateFilter('search', e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Quick Role Filter */}
      <Select value={toSelectValue(filters.role)} onValueChange={(value) => updateFilter('role', value === 'all' ? undefined : value)}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Any role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All roles</SelectItem>
          {EMPLOYEE_ROLES.map((role) => (
            <SelectItem key={role} value={role}>
              {role}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Advanced Filters */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="relative">
            <Filter className="mr-2 h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full"></div>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="end">
          <Card className="border-0 shadow-none">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Advanced Filters</h3>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="mr-2 h-4 w-4" />
                    Clear All
                  </Button>
                )}
              </div>

              {/* Manager Filter */}
              <div className="space-y-2">
                <Label htmlFor="hasManager">Manager Assignment</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="hasManager"
                    checked={filters.hasManager === true}
                    onCheckedChange={(checked) => 
                      updateFilter('hasManager', checked ? true : undefined)
                    }
                  />
                  <Label htmlFor="hasManager" className="text-sm">Has Manager</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="noManager"
                    checked={filters.hasManager === false}
                    onCheckedChange={(checked) => 
                      updateFilter('hasManager', checked ? false : undefined)
                    }
                  />
                  <Label htmlFor="noManager" className="text-sm">No Manager</Label>
                </div>
              </div>

              {/* Salary Range */}
              <div className="space-y-2">
                <Label>Salary Range</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="salaryMin" className="text-xs text-muted-foreground">Min</Label>
                    <Input
                      id="salaryMin"
                      type="number"
                      placeholder="Min salary"
                      value={filters.salaryMin || ''}
                      onChange={(e) => 
                        updateFilter('salaryMin', e.target.value ? Number(e.target.value) : undefined)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="salaryMax" className="text-xs text-muted-foreground">Max</Label>
                    <Input
                      id="salaryMax"
                      type="number"
                      placeholder="Max salary"
                      value={filters.salaryMax || ''}
                      onChange={(e) => 
                        updateFilter('salaryMax', e.target.value ? Number(e.target.value) : undefined)
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Birth Date Range */}
              <div className="space-y-2">
                <Label>Birth Date Range</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="birthDateFrom" className="text-xs text-muted-foreground">From</Label>
                    <Input
                      id="birthDateFrom"
                      type="date"
                      value={filters.birthDateFrom ? filters.birthDateFrom.toISOString().split('T')[0] : ''}
                      onChange={(e) => 
                        updateFilter('birthDateFrom', e.target.value ? new Date(e.target.value) : undefined)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="birthDateTo" className="text-xs text-muted-foreground">To</Label>
                    <Input
                      id="birthDateTo"
                      type="date"
                      value={filters.birthDateTo ? filters.birthDateTo.toISOString().split('T')[0] : ''}
                      onChange={(e) => 
                        updateFilter('birthDateTo', e.target.value ? new Date(e.target.value) : undefined)
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </PopoverContent>
      </Popover>
    </div>
  );
}