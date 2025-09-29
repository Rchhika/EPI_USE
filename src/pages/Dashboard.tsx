import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp, Building2, UserPlus, Clock, Award } from 'lucide-react';
import { mockEmployees } from '@/data/mockEmployees';
import { getGravatarUrl } from '@/utils/gravatar';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  // Calculate KPIs
  const totalEmployees = mockEmployees.length;
  const roleDistribution = mockEmployees.reduce((acc, emp) => {
    acc[emp.role] = (acc[emp.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const unassignedEmployees = mockEmployees.filter(emp => !emp.manager).length;
  const averageSalary = Math.round(mockEmployees.reduce((sum, emp) => sum + emp.salary, 0) / totalEmployees);
  
  // Recent hires (last 90 days)
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  const recentHires = mockEmployees
    .filter(emp => emp.createdAt > ninetyDaysAgo)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);

  // Top roles by count
  const topRoles = Object.entries(roleDistribution)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 4);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-playfair font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome to EmpireHR management system</p>
        </div>
        <Button asChild className="bg-gradient-primary hover:opacity-90">
          <Link to="/employees">
            <UserPlus className="mr-2 h-4 w-4" />
            Add Employee
          </Link>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalEmployees}</div>
            <p className="text-xs text-success">+2 from last month</p>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Salary</CardTitle>
            <TrendingUp className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">${averageSalary.toLocaleString()}</div>
            <p className="text-xs text-success">+5% from last year</p>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Departments</CardTitle>
            <Building2 className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{Object.keys(roleDistribution).length}</div>
            <p className="text-xs text-muted-foreground">Active roles</p>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Unassigned</CardTitle>
            <Award className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{unassignedEmployees}</div>
            <p className="text-xs text-warning">Need managers</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Hires */}
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Recent Hires
            </CardTitle>
            <CardDescription>New employees in the last 90 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentHires.map((employee) => (
                <div key={employee.id} className="flex items-center space-x-4 p-3 rounded-lg bg-gradient-card hover:bg-card-hover transition-colors">
                  <img
                    src={getGravatarUrl(employee.email, 40)}
                    alt={`${employee.name} ${employee.surname}`}
                    className="h-10 w-10 rounded-full shadow-custom-sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {employee.name} {employee.surname}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{employee.role}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {format(employee.createdAt, 'MMM dd')}
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      {employee.employeeNumber}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Role Distribution */}
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-secondary" />
              Top Roles
            </CardTitle>
            <CardDescription>Most common positions in the company</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topRoles.map(([role, count], index) => (
                <div key={role} className="flex items-center justify-between p-3 rounded-lg bg-gradient-card hover:bg-card-hover transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className={`h-3 w-3 rounded-full ${
                      index === 0 ? 'bg-primary' :
                      index === 1 ? 'bg-secondary' :
                      index === 2 ? 'bg-accent' :
                      'bg-muted-foreground'
                    }`} />
                    <span className="text-sm font-medium text-foreground">{role}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {count} employees
                    </Badge>
                    <div className="text-xs text-muted-foreground">
                      {Math.round((count / totalEmployees) * 100)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="hover-lift">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common management tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Button variant="outline" asChild className="h-20 flex-col space-y-2 hover-glow">
              <Link to="/employees">
                <Users className="h-6 w-6" />
                <span>View All Employees</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-20 flex-col space-y-2 hover-glow">
              <Link to="/org-chart">
                <Building2 className="h-6 w-6" />
                <span>Organization Chart</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2 hover-glow">
              <TrendingUp className="h-6 w-6" />
              <span>Analytics Report</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}