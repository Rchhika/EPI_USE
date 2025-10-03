import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingText } from '@/components/ui/loading';
import { EmployeeAvatar } from '@/components/ui/avatar';
import { useEmployees } from '@/hooks/useEmployees';
import type { Employee } from '@/types/employee';

export default function Dashboard() {
  const navigate = useNavigate();
  const { employees, total, isLoading, error } = useEmployees();

  // ---------- helpers ----------
  const toDate = (d?: Date | string) =>
    d instanceof Date ? d : d ? new Date(d) : undefined;

  const inLastDays = (d: Date | undefined, days: number) => {
    if (!d) return false;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return d >= cutoff;
  };

  // ---------- derived metrics ----------
  const {
    totalEmployees,
    new30,
    newPrev30,
    deltaNew30,
    avgSalary,
    totalPayroll,
    managersCount,
    recentHires,
  } = useMemo(() => {
    // Use server total so KPIs reflect the whole DB
    const totalEmployees = total ?? employees.length;

    // windows for last 30d and the previous 30d
    const now = new Date();
    const start30 = new Date(now); start30.setDate(start30.getDate() - 30);
    const start60 = new Date(now); start60.setDate(start60.getDate() - 60);

    let new30 = 0;
    let newPrev30 = 0;

    const salaries: number[] = [];
    const managerRefs = new Set<string>();

    for (const e of employees) {
      const created = toDate(e.createdAt);
      if (created) {
        if (created >= start30) new30 += 1;
        else if (created >= start60) newPrev30 += 1;
      }
      if (typeof e.salary === 'number') salaries.push(e.salary);
      if (e.manager) managerRefs.add(String(e.manager));
    }

    const managersCount = managerRefs.size;

    const avgSalary =
      salaries.length
        ? Math.round(salaries.reduce((a, b) => a + b, 0) / salaries.length)
        : 0;

    const totalPayroll = salaries.reduce((a, b) => a + b, 0);

    const recentHires = employees
      .filter((e) => inLastDays(toDate(e.createdAt), 90))
      .sort(
        (a, b) =>
          (toDate(b.createdAt)?.getTime() ?? 0) -
          (toDate(a.createdAt)?.getTime() ?? 0)
      )
      .slice(0, 8);

    return {
      totalEmployees,
      new30,
      newPrev30,
      deltaNew30: new30 - newPrev30,
      avgSalary,
      totalPayroll,
      managersCount,
      recentHires,
    };
  }, [employees, total]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-playfair font-bold text-foreground">EPI_USE_EMS</h1>
          <p className="text-muted-foreground mt-1">
            Welcome to the Employee Management System
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-5">
        <KpiCard
          className="xl:col-span-2"
          title="Total Employees"
          value={isLoading ? '—' : String(totalEmployees)}
          sub={isLoading ? 'Loading…' : `All current records`}
          icon="👥"
        />
        <KpiCard
          className="xl:col-span-2"
          title="New Hires (30d)"
          value={isLoading ? '—' : String(new30)}
          sub={isLoading ? undefined : deltaBadge(deltaNew30, 'vs prev 30d')}
          icon="✨"
        />
        <KpiCard
          className="xl:col-span-2"
          title="Avg Salary"
          value={isLoading ? '—' : `$${formatMoney(avgSalary)}`}
          sub="Weighted by current employees"
          icon="💵"
        />
        <KpiCard
          className="xl:col-span-2"
          title="Total Payroll"
          value={isLoading ? '—' : `$${formatMoney(totalPayroll)}`}
          sub="(annual total)"
          icon="📈"
        />
        <KpiCard
          className="xl:col-span-2"
          title="Managers"
          value={isLoading ? '—' : String(managersCount)}
          sub="People managing others"
          icon="🧭"
        />
        {/* Leave the last slot for a future KPI or keep the grid tight */}
        <div className="xl:col-span-2 hidden xl:block" />
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Hires */}
        <Card className="card-premium">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <span>Recent Hires</span>
            </CardTitle>
            <p className="text-sm text-muted-foreground">New employees in the last 90 days</p>
          </CardHeader>
          <CardContent>
            {error ? (
              <p className="text-sm text-red-600">Failed to load data.</p>
            ) : isLoading ? (
              <LoadingText variant="futuristic" text="Loading recent hires..." />
            ) : recentHires.length === 0 ? (
              <p className="text-sm text-muted-foreground">No new hires in the last 90 days.</p>
            ) : (
              <ul className="divide-y">
                {recentHires.map((e) => (
                  <li key={e.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <EmployeeAvatar 
                        employee={e} 
                        size={32}
                        className="flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-medium truncate">
                          {e.name} {e.surname}
                          {e.role ? (
                            <span className="text-muted-foreground font-normal"> — {e.role}</span>
                          ) : null}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">{e.email}</div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground ml-3 shrink-0">
                      {e.createdAt ? formatDate(e.createdAt) : ''}
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="pt-4">
              <Button variant="outline" size="sm" onClick={() => navigate('/employees')} className="btn-outline-polished">
                View all employees
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* At a Glance */}
        <Card className="card-premium">
          <CardHeader className="pb-3">
            <CardTitle>At a Glance</CardTitle>
            <p className="text-sm text-muted-foreground">Quick insights</p>
          </CardHeader>
          <CardContent className="space-y-3">
            <InsightRow
              label="Employees with salary set"
              value={String(employees.filter((e) => typeof e.salary === 'number').length)}
            />
            <InsightRow
              label="Employees without manager"
              value={String(employees.filter((e) => !e.manager).length)}
            />
            <InsightRow
              label="Roles in use"
              value={String(new Set(employees.map((e) => e.role).filter(Boolean)).size)}
            />
            <InsightRow
              label="Newest employee"
              value={(() => {
                const newest = [...employees].sort(
                  (a, b) =>
                    (toDate(b.createdAt)?.getTime() ?? 0) -
                    (toDate(a.createdAt)?.getTime() ?? 0)
                )[0];
                return newest ? `${newest.name} ${newest.surname}` : '—';
              })()}
            />
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="card-premium">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <ActionButton label="View All Employees" onClick={() => navigate('/employees')} />
            <ActionButton label="Organization Chart" onClick={() => navigate('/org-chart')} />
            <ActionButton label="Export CSV" onClick={() => navigate('/employees')} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ---------- small components & utils ---------- */

function KpiCard({
  title,
  value,
  sub,
  icon,
  className = '',
}: {
  title: string;
  value: string;
  sub?: string | JSX.Element;
  icon?: string;
  className?: string;
}) {
  return (
    <Card className={`card-premium ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          {icon ? <span className="text-lg">{icon}</span> : null}
          <span>{title}</span>
        </CardTitle>
        {sub ? <div className="text-sm text-muted-foreground">{sub}</div> : null}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold tracking-tight">{value}</div>
      </CardContent>
    </Card>
  );
}

function ActionButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button
      variant="outline"
      className="w-full h-20 rounded-2xl btn-outline-polished"
      onClick={onClick}
    >
      {label}
    </Button>
  );
}

function InsightRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}

function deltaBadge(delta: number, suffix: string) {
  const positive = delta > 0;
  const neutral = delta === 0;
  const cls = positive
    ? 'text-green-600'
    : neutral
    ? 'text-muted-foreground'
    : 'text-red-600';
  const sign = positive ? '+' : '';
  return <span className={cls}>{`${sign}${delta} ${suffix}`}</span>;
}

function formatMoney(n: number) {
  return n.toLocaleString('en-US');
}

function formatDate(d: Date | string) {
  const date = d instanceof Date ? d : new Date(d);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
