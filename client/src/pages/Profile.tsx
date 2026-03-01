import { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import AuthGate from '@/components/shared/AuthGate';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
import { User, Lock } from 'lucide-react';
import { authApi } from '@/services/api';

const Profile = () => {
  const { user, refreshProfile } = useAuth();
  const [displayName, setDisplayName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    setDisplayName(user?.name || '');
  }, [user?.name]);

  const handleUpdateName = async () => {
    if (!displayName.trim()) {
      toast({ title: 'Lỗi', description: 'Tên không được để trống.', variant: 'destructive' });
      return;
    }

    try {
      setIsUpdatingName(true);
      await authApi.updateProfile({ displayname: displayName.trim() });
      await refreshProfile();
      toast({ title: 'Thành công', description: 'Đã cập nhật tên hiển thị.' });
    } catch (error: any) {
      toast({
        title: 'Cập nhật thất bại',
        description: error?.response?.data?.message || error?.response?.data?.errors?.[0] || 'Vui lòng thử lại.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingName(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword) {
      toast({ title: 'Lỗi', description: 'Vui lòng nhập mật khẩu hiện tại.', variant: 'destructive' });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: 'Lỗi', description: 'Mật khẩu xác nhận không khớp.', variant: 'destructive' });
      return;
    }
    if (newPassword.length < 8) {
      toast({ title: 'Lỗi', description: 'Mật khẩu phải ít nhất 8 ký tự.', variant: 'destructive' });
      return;
    }

    try {
      setIsChangingPassword(true);
      const result = await authApi.changePassword({
        currentPassword,
        newPassword,
      });
      toast({ title: 'Thành công', description: result?.message || 'Đã đổi mật khẩu.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast({
        title: 'Đổi mật khẩu thất bại',
        description: error?.response?.data?.message || error?.response?.data?.errors?.[0] || 'Vui lòng thử lại.',
        variant: 'destructive',
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <Layout>
      <section className="py-8">
        <div className="container max-w-xl space-y-8">
          <h1 className="font-display text-2xl font-bold text-foreground">Tài khoản</h1>

          <AuthGate message="Đăng nhập để xem thông tin tài khoản">
            <div className="space-y-8">
              <div className="bg-card rounded-xl border border-border p-6 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-5 w-5 text-accent" />
                  <h2 className="font-display font-semibold text-foreground">Tên hiển thị</h2>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Tên</Label>
                  <Input value={displayName} onChange={e => setDisplayName(e.target.value)} />
                </div>
                <Button onClick={handleUpdateName} className="gradient-accent text-white" disabled={!displayName.trim() || isUpdatingName}>
                  {isUpdatingName ? 'Đang cập nhật...' : 'Cập nhật'}
                </Button>
              </div>

              <div className="bg-card rounded-xl border border-border p-6 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="h-5 w-5 text-accent" />
                  <h2 className="font-display font-semibold text-foreground">Đổi mật khẩu</h2>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Mật khẩu hiện tại</Label>
                  <Input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Mật khẩu mới</Label>
                  <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Xác nhận mật khẩu mới</Label>
                  <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-xs text-destructive">Mật khẩu không khớp</p>
                  )}
                </div>
                <Button
                  onClick={handleChangePassword}
                  className="gradient-accent text-white"
                  disabled={!currentPassword || !newPassword || newPassword.length < 8 || newPassword !== confirmPassword || isChangingPassword}
                >
                  {isChangingPassword ? 'Đang đổi...' : 'Đổi mật khẩu'}
                </Button>
              </div>
            </div>
          </AuthGate>
        </div>
      </section>
    </Layout>
  );
};

export default Profile;
