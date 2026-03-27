/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  LogOut, 
  Mail, 
  Tag, 
  MessageSquare, 
  Trash2, 
  Edit2, 
  ChevronRight,
  Clock,
  CheckCircle2,
  UserPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Lead, LeadStatus, User, Note } from './types';

const STATUS_COLORS: Record<LeadStatus, string> = {
  'New': 'bg-blue-100 text-blue-700 border-blue-200',
  'Contacted': 'bg-amber-100 text-amber-700 border-amber-200',
  'Converted': 'bg-emerald-100 text-emerald-700 border-emerald-200'
};

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('crm_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [leads, setLeads] = useState<Lead[]>(() => {
    const saved = localStorage.getItem('crm_leads');
    return saved ? JSON.parse(saved) : [];
  });

  const [isAddingLead, setIsAddingLead] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Auth State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  useEffect(() => {
    localStorage.setItem('crm_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('crm_leads', JSON.stringify(leads));
  }, [leads]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginEmail && loginPassword) {
      setUser({ email: loginEmail, isLoggedIn: true });
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('crm_user');
  };

  const addLead = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newLead: Lead = {
      id: crypto.randomUUID(),
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      source: formData.get('source') as string,
      status: 'New',
      notes: [],
      createdAt: new Date().toISOString(),
    };
    setLeads([newLead, ...leads]);
    setIsAddingLead(false);
  };

  const updateLead = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingLead) return;
    const formData = new FormData(e.currentTarget);
    const updatedLeads = leads.map(l => l.id === editingLead.id ? {
      ...l,
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      source: formData.get('source') as string,
    } : l);
    setLeads(updatedLeads);
    setEditingLead(null);
  };

  const deleteLead = (id: string) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      setLeads(leads.filter(l => l.id !== id));
      if (selectedLead?.id === id) setSelectedLead(null);
    }
  };

  const updateStatus = (id: string, status: LeadStatus) => {
    setLeads(leads.map(l => l.id === id ? { ...l, status } : l));
  };

  const addNote = (leadId: string, content: string) => {
    if (!content.trim()) return;
    const newNote: Note = {
      id: crypto.randomUUID(),
      content,
      createdAt: new Date().toISOString(),
    };
    setLeads(leads.map(l => l.id === leadId ? { ...l, notes: [newNote, ...l.notes] } : l));
  };

  const filteredLeads = leads.filter(l => 
    l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.source.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-neutral-200 p-8"
        >
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-200">
              <Users className="text-white w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-neutral-900">LeadFlow CRM</h1>
            <p className="text-neutral-500 text-sm mt-1">Manage your clients with ease</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Email Address</label>
              <input 
                type="email" 
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="admin@leadflow.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Password</label>
              <input 
                type="password" 
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors shadow-lg shadow-blue-100 mt-2"
            >
              Sign In
            </button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-xs text-neutral-400">Demo Mode: Use any email/password</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-bottom border-neutral-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-100">
              <Users className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-xl text-neutral-900 hidden sm:block">LeadFlow</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-neutral-100 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-medium text-neutral-600">{user.email}</span>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          {[
            { label: 'Total Leads', value: leads.length, icon: Users, color: 'blue' },
            { label: 'Contacted', value: leads.filter(l => l.status === 'Contacted').length, icon: MessageSquare, color: 'amber' },
            { label: 'Converted', value: leads.filter(l => l.status === 'Converted').length, icon: CheckCircle2, color: 'emerald' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-neutral-500 text-sm font-medium">{stat.label}</span>
                <stat.icon className={`text-${stat.color}-500`} size={20} />
              </div>
              <div className="text-3xl font-bold text-neutral-900">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
            <input 
              type="text" 
              placeholder="Search leads by name, email, or source..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
            />
          </div>
          <button 
            onClick={() => setIsAddingLead(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-blue-100"
          >
            <Plus size={20} />
            Add New Lead
          </button>
        </div>

        {/* Leads Table */}
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200">
                  <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Lead Info</th>
                  <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Source</th>
                  <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                <AnimatePresence mode="popLayout">
                  {filteredLeads.map((lead) => (
                    <motion.tr 
                      key={lead.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-neutral-50 transition-colors group cursor-pointer"
                      onClick={() => setSelectedLead(lead)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-600 font-bold">
                            {lead.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-neutral-900">{lead.name}</div>
                            <div className="text-sm text-neutral-500 flex items-center gap-1">
                              <Mail size={12} /> {lead.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-neutral-600 text-sm">
                          <Tag size={14} />
                          {lead.source}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select 
                          value={lead.status}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => updateStatus(lead.id, e.target.value as LeadStatus)}
                          className={`text-xs font-bold px-2.5 py-1 rounded-full border outline-none cursor-pointer ${STATUS_COLORS[lead.status]}`}
                        >
                          <option value="New">New</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Converted">Converted</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-neutral-500 flex items-center gap-1">
                          <Clock size={14} />
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => { e.stopPropagation(); setEditingLead(lead); }}
                            className="p-1.5 text-neutral-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); deleteLead(lead.id); }}
                            className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                          <ChevronRight size={16} className="text-neutral-300" />
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
                {filteredLeads.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-neutral-500">
                      <div className="flex flex-col items-center gap-2">
                        <Search size={40} className="text-neutral-200" />
                        <p>No leads found matching your search.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {(isAddingLead || editingLead) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
                <h2 className="text-lg font-bold text-neutral-900">
                  {editingLead ? 'Edit Lead' : 'Add New Lead'}
                </h2>
                <button 
                  onClick={() => { setIsAddingLead(false); setEditingLead(null); }}
                  className="text-neutral-400 hover:text-neutral-600"
                >
                  <Plus className="rotate-45" size={24} />
                </button>
              </div>
              <form onSubmit={editingLead ? updateLead : addLead} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Full Name</label>
                  <input 
                    name="name"
                    defaultValue={editingLead?.name}
                    required
                    autoFocus
                    className="w-full px-4 py-2 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Email Address</label>
                  <input 
                    name="email"
                    type="email"
                    defaultValue={editingLead?.email}
                    required
                    className="w-full px-4 py-2 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Lead Source</label>
                  <input 
                    name="source"
                    defaultValue={editingLead?.source}
                    required
                    className="w-full px-4 py-2 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="Website, LinkedIn, Referral..."
                  />
                </div>
                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => { setIsAddingLead(false); setEditingLead(null); }}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-200 font-semibold text-neutral-600 hover:bg-neutral-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                  >
                    {editingLead ? 'Save Changes' : 'Create Lead'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Lead Details Drawer */}
      <AnimatePresence>
        {selectedLead && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-[2px]">
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-white w-full max-w-lg h-full shadow-2xl border-l border-neutral-200 flex flex-col"
            >
              <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center font-bold text-xl">
                    {selectedLead.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-neutral-900">{selectedLead.name}</h2>
                    <p className="text-sm text-neutral-500">{selectedLead.email}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedLead(null)}
                  className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-xl transition-all"
                >
                  <Plus className="rotate-45" size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Status & Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
                    <span className="text-xs text-neutral-400 uppercase font-bold tracking-wider mb-1 block">Status</span>
                    <select 
                      value={selectedLead.status}
                      onChange={(e) => {
                        updateStatus(selectedLead.id, e.target.value as LeadStatus);
                        setSelectedLead({ ...selectedLead, status: e.target.value as LeadStatus });
                      }}
                      className={`text-sm font-bold px-3 py-1.5 rounded-xl border outline-none w-full ${STATUS_COLORS[selectedLead.status]}`}
                    >
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Converted">Converted</option>
                    </select>
                  </div>
                  <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
                    <span className="text-xs text-neutral-400 uppercase font-bold tracking-wider mb-1 block">Source</span>
                    <div className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
                      <Tag size={14} />
                      {selectedLead.source}
                    </div>
                  </div>
                </div>

                {/* Notes Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-neutral-900 flex items-center gap-2">
                      <MessageSquare size={18} className="text-blue-500" />
                      Interaction Notes
                    </h3>
                    <span className="text-xs text-neutral-400 bg-neutral-100 px-2 py-1 rounded-full">
                      {selectedLead.notes.length} notes
                    </span>
                  </div>

                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      const input = e.currentTarget.elements.namedItem('note') as HTMLTextAreaElement;
                      addNote(selectedLead.id, input.value);
                      input.value = '';
                      // Refresh selected lead to show new note
                      const updated = leads.find(l => l.id === selectedLead.id);
                      if (updated) setSelectedLead({ ...updated, notes: [{ id: 'temp', content: input.value, createdAt: new Date().toISOString() }, ...updated.notes] });
                    }}
                    className="mb-6"
                  >
                    <textarea 
                      name="note"
                      placeholder="Add a new note about this lead..."
                      className="w-full p-4 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none h-24 text-sm"
                    />
                    <button 
                      type="submit"
                      className="mt-2 w-full bg-blue-600 text-white py-2 rounded-xl font-semibold hover:bg-blue-700 transition-all"
                    >
                      Post Note
                    </button>
                  </form>

                  <div className="space-y-4">
                    {leads.find(l => l.id === selectedLead.id)?.notes.map((note) => (
                      <div key={note.id} className="bg-white p-4 rounded-2xl border border-neutral-100 shadow-sm">
                        <p className="text-sm text-neutral-700 leading-relaxed">{note.content}</p>
                        <div className="mt-2 flex items-center gap-1 text-[10px] text-neutral-400 uppercase font-bold tracking-widest">
                          <Clock size={10} />
                          {new Date(note.createdAt).toLocaleString()}
                        </div>
                      </div>
                    ))}
                    {selectedLead.notes.length === 0 && (
                      <div className="text-center py-8 text-neutral-400 border-2 border-dashed border-neutral-100 rounded-2xl">
                        <p className="text-sm italic">No notes yet. Start the conversation!</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-neutral-100 bg-neutral-50">
                <button 
                  onClick={() => deleteLead(selectedLead.id)}
                  className="w-full flex items-center justify-center gap-2 text-red-600 font-semibold py-3 rounded-xl hover:bg-red-100 transition-all"
                >
                  <Trash2 size={18} />
                  Delete Lead Permanently
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
