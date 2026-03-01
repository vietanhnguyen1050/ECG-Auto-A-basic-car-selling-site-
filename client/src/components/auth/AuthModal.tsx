import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, X, User, Lock, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

const loginSchema = z.object({
  credential: z.string().min(1, 'Vui lòng nhập email hoặc số điện thoại'),
  password: z.string().min(8, 'Mật khẩu tối thiểu 8 ký tự'),
});

const registerSchema = z
  .object({
    displayname: z
      .string()
      .max(50, 'Tên hiển thị tối đa 50 ký tự')
      .optional()
      .or(z.literal('')),
    email: z.string().min(1, 'Vui lòng nhập email').email('Email không hợp lệ'),
    phonenumber: z.string().regex(/^0\d{9,10}$/, 'Số điện thoại không hợp lệ'),
    password: z.string().min(8, 'Mật khẩu tối thiểu 8 ký tự'),
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

const Field = ({ label, icon: Icon, error, children }: { label: string; icon: React.ElementType; error?: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <Label className="text-sm font-medium text-foreground">{label}</Label>
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      {children}
    </div>
    {error && <p className="text-xs text-destructive">{error}</p>}
  </div>
);

const PasswordInput = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'> & { error?: string }>(
  ({ error, className, ...props }, ref) => {
    const [show, setShow] = useState(false);
    return (
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          ref={ref}
          type={show ? 'text' : 'password'}
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-10 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-destructive',
            className,
          )}
          {...props}
        />
        <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    );
  }
);
PasswordInput.displayName = 'PasswordInput';

const LoginForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const { login } = useAuth();
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login({ credential: data.credential, password: data.password });
      toast({ title: 'Đăng nhập thành công!' });
      onSuccess();
    } catch (err: any) {
      toast({
        title: 'Đăng nhập thất bại',
        description: err?.response?.data?.message || err?.message || 'Vui lòng thử lại',
        variant: 'destructive',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Field label="Email hoặc số điện thoại" icon={User} error={errors.credential?.message}>
        <Input className="pl-9" placeholder="example@email.com hoặc 0912345678" {...register('credential')} />
      </Field>
      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-foreground">Mật khẩu</Label>
        <PasswordInput placeholder="••••••••" error={errors.password?.message} {...register('password')} />
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
      </div>
      <div className="flex justify-end">
        <button type="button" className="text-xs text-accent hover:underline">Quên mật khẩu?</button>
      </div>
      <Button type="submit" className="w-full gradient-accent text-accent-foreground" disabled={isSubmitting}>
        {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
      </Button>
    </form>
  );
};

const RegisterForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const { register: authRegister } = useAuth();
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await authRegister({
        displayname: data.displayname?.trim() || undefined,
        email: data.email.trim(),
        phonenumber: data.phonenumber.trim(),
        password: data.password,
      });
      toast({ title: 'Đăng ký thành công!' });
      onSuccess();
    } catch (err: any) {
      toast({
        title: 'Đăng ký thất bại',
        description: err?.response?.data?.message || err?.message || 'Vui lòng thử lại',
        variant: 'destructive',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Field label="Họ và tên" icon={User} error={errors.displayname?.message}>
        <Input className="pl-9" placeholder="Nguyễn Văn A" {...register('displayname')} />
      </Field>
      <Field label="Email" icon={Mail} error={errors.email?.message}>
        <Input className="pl-9" type="email" placeholder="example@email.com" required {...register('email')} />
      </Field>
      <Field label="Số điện thoại" icon={Phone} error={errors.phonenumber?.message}>
        <Input className="pl-9" type="tel" placeholder="0912345678" {...register('phonenumber')} />
      </Field>
      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-foreground">Mật khẩu</Label>
        <PasswordInput placeholder="Tối thiểu 8 ký tự" error={errors.password?.message} {...register('password')} />
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-foreground">Xác nhận mật khẩu</Label>
        <PasswordInput placeholder="Nhập lại mật khẩu" error={errors.confirmPassword?.message} {...register('confirmPassword')} />
        {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
      </div>
      <Button type="submit" className="w-full gradient-accent text-accent-foreground" disabled={isSubmitting}>
        {isSubmitting ? 'Đang đăng ký...' : 'Đăng ký'}
      </Button>
    </form>
  );
};

type Tab = 'login' | 'register';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: Tab;
}

const AuthModal = ({ isOpen, onClose, defaultTab = 'login' }: AuthModalProps) => {
  const [tab, setTab] = useState<Tab>(defaultTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-card rounded-2xl shadow-xl border border-border overflow-hidden animate-fade-in">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 p-1.5 rounded-full hover:bg-secondary transition-colors"
          aria-label="Đóng"
          title="Đóng"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
        <div className="flex border-b border-border">
          {(['login', 'register'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'flex-1 py-4 text-sm font-semibold transition-colors',
                tab === t ? 'text-accent border-b-2 border-accent bg-accent/5' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {t === 'login' ? 'Đăng nhập' : 'Đăng ký'}
            </button>
          ))}
        </div>
        <div className="p-6">
          {tab === 'login' ? <LoginForm onSuccess={onClose} /> : <RegisterForm onSuccess={() => setTab('login')} />}
          <p className="mt-5 text-center text-xs text-muted-foreground">
            {tab === 'login' ? (
              <>Chưa có tài khoản?{' '}<button onClick={() => setTab('register')} className="text-accent hover:underline font-medium">Đăng ký ngay</button></>
            ) : (
              <>Đã có tài khoản?{' '}<button onClick={() => setTab('login')} className="text-accent hover:underline font-medium">Đăng nhập</button></>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
