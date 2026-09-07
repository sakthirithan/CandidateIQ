import React, { useState, useEffect } from 'react';
import { mockCandidateService } from '../../services/mockApi/candidateService';
import { mockJobService } from '../../services/mockApi/jobService';
import { mockApplicationService } from '../../services/mockApi/applicationService';
import {
  ShieldCheck,
  Users,
  Briefcase,
  Layers,
  Activity,
  Plus,
  Search,
  Filter,
  UserCheck,
  UserX,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  RefreshCw,
  Sparkles,
  Calendar,
  Lock,
  ChevronDown
} from 'lucide-react';

const INITIAL_MOCK_USERS = [
  { id: 'usr_1', name: 'Alex Johnson', email: 'alex@example.com', role: 'candidate', status: 'active', regDate: '2026-08-12' },
  { id: 'usr_2', name: 'Recruiter Admin', email: 'recruiter.demo@candidateiq.com', role: 'hr', status: 'active', regDate: '2026-08-01' },
  { id: 'usr_3', name: 'John Doe', email: 'john@example.com', role: 'candidate', status: 'active', regDate: '2026-08-15' },
  { id: 'usr_4', name: 'Sarah Wilson', email: 'sarah@example.com', role: 'candidate', status: 'active', regDate: '2026-08-20' },
  { id: 'usr_5', name: 'System Admin', email: 'admin@candidateiq.com', role: 'admin', status: 'active', regDate: '2026-07-01' },
  { id: 'usr_6', name: 'David Miller', email: 'david.m@talentcorp.com', role: 'hr', status: 'deactivated', regDate: '2026-08-22' }
];

const INITIAL_ACTIVITY_LOGS = [
  { id: 'act_1', time: '10 mins ago', user: 'Alex Johnson', action: 'Uploaded new resume (PDF parsed 14 skills)' },
  { id: 'act_2', time: '25 mins ago', user: 'Recruiter Admin', action: 'Shortlisted candidate John Doe for AI Lead role' },
  { id: 'act_3', time: '1 hour ago', user: 'Sarah Wilson', action: 'Completed AI Mock Interview (Score: 82/100)' },
  { id: 'act_4', time: '2 hours ago', user: 'System Admin', action: 'Activated ₹1 HR Demo License Subscription' },
  { id: 'act_5', time: '4 hours ago', user: 'Recruiter Admin', action: 'Published Requisition: Senior MERN Stack & AI Engineer' }
];

function AdminManagement() {
  const [users, setUsers] = useState(INITIAL_MOCK_USERS);
  const [activityLogs, setActivityLogs] = useState(INITIAL_ACTIVITY_LOGS);
  const [candidatesCount, setCandidatesCount] = useState(3);
  const [jobsCount, setJobsCount] = useState(2);
  const [appsCount, setAppsCount] = useState(3);
  const [loading, setLoading] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [regDateFilter, setRegDateFilter] = useState('All');

  // User Create / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', role: 'candidate', status: 'active' });
  const [toastMsg, setToastMsg] = useState(null);

  useEffect(() => {
    loadSystemCounts();
  }, []);

  const loadSystemCounts = async () => {
    try {
      const [cands, jobsList, apps] = await Promise.all([
        mockCandidateService.getCandidates(),
        mockJobService.getJobs(),
        mockApplicationService.getApplications()
      ]);
      setCandidatesCount(cands?.length || 3);
      setJobsCount(jobsList?.length || 2);
      setAppsCount(apps?.length || 3);
    } catch (err) {
      console.error('Error loading admin counts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // User CRUD Operations
  const handleOpenCreateModal = () => {
    setEditingUser(null);
    setFormData({ name: '', email: '', role: 'candidate', status: 'active' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user) => {
    setEditingUser(user);
    setFormData({ name: user.name, email: user.email, role: user.role, status: user.status });
    setIsModalOpen(true);
  };

  const handleSaveUser = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    if (editingUser) {
      // Update User
      setUsers(users.map((u) => (u.id === editingUser.id ? { ...u, ...formData } : u)));
      showToast(`User "${formData.name}" successfully updated.`);
    } else {
      // Create User
      const newUser = {
        id: `usr_${Date.now()}`,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        status: formData.status,
        regDate: new Date().toISOString().split('T')[0]
      };
      setUsers([newUser, ...users]);
      showToast(`New user "${formData.name}" created successfully!`);
    }

    setIsModalOpen(false);
  };

  const handleToggleStatus = (userId) => {
    setUsers(
      users.map((u) => {
        if (u.id === userId) {
          const nextStatus = u.status === 'active' ? 'deactivated' : 'active';
          showToast(`User status changed to "${nextStatus.toUpperCase()}".`);
          return { ...u, status: nextStatus };
        }
        return u;
      })
    );
  };

  const handleDeleteUser = (userId, userName) => {
    setUsers(users.filter((u) => u.id !== userId));
    showToast(`User "${userName}" deleted from system.`);
  };

  // Filtered Users List
  const filteredUsers = users.filter((u) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query);
    const matchesRole = roleFilter === 'All' || u.role.toLowerCase() === roleFilter.toLowerCase();
    const matchesStatus = statusFilter === 'All' || u.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalUsers = users.length;
  const recruitersCount = users.filter((u) => u.role === 'hr' && u.status === 'active').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 select-none max-w-7xl mx-auto">
      {/* Toast Notification Alert */}
      {toastMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2.5 text-xs font-bold font-outfit">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{toastMsg}</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
            Admin Sync
          </span>
        </div>
      )}

      {/* Top Banner Header */}
      <div className="saas-card p-6 md:p-8 border border-slate-200/90 flex flex-wrap justify-between items-center gap-6 bg-white shadow-sm">
        <div className="space-y-1.5 flex-1 min-w-[280px]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-white">
              <ShieldCheck className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold font-outfit text-slate-950 tracking-tight">
                  Module 18 — Admin System Operations
                </h1>
                <span className="badge-pill badge-primary text-[10px]">
                  <Sparkles className="w-3 h-3 text-indigo-400" /> System Control Desk
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Centralized system administration overview, user management suite, operational counts, and security audit logs.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="btn-primary px-4 py-2.5 text-xs font-bold rounded-xl flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Create New User
        </button>
      </div>

      {/* 5 CORE DASHBOARD OPERATIONAL METRIC CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Total Users */}
        <div className="saas-card p-4 border border-slate-200/80 bg-white space-y-1.5 shadow-sm">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider font-outfit">Total Users</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <span className="text-2xl font-black font-outfit text-slate-950 block">{totalUsers}</span>
          <span className="text-[10px] text-slate-500 font-medium block">Registered Accounts</span>
        </div>

        {/* Candidates */}
        <div className="saas-card p-4 border border-slate-200/80 bg-white space-y-1.5 shadow-sm">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider font-outfit">Candidates</span>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-black font-outfit text-emerald-600 block">{candidatesCount}</span>
          <span className="text-[10px] text-emerald-700 font-medium block">Active Candidate Profiles</span>
        </div>

        {/* Recruiters */}
        <div className="saas-card p-4 border border-slate-200/80 bg-white space-y-1.5 shadow-sm">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider font-outfit">Recruiters</span>
            <Briefcase className="w-4 h-4 text-purple-600" />
          </div>
          <span className="text-2xl font-black font-outfit text-purple-600 block">{recruitersCount}</span>
          <span className="text-[10px] text-purple-700 font-medium block">Activated HR Licenses</span>
        </div>

        {/* Active Jobs */}
        <div className="saas-card p-4 border border-slate-200/80 bg-white space-y-1.5 shadow-sm">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider font-outfit">Active Jobs</span>
            <Layers className="w-4 h-4 text-cyan-600" />
          </div>
          <span className="text-2xl font-black font-outfit text-cyan-600 block">{jobsCount}</span>
          <span className="text-[10px] text-cyan-700 font-medium block">Published Requisitions</span>
        </div>

        {/* Applications */}
        <div className="saas-card p-4 border border-slate-200/80 bg-white space-y-1.5 shadow-sm">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider font-outfit">Applications</span>
            <Activity className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-2xl font-black font-outfit text-amber-600 block">{appsCount}</span>
          <span className="text-[10px] text-amber-700 font-medium block">Total Pipeline Applications</span>
        </div>
      </div>

      {/* MAIN CONTENT GRID: USER MANAGEMENT (LEFT 2 COLS) vs SYSTEM ACTIVITY STREAM (RIGHT 1 COL) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: USER MANAGEMENT SUITE & FILTERS */}
        <div className="lg:col-span-2 space-y-4">
          <div className="saas-card p-6 border border-slate-200/90 bg-white space-y-6 shadow-sm">
            <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-extrabold font-outfit text-slate-950">User Management Desk</h3>
                <p className="text-xs text-slate-500 font-medium">Create, edit, deactivate, or filter system user accounts.</p>
              </div>

              <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold">
                Showing {filteredUsers.length} of {users.length} Users
              </span>
            </div>

            {/* FILTERS TOOLBAR (ROLE, STATUS, REGISTRATION DATE & SEARCH) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Search Bar */}
              <div className="relative sm:col-span-3">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search user name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-saas pl-10 w-full text-xs bg-white"
                />
              </div>

              {/* 1. Role Filter */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Role Filter</label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="input-saas text-xs bg-slate-50 font-semibold text-slate-800 cursor-pointer"
                >
                  <option value="All">All Roles</option>
                  <option value="candidate">Candidate</option>
                  <option value="hr">HR / Recruiter</option>
                  <option value="admin">System Admin</option>
                </select>
              </div>

              {/* 2. Status Filter */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Status Filter</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="input-saas text-xs bg-slate-50 font-semibold text-slate-800 cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="deactivated">Deactivated</option>
                </select>
              </div>

              {/* 3. Registration Date Filter */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Reg. Date</label>
                <select
                  value={regDateFilter}
                  onChange={(e) => setRegDateFilter(e.target.value)}
                  className="input-saas text-xs bg-slate-50 font-semibold text-slate-800 cursor-pointer"
                >
                  <option value="All">All Time</option>
                  <option value="30days">Last 30 Days</option>
                  <option value="august">August 2026</option>
                </select>
              </div>
            </div>

            {/* USER MANAGEMENT TABLE */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/70">
                    <th className="py-3 px-3 font-extrabold text-slate-500 uppercase tracking-wider">User Profile</th>
                    <th className="py-3 px-3 font-extrabold text-slate-500 uppercase tracking-wider">System Role</th>
                    <th className="py-3 px-3 font-extrabold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="py-3 px-3 font-extrabold text-slate-500 uppercase tracking-wider">Reg. Date</th>
                    <th className="py-3 px-3 font-extrabold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredUsers.map((user) => {
                    const isDeactivated = user.status === 'deactivated';

                    return (
                      <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs font-outfit">
                              {user.name.charAt(0)}
                            </div>
                            <div>
                              <span className="font-bold text-slate-950 block font-outfit">{user.name}</span>
                              <span className="text-[11px] text-slate-500 font-medium block">{user.email}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-3">
                          {user.role === 'admin' && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-900 text-white border border-slate-800">
                              Admin
                            </span>
                          )}
                          {user.role === 'hr' && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
                              HR Recruiter
                            </span>
                          )}
                          {user.role === 'candidate' && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
                              Candidate
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-3">
                          {isDeactivated ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                              Deactivated
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              Active
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-3 font-mono text-[11px] text-slate-500">{user.regDate}</td>

                        <td className="py-3.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditModal(user)}
                              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                              title="Edit User"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleToggleStatus(user.id)}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                isDeactivated ? 'text-emerald-600 hover:bg-emerald-50' : 'text-amber-600 hover:bg-amber-50'
                              }`}
                              title={isDeactivated ? 'Activate User' : 'Deactivate User'}
                            >
                              {isDeactivated ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                            </button>

                            <button
                              onClick={() => handleDeleteUser(user.id, user.name)}
                              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete User"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-slate-400 text-xs">
                        No users found matching current filter options.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SYSTEM ACTIVITY STREAM (AUDIT LOGS) */}
        <div className="space-y-4">
          <div className="saas-card p-6 border border-slate-200/90 bg-white space-y-4 shadow-sm">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold font-outfit text-slate-950 flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-600" /> System Activity Audit
              </h3>
              <span className="text-[10px] font-bold text-emerald-600 uppercase">Live Stream</span>
            </div>

            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {activityLogs.map((log) => (
                <div key={log.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1 text-xs">
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold">
                    <span className="text-indigo-600">{log.user}</span>
                    <span>{log.time}</span>
                  </div>
                  <p className="text-slate-800 font-medium leading-relaxed">{log.action}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CREATE / EDIT USER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="saas-card p-6 md:p-8 bg-white border border-slate-200/90 max-w-md w-full rounded-2xl shadow-xl space-y-6 animate-scale-up">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="text-lg font-extrabold font-outfit text-slate-950">
                {editingUser ? 'Edit User Account' : 'Create New System User'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4 text-xs font-medium">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Enter full name..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-saas w-full bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-saas w-full bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">System Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="input-saas w-full bg-white font-semibold text-slate-800 cursor-pointer"
                  >
                    <option value="candidate">Candidate</option>
                    <option value="hr">HR Recruiter</option>
                    <option value="admin">System Admin</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Account Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="input-saas w-full bg-white font-semibold text-slate-800 cursor-pointer"
                  >
                    <option value="active">Active</option>
                    <option value="deactivated">Deactivated</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary text-xs px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  {editingUser ? 'Save User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminManagement;
