import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Users, BarChart3, Network, Menu, X, Building } from 'lucide-react';
import { logout } from '@/features/auth/api';
import { useAuth } from '@/features/auth/useAuth';

const navigation = [
  { name: 'Dashboard', href: '/', icon: BarChart3 },
  { name: 'Employees', href: '/employees', icon: Users },
  { name: 'Org Chart', href: '/org-chart', icon: Network },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { queryClient } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-custom-md">
              <Building className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-playfair font-bold text-foreground">EPI_USE_EMS</h1>
              <p className="text-xs text-muted-foreground">Employee Management</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Button
                  key={item.name}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  asChild
                  className={isActive ? "bg-gradient-primary hover:opacity-90" : ""}
                >
                  <Link to={item.href} className="flex items-center space-x-2">
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                </Button>
              );
            })}
          </nav>

          {/* Auth Actions */}
          <div className="hidden md:flex items-center space-x-3">
            <Button
              variant="ghost"
              onClick={async () => {
                await logout();
                await queryClient.invalidateQueries({ queryKey: ['me'] });
                navigate('/login');
              }}
            >
              Logout
            </Button>
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="px-4 py-3 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            
            <div className="pt-3 mt-3 border-t border-border">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={async () => {
                  await logout();
                  await queryClient.invalidateQueries({ queryKey: ['me'] });
                  setMobileMenuOpen(false);
                  navigate('/login');
                }}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}