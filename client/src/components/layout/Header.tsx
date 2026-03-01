import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Car, Menu, X, User, LogOut, ChevronDown, Phone, Heart, Gavel, ListChecks, Settings, Shield } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import AuthModal from '@/components/auth/AuthModal';
import ThemeToggle from './ThemeToggle';

const NAV_LINKS = [
  { label: 'Mua xe', to: '/cars' },
  { label: 'Bán xe', to: '/sell' },
  { label: 'Định giá xe', to: '/evaluate' },
];

const USER_MENU = [
  { label: 'Tài khoản', to: '/profile', icon: Settings },
  { label: 'Xe đang đấu giá', to: '/my-bids', icon: Gavel },
  { label: 'Tiến độ bán xe', to: '/my-listings', icon: ListChecks },
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const isAdminPage = location.pathname.startsWith('/admin');

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    setIsMenuOpen(false);
    navigate('/');
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/90 shadow-soft">
        <div className="container flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link to={isAdminPage ? '/admin' : '/'} className="flex items-center gap-2 shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
              <Car className="h-5 w-5 text-white" />
            </div>
            <span className="font-display text-xl font-bold text-foreground hidden sm:block">
              {isAdminPage ? 'AutoMarket Admin' : 'AutoMarket'}
            </span>
          </Link>

          {/* Nav links - hide on admin */}
          {!isAdminPage && (
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <Link key={link.to} to={link.to} className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                  {link.label}
                </Link>
              ))}
            </nav>
          )}

          {/* Right side */}
          <div className="hidden md:flex items-center gap-2">
            {!isAdminPage && (
              <a href="tel:19001234" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Phone className="h-4 w-4" />
                <span className="font-medium">1900 1234</span>
              </a>
            )}

            <ThemeToggle />

            {isAuthenticated ? (
              <div className="relative ml-2" ref={userMenuRef}>
                <button
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary transition-colors text-sm font-medium"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                >
                  <div className="h-7 w-7 rounded-full bg-accent/20 flex items-center justify-center">
                    <User className="h-4 w-4 text-accent" />
                  </div>
                  <span className="text-foreground">{user?.name}</span>
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-52 bg-card rounded-xl border border-border shadow-card py-1 z-50">
                    {!isAdminPage && USER_MENU.map(item => (
                      <Link
                        key={item.to}
                        to={item.to}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <item.icon className="h-4 w-4 text-muted-foreground" />
                        {item.label}
                      </Link>
                    ))}
                    {user?.role === 'admin' && !isAdminPage && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        Admin Dashboard
                      </Link>
                    )}
                    {isAdminPage && (
                      <Link
                        to="/"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Car className="h-4 w-4 text-muted-foreground" />
                        Về trang chính
                      </Link>
                    )}
                    <div className="border-t border-border my-1" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 w-full transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Button variant="default" size="sm" className="ml-2 gradient-accent text-white" onClick={() => setIsAuthOpen(true)}>
                <User className="h-4 w-4" />
                Tài khoản
              </Button>
            )}
          </div>

          {/* Mobile */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            {isAuthenticated ? (
              <button
                className="p-2 rounded-lg hover:bg-secondary transition-colors"
                onClick={handleLogout}
                aria-label="Đăng xuất"
              >
                <LogOut className="h-5 w-5 text-destructive" />
              </button>
            ) : (
              <Button size="sm" className="gradient-accent text-white" onClick={() => setIsAuthOpen(true)}>
                <User className="h-4 w-4" />
              </Button>
            )}
            <button className="p-2 rounded-lg hover:bg-secondary transition-colors" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden border-t border-border bg-card">
            <nav className="container py-3 flex flex-col gap-1">
              {!isAdminPage && NAV_LINKS.map((link) => (
                <Link key={link.to} to={link.to} className="px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" onClick={() => setIsMenuOpen(false)}>
                  {link.label}
                </Link>
              ))}
              {isAuthenticated && !isAdminPage && USER_MENU.map(item => (
                <Link key={item.to} to={item.to} className="px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" onClick={() => setIsMenuOpen(false)}>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
};

export default Header;
