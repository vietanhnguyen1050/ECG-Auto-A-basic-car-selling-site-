import { useAuth } from '@/context/AuthContext';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import AuthModal from '@/components/auth/AuthModal';

interface AuthGateProps {
  children: React.ReactNode;
  message?: string;
}

const AuthGate = ({ children, message = 'Vui lòng đăng nhập để sử dụng tính năng này' }: AuthGateProps) => {
  const { isAuthenticated } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  if (isAuthenticated) return <>{children}</>;

  return (
    <>
      <div className="relative">
        <div className="pointer-events-none select-none blur-sm opacity-50">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[2px] rounded-xl">
          <div className="text-center space-y-3 p-6">
            <Lock className="h-8 w-8 text-muted-foreground mx-auto" />
            <p className="text-sm text-muted-foreground max-w-xs">{message}</p>
            <Button className="gradient-accent text-white" onClick={() => setShowAuth(true)}>
              Đăng nhập
            </Button>
          </div>
        </div>
      </div>
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </>
  );
};

export default AuthGate;
