import { useEffect, useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2, Search, User, Phone, Mail, ShoppingCart } from 'lucide-react';
import type { IUser } from '@/types';
import { adminApi } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

type AdminCarRelation = {
  sellerId: string;
  buyerId: string;
};

const UsersTab = () => {
  const [users, setUsers] = useState<IUser[]>([]);
  const [cars, setCars] = useState<AdminCarRelation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const [userData, carData] = await Promise.all([adminApi.getUsers(), adminApi.getCars()]);
        const mappedUsers: IUser[] = (userData ?? []).map((user: any) => ({
          _id: user._id,
          name: user.displayname || user.email || user.phonenumber || 'Unknown',
          email: user.email || '',
          phone: user.phonenumber || '',
          role: user.role,
          createdAt: new Date(user.createdAt || Date.now()),
          updatedAt: new Date(user.updatedAt || Date.now()),
        }));
        const mappedCars: AdminCarRelation[] = (carData ?? []).map((car: any) => ({
          sellerId: String(car?.car?.seller?._id || car?.car?.seller || ''),
          buyerId: String(car?.car?.buyer?._id || car?.car?.buyer || ''),
        }));
        setUsers(mappedUsers);
        setCars(mappedCars);
      } catch (error: any) {
        toast({
          title: 'Không tải được danh sách user',
          description: error?.response?.data?.message || 'Vui lòng thử lại.',
          variant: 'destructive',
        });
      }
    };

    fetchUsers();
  }, [toast]);

  const filtered = useMemo(() => {
    if (!searchQuery) return users;
    const q = searchQuery.toLowerCase();
    return users.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.phone?.toLowerCase().includes(q));
  }, [users, searchQuery]);

  const updateRole = async (id: string, role: 'user' | 'admin') => {
    try {
      await adminApi.updateUserRole(id, role);
      setUsers(prev => prev.map(u => u._id === id ? { ...u, role } : u));
      toast({ title: 'Cập nhật quyền thành công' });
    } catch (error: any) {
      toast({
        title: 'Cập nhật quyền thất bại',
        description: error?.response?.data?.message || 'Vui lòng thử lại.',
        variant: 'destructive',
      });
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await adminApi.deleteUser(id);
      setUsers(prev => prev.filter(u => u._id !== id));
      if (selectedUser?._id === id) {
        setSelectedUser(null);
      }
      toast({ title: 'Xóa user thành công' });
    } catch (error: any) {
      toast({
        title: 'Xóa user thất bại',
        description: error?.response?.data?.message || 'Vui lòng thử lại.',
        variant: 'destructive',
      });
    }
  };

  const history = useMemo(() => {
    if (!selectedUser) return null;

    const bought = cars.filter((car) => car.buyerId === selectedUser._id).length;
    const posted = cars.filter((car) => car.sellerId === selectedUser._id).length;

    return { bought, posted };
  }, [cars, selectedUser]);

  return (
    <div className="space-y-4">
      <div className="relative w-64">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Tìm user..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>SĐT</TableHead>
              <TableHead>Quyền</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="w-16"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(u => (
              <TableRow key={u._id} className="cursor-pointer" onClick={() => setSelectedUser(u)}>
                <TableCell className="font-medium">{u.name}</TableCell>
                <TableCell className="text-muted-foreground">{u.email}</TableCell>
                <TableCell className="text-muted-foreground">{u.phone || '—'}</TableCell>
                <TableCell onClick={e => e.stopPropagation()}>
                  <Select value={u.role} onValueChange={(v) => updateRole(u._id, v as 'user' | 'admin')}>
                    <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">{new Date(u.createdAt).toLocaleDateString('vi-VN')}</TableCell>
                <TableCell onClick={e => e.stopPropagation()}>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Xoá người dùng?</AlertDialogTitle>
                        <AlertDialogDescription>Bạn chắc chắn muốn xoá {u.name}? Hành động này không thể hoàn tác.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Huỷ</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteUser(u._id)} className="bg-destructive text-destructive-foreground">Xoá</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* User Detail Modal */}
      <Dialog open={!!selectedUser} onOpenChange={o => !o && setSelectedUser(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center">
                <User className="h-5 w-5 text-accent" />
              </div>
              {selectedUser?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{selectedUser.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{selectedUser.phone || 'Chưa cập nhật'}</span>
                </div>
              </div>

              <div className="border-t border-border pt-4 space-y-3">
                <h4 className="font-display font-semibold text-foreground text-sm">Lịch sử hoạt động</h4>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <ShoppingCart className="h-4 w-4 text-green-500" />
                    <span className="text-muted-foreground">Xe đã mua:</span>
                    <span className="text-foreground font-medium">{history?.bought ?? 0}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <ShoppingCart className="h-4 w-4 text-blue-500" />
                    <span className="text-muted-foreground">Xe đã đăng bán:</span>
                    <span className="text-foreground font-medium">{history?.posted ?? 0}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersTab;
