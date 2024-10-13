'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PlusCircle, Pencil, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { Role } from '@prisma/client';
import { ScrollArea } from '@/components/ui/scroll-area';
import UserPfDataEditor from './UserPfDataEditor';

interface User {
  id: string;
  name: string | null;
  email: string | null;
  emailVerified: boolean | null;
  image: string | null;
  resetTokenExpiry: string | null;
  role: Role;
  createdAt: string;
  updatedAt: string;
  pfData: any;
}

export default function UserManagement() {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<Partial<User> | null>(null);
  const [visibleColumns, setVisibleColumns] = useState({
    name: true,
    email: true,
    emailVerified: true,
    image: false,
    resetTokenExpiry: false,
    role: true,
    createdAt: true,
    updatedAt: false,
    pfData: false,
  });

  useEffect(() => {
    if (status === 'authenticated') {
      fetchUsers();
    }
  }, [status]);

  const fetchUsers = async () => {
    const response = await fetch('/api/admin/users');
    const data = await response.json();
    setUsers(data);
  };

  const updateUser = async (user: Partial<User>) => {
    const response = await fetch(`/api/admin/users/${user.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });
    if (response.ok) {
      fetchUsers();
    } else {
      console.error('Failed to update user');
    }
  };

  const toggleColumn = (column: keyof typeof visibleColumns) => {
    setVisibleColumns((prev) => ({ ...prev, [column]: !prev[column] }));
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const handlePfDataUpdate = async (userId: string, newPfData: any) => {
    const response = await fetch(`/api/admin/users/${userId}/pfdata`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pfData: newPfData }),
    });
    if (response.ok) {
      fetchUsers();
    } else {
      console.error('Failed to update PF data');
    }
  };

  const handlePfDataDelete = async (userId: string, itemToDelete: any) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    const newPfData = {
      ...user.pfData,
      item_name: user.pfData.item_name.filter(
        (item: any) => item.timestamp !== itemToDelete.timestamp,
      ),
    };

    const response = await fetch(`/api/admin/users/${userId}/pfdata`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pfData: newPfData }),
    });
    if (response.ok) {
      fetchUsers();
    } else {
      console.error('Failed to delete PF data item');
    }
  };

  if (status === 'loading') return <div>Loading...</div>;
  if (status === 'unauthenticated') return <div>Access Denied</div>;

  return (
    <div className="mx-auto py-10">
      <h1 className="mb-5 text-2xl font-bold">User Management</h1>
      <Button onClick={fetchUsers} className="mb-4">
        Refresh Users
      </Button>
      <div className="mb-4 flex flex-wrap gap-2">
        {Object.entries(visibleColumns).map(([column, isVisible]) => (
          <Button
            key={column}
            variant={isVisible ? 'default' : 'outline'}
            size="sm"
            onClick={() => toggleColumn(column as keyof typeof visibleColumns)}
          >
            {column}
          </Button>
        ))}
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Expand</TableHead>
              {visibleColumns.name && <TableHead>Name</TableHead>}
              {visibleColumns.email && <TableHead>Email</TableHead>}
              {visibleColumns.emailVerified && <TableHead>Email Verified</TableHead>}
              {visibleColumns.image && <TableHead>Image</TableHead>}
              {visibleColumns.resetTokenExpiry && <TableHead>Reset Token Expiry</TableHead>}
              {visibleColumns.role && <TableHead>Role</TableHead>}
              {visibleColumns.createdAt && <TableHead>Created At</TableHead>}
              {visibleColumns.updatedAt && <TableHead>Updated At</TableHead>}
              {visibleColumns.pfData && <TableHead>PF Data</TableHead>}
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl">
                      <DialogHeader>
                        <DialogTitle>User Details</DialogTitle>
                      </DialogHeader>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Name</Label>
                          <Input value={user.name || ''} readOnly />
                        </div>
                        <div>
                          <Label>Email</Label>
                          <Input value={user.email || ''} readOnly />
                        </div>
                        <div>
                          <Label>Email Verified</Label>
                          <Input value={user.emailVerified ? 'Yes' : 'No'} readOnly />
                        </div>
                        <div>
                          <Label>Image</Label>
                          <Input value={user.image || ''} readOnly />
                        </div>
                        <div>
                          <Label>Reset Token Expiry</Label>
                          <Input value={formatDate(user.resetTokenExpiry)} readOnly />
                        </div>
                        <div>
                          <Label>Role</Label>
                          <Input value={user.role} readOnly />
                        </div>
                        <div>
                          <Label>Created At</Label>
                          <Input value={formatDate(user.createdAt)} readOnly />
                        </div>
                        <div>
                          <Label>Updated At</Label>
                          <Input value={formatDate(user.updatedAt)} readOnly />
                        </div>
                        <div className="col-span-2">
                          <Label>PF Data</Label>
                          <UserPfDataEditor
                            initialData={user.pfData}
                            onSave={(newData) => handlePfDataUpdate(user.id, newData)}
                            onDelete={(itemToDelete) => handlePfDataDelete(user.id, itemToDelete)}
                          />
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </TableCell>
                {visibleColumns.name && <TableCell>{user.name}</TableCell>}
                {visibleColumns.email && <TableCell>{user.email}</TableCell>}
                {visibleColumns.emailVerified && (
                  <TableCell>{user.emailVerified ? 'Yes' : 'No'}</TableCell>
                )}
                {visibleColumns.image && <TableCell>{user.image}</TableCell>}
                {visibleColumns.resetTokenExpiry && (
                  <TableCell>{formatDate(user.resetTokenExpiry)}</TableCell>
                )}
                {visibleColumns.role && <TableCell>{user.role}</TableCell>}
                {visibleColumns.createdAt && <TableCell>{formatDate(user.createdAt)}</TableCell>}
                {visibleColumns.updatedAt && <TableCell>{formatDate(user.updatedAt)}</TableCell>}
                {visibleColumns.pfData && (
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <DialogHeader>
                          <DialogTitle>PF Data</DialogTitle>
                        </DialogHeader>
                        <UserPfDataEditor
                          initialData={user.pfData}
                          onSave={(newData) => handlePfDataUpdate(user.id, newData)}
                          onDelete={(itemToDelete) => handlePfDataDelete(user.id, itemToDelete)}
                        />
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                )}
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={() => setEditingUser(user)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="edit-name" className="text-right">
                            Name
                          </Label>
                          <Input
                            id="edit-name"
                            value={editingUser?.name || ''}
                            onChange={(e) =>
                              setEditingUser((prev) => ({ ...prev, name: e.target.value }))
                            }
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="edit-email" className="text-right">
                            Email
                          </Label>
                          <Input
                            id="edit-email"
                            value={editingUser?.email || ''}
                            onChange={(e) =>
                              setEditingUser((prev) => ({ ...prev, email: e.target.value }))
                            }
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="edit-emailVerified" className="text-right">
                            Email Verified
                          </Label>
                          <Checkbox
                            id="edit-emailVerified"
                            checked={editingUser?.emailVerified || false}
                            onCheckedChange={(checked) =>
                              setEditingUser((prev) => ({
                                ...prev,
                                emailVerified: checked === true,
                              }))
                            }
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="edit-role" className="text-right">
                            Role
                          </Label>
                          <Select
                            value={editingUser?.role}
                            onValueChange={(value) =>
                              setEditingUser((prev) => ({ ...prev, role: value as Role }))
                            }
                          >
                            <SelectTrigger className="col-span-3">
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button
                        onClick={() => {
                          if (editingUser) {
                            updateUser(editingUser);
                            setEditingUser(null);
                          }
                        }}
                      >
                        Update User
                      </Button>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
