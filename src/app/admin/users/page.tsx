'use client';

import React, { useState } from 'react';
import { db } from '@/lib/db';
import { useAuth } from '@/lib/auth/context';
import { User, UserRole, RolePermission } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import {
  Users,
  Shield,
  CheckCircle2,
  Lock,
  Search,
  Filter,
  UserCheck,
  KeyRound,
  ShieldAlert,
} from 'lucide-react';

export default function UsersPermissionsPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>(db.getUsers());
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>(db.getRolePermissions());
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');
  const [toastMessage, setToastMessage] = useState('');

  const notify = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    const updated = db.updateUserRole(userId, newRole, currentUser?.name || 'Super Admin');
    if (updated) {
      setUsers([...db.getUsers()]);
      notify(`User ${updated.name} updated to role "${newRole.replace('_', ' ')}".`);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (search) {
      const q = search.toLowerCase();
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E4E9] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-[#E84B45]/10 text-[#E84B45]">
              <Users className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Team Governance</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#202124] tracking-tight mt-1">
            Users, Roles & Granular Access Control (RBAC)
          </h1>
          <p className="text-xs text-[#555B63] mt-0.5">
            Define permissions, delegate review responsibilities, and assign least-privilege roles to staff.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center bg-neutral-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'users' ? 'bg-white shadow-xs text-[#202124] font-bold' : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Team Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'roles' ? 'bg-white shadow-xs text-[#202124] font-bold' : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Role Permission Matrix ({rolePermissions.length})
          </button>
        </div>
      </div>

      {/* Toast notice */}
      {toastMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage('')}>✕</button>
        </div>
      )}

      {activeTab === 'users' ? (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="bg-white p-3 rounded-2xl border border-[#E2E4E9] shadow-2xs">
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search staff by name, email, or role..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-neutral-50 border border-[#E2E4E9] rounded-xl pl-9 pr-3 py-1.5 text-xs text-neutral-900 focus:outline-none focus:border-[#E84B45]"
              />
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-2xl border border-[#E2E4E9] shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-neutral-50/70 border-b border-neutral-200 text-neutral-500 font-bold uppercase text-[10px]">
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Contact Info</th>
                    <th className="py-3 px-4">Created Date</th>
                    <th className="py-3 px-4">Assigned Role (RBAC)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-neutral-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#E84B45]/10 text-[#E84B45] font-bold flex items-center justify-center text-xs">
                            {u.name[0]}
                          </div>
                          <div>
                            <p className="font-bold text-[#202124]">{u.name}</p>
                            <p className="text-[10px] text-neutral-400">{u.id}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <p className="text-neutral-700">{u.email}</p>
                        {u.phone && <p className="text-[10px] text-neutral-400">{u.phone}</p>}
                      </td>

                      <td className="py-3 px-4 text-neutral-500">{formatDate(u.createdAt)}</td>

                      <td className="py-3 px-4">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                          className="bg-neutral-50 border border-[#E2E4E9] rounded-xl px-2.5 py-1 text-xs font-semibold text-neutral-800"
                        >
                          <option value="super_admin">Super Administrator</option>
                          <option value="ops_admin">Operations Admin</option>
                          <option value="reviewer">Medical Reviewer</option>
                          <option value="finance">Finance & Compliance</option>
                          <option value="content_editor">Content Editor</option>
                          <option value="donor">Donor</option>
                          <option value="fundraiser">Fundraiser</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Role Permissions Matrix */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rolePermissions.map((rp) => (
            <div key={rp.role} className="bg-white p-5 rounded-2xl border border-[#E2E4E9] shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                <h3 className="text-sm font-bold text-[#202124]">{rp.name}</h3>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-neutral-100 text-neutral-700 font-bold">
                  {rp.role}
                </span>
              </div>

              <p className="text-xs text-neutral-500 leading-relaxed">{rp.description}</p>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">
                  Granted Privileges
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {rp.permissions.map((p) => (
                    <span
                      key={p}
                      className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200"
                    >
                      {p.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
