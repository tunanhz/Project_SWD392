"use client";

import Button from "@/components/ui/Button";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

export default function ManageUsersPage() {
  const t = useTranslations("AdminUsers");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editRole, setEditRole] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;

  const fetchUsers = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/api/users", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleUpdateRole = async (userId: string) => {
    setMessage('');
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role: editRole })
      });
      if (!res.ok) throw new Error("Update failed");
      setMessage('User role updated!');
      setEditingUser(null);
      fetchUsers();
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    }
  };

  const handleDelete = async (userId: string, username: string) => {
    if (!confirm(`Are you sure you want to delete user "${username}"?`)) return;
    setMessage('');
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Delete failed");
      setMessage('User deleted!');
      fetchUsers();
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    }
  };

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      <div className="h-10 bg-accent/5 rounded-xl w-1/3"></div>
      <div className="h-64 bg-accent/5 rounded-3xl"></div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="space-y-1">
        <h1 className="text-3xl font-black text-primary tracking-tight">{t('title')}</h1>
        <p className="text-gray-500 italic">{t('subtitle')}</p>
      </div>

      {message && (
        <div className={`p-3 text-sm font-bold rounded-xl border ${message.startsWith('Error') ? 'text-red-600 bg-red-50 border-red-100' : 'text-green-600 bg-green-50 border-green-100'}`}>
          {message}
        </div>
      )}

      <div className="glass rounded-3xl border border-border/50 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-accent/5">
              <th className="px-6 py-4">{t('name')}</th>
              <th className="px-6 py-4">{t('email')}</th>
              <th className="px-6 py-4">Username</th>
              <th className="px-6 py-4">{t('role')}</th>
              <th className="px-6 py-4">{t('verified')}</th>
              <th className="px-6 py-4">{t('actions')}</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-border/20">
            {users.map((user: any) => (
              <tr key={user.id} className="hover:bg-accent/5 transition-colors">
                <td className="px-6 py-4 font-bold text-primary">{user.name}</td>
                <td className="px-6 py-4 text-gray-500">{user.email}</td>
                <td className="px-6 py-4 font-medium">{user.username}</td>
                <td className="px-6 py-4">
                  {editingUser === user.id ? (
                    <div className="flex items-center gap-2">
                      <select
                        value={editRole}
                        onChange={e => setEditRole(e.target.value)}
                        className="h-8 rounded-lg border border-border/50 bg-background/50 px-2 text-xs focus:ring-2 focus:ring-accent outline-none"
                      >
                        <option value="CUSTOMER">CUSTOMER</option>
                        <option value="OWNER">OWNER</option>
                        <option value="STAFF">STAFF</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                      <Button variant="accent" size="sm" className="h-7 text-xs" onClick={() => handleUpdateRole(user.id)}>{t('save')}</Button>
                      <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setEditingUser(null)}>Cancel</Button>
                    </div>
                  ) : (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                      user.role === 'STAFF' ? 'bg-blue-100 text-blue-700' :
                      user.role === 'OWNER' ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {user.role}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-bold ${user.isVerified ? 'text-green-600' : 'text-red-500'}`}>
                    {user.isVerified ? `✓ ${t('yes')}` : `✗ ${t('no')}`}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    {editingUser !== user.id && (
                      <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => { setEditingUser(user.id); setEditRole(user.role); }}>
                        Edit Role
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-red-500 hover:bg-red-50" onClick={() => handleDelete(user.id, user.username)}>
                      {t('delete')}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
