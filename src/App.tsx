/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Menu, X, ChevronRight, ShieldCheck, TrendingUp, Users, Lightbulb, 
  HeartHandshake, Briefcase, Mail, Phone, MapPin, Facebook, Instagram, 
  Linkedin, ArrowRight, CheckCircle2, Quote, LayoutDashboard, 
  Wallet, ShoppingCart, BarChart3, MessageCircle, Search,
  Target, ClipboardList, Calendar, UserCheck, Settings, PieChart, Cloud,
  Smartphone, Database, Sliders, Zap, Award, Activity, Eye, Rocket, Clock, Coins,
  Lock, EyeOff, User, LogIn
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { 
  auth, 
  db, 
  signInWithPopup, 
  googleProvider, 
  onAuthStateChanged, 
  signOut,
  collection,
  onSnapshot,
  query,
  where,
  addDoc,
  doc,
  setDoc,
  deleteDoc,
  handleFirestoreError,
  OperationType
} from './firebase';

const HERO_BG = "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&q=80&w=1920"; // Calm lake at dawn

const Dashboard = ({ user, onLogout }: { user: any, onLogout: () => void }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [members, setMembers] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [newMember, setNewMember] = useState({ 
    fullName: '', 
    email: '', 
    phone: '', 
    group: '', 
    entryDate: new Date().toISOString().split('T')[0], 
    status: 'Activo',
    observations: '' 
  });
  const [newTransaction, setNewTransaction] = useState({ type: 'Ingreso', category: 'Diezmo', amount: '', date: new Date().toISOString().split('T')[0], description: '' });
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const churchId = 'default-church'; // Simplified for now
    const membersRef = collection(db, `churches/${churchId}/members`);
    const transactionsRef = collection(db, `churches/${churchId}/transactions`);

    const unsubMembers = onSnapshot(membersRef, (snapshot) => {
      setMembers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, `churches/${churchId}/members`));

    const unsubTransactions = onSnapshot(transactionsRef, (snapshot) => {
      setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, `churches/${churchId}/transactions`));

    return () => {
      unsubMembers();
      unsubTransactions();
    };
  }, [user]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const churchId = 'default-church';
      await addDoc(collection(db, `churches/${churchId}/members`), newMember);
      setNewMember({ 
        fullName: '', 
        email: '', 
        phone: '', 
        group: '', 
        entryDate: new Date().toISOString().split('T')[0], 
        status: 'Activo', 
        observations: '' 
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'members');
    }
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const churchId = 'default-church';
      await addDoc(collection(db, `churches/${churchId}/transactions`), {
        ...newTransaction,
        amount: parseFloat(newTransaction.amount)
      });
      setNewTransaction({ type: 'Ingreso', category: 'Diezmo', amount: '', date: new Date().toISOString().split('T')[0], description: '' });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'transactions');
    }
  };

  const totalIncome = transactions.filter(t => t.type === 'Ingreso').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'Egreso').reduce((acc, t) => acc + t.amount, 0);
  const balance = totalIncome - totalExpense;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-72 bg-[#002157] text-white flex flex-col shadow-2xl z-20">
        <div className="p-8 border-b border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <img src="https://i.imgur.com/uKqj82Z.png" alt="GEDEÓN" className="h-10 w-auto" />
            <span className="text-xl font-display font-bold tracking-tight">GEDEÓN Admin</span>
          </div>
          <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Panel de Control</p>
        </div>

        <nav className="flex-1 p-6 space-y-2">
          {[
            { id: 'overview', name: 'Resumen', icon: LayoutDashboard },
            { id: 'members', name: 'Membresía', icon: Users },
            { id: 'groups', name: 'Grupos', icon: Target },
            { id: 'finance', name: 'Finanzas', icon: Wallet },
            { id: 'reports', name: 'Reportes', icon: BarChart3 },
            { id: 'settings', name: 'Configuración', icon: Settings },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all ${
                activeTab === item.id 
                  ? 'bg-[#D4AF37] text-[#002157] font-bold shadow-lg shadow-amber-500/20' 
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              {item.name}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-white/10">
          <div className="flex items-center gap-4 mb-6 px-2">
            <div className="w-10 h-10 rounded-full bg-[#D4AF37] flex items-center justify-center text-[#002157] font-bold">
              {user.email?.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-bold truncate">{user.email?.split('@')[0]}</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-tighter">Administrador</span>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-all font-medium"
          >
            <X size={20} />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-10">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-display text-[#002157] mb-1">
              {activeTab === 'overview' && 'Resumen General'}
              {activeTab === 'members' && 'Gestión de Membresía'}
              {activeTab === 'groups' && 'Gestión de Grupos'}
              {activeTab === 'finance' && 'Control Financiero'}
            </h1>
            <p className="text-slate-500">Bienvenido al centro de mando de su iglesia.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3 px-4">
              <Calendar size={18} className="text-[#D4AF37]" />
              <span className="text-sm font-medium text-slate-600">{new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>
        </header>

        {activeTab === 'overview' && (
          <div className="space-y-10">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Miembros Totales', value: members.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'Ingresos Mensuales', value: `$${totalIncome.toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { label: 'Gastos Mensuales', value: `$${totalExpense.toLocaleString()}`, icon: Wallet, color: 'text-rose-600', bg: 'bg-rose-50' },
                { label: 'Balance Neto', value: `$${balance.toLocaleString()}`, icon: BarChart3, color: 'text-amber-600', bg: 'bg-amber-50' },
              ].map((stat, i) => (
                <div key={i} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                  <div className={`${stat.bg} ${stat.color} w-12 h-12 rounded-2xl flex items-center justify-center mb-6`}>
                    <stat.icon size={24} />
                  </div>
                  <p className="text-slate-500 text-sm font-medium mb-1 uppercase tracking-wider">{stat.label}</p>
                  <h3 className="text-3xl font-bold text-[#002157]">{stat.value}</h3>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Recent Members */}
              <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-bold text-[#002157]">Últimos Miembros</h3>
                  <button onClick={() => setActiveTab('members')} className="text-sm font-bold text-[#D4AF37] hover:underline">Ver todos</button>
                </div>
                <div className="space-y-4">
                  {members.slice(0, 5).map((m, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-[#002157] font-bold">
                          {m.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-[#002157]">{m.fullName}</p>
                          <p className="text-xs text-slate-400">{m.email || 'Sin correo'}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                        m.status === 'Activo' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {m.status}
                      </span>
                    </div>
                  ))}
                  {members.length === 0 && <p className="text-center text-slate-400 py-10">No hay miembros registrados aún.</p>}
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-bold text-[#002157]">Actividad Financiera</h3>
                  <button onClick={() => setActiveTab('finance')} className="text-sm font-bold text-[#D4AF37] hover:underline">Ver todas</button>
                </div>
                <div className="space-y-4">
                  {transactions.slice(0, 5).map((t, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          t.type === 'Ingreso' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                        }`}>
                          {t.type === 'Ingreso' ? <TrendingUp size={18} /> : <Wallet size={18} />}
                        </div>
                        <div>
                          <p className="font-bold text-[#002157]">{t.category}</p>
                          <p className="text-xs text-slate-400">{t.date}</p>
                        </div>
                      </div>
                      <span className={`font-bold ${t.type === 'Ingreso' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {t.type === 'Ingreso' ? '+' : '-'}${t.amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                  {transactions.length === 0 && <p className="text-center text-slate-400 py-10">No hay transacciones registradas aún.</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'members' && (
          <div className="space-y-10">
            {/* Stats Header */}
            <div className="bg-[#002157] text-white p-10 rounded-[3rem] shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
               <div className="relative z-10">
                 <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-2">Estado Actual</p>
                 <h2 className="text-5xl font-display font-bold">
                   {members.length} <span className="text-2xl font-light text-slate-400">Miembros Registrados</span>
                 </h2>
               </div>
            </div>

            {/* Add Member Form */}
            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
              <h3 className="text-xl font-bold text-[#002157] mb-8 flex items-center gap-3">
                <UserCheck className="text-[#D4AF37]" />
                Registrar Nuevo Miembro
              </h3>
              <form onSubmit={handleAddMember} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nombre Completo</label>
                    <input 
                      required
                      value={newMember.fullName}
                      onChange={(e) => setNewMember({...newMember, fullName: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-3.5 focus:ring-2 focus:ring-[#002157] outline-none transition-all"
                      placeholder="Ej: Juan Pérez"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Teléfono</label>
                    <input 
                      value={newMember.phone}
                      onChange={(e) => setNewMember({...newMember, phone: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-3.5 focus:ring-2 focus:ring-[#002157] outline-none transition-all"
                      placeholder="+57 321 ..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Correo Electrónico</label>
                    <input 
                      type="email"
                      value={newMember.email}
                      onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-3.5 focus:ring-2 focus:ring-[#002157] outline-none transition-all"
                      placeholder="juan@ejemplo.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Grupo / Ministerio</label>
                    <input 
                      value={newMember.group}
                      onChange={(e) => setNewMember({...newMember, group: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-3.5 focus:ring-2 focus:ring-[#002157] outline-none transition-all"
                      placeholder="Ej: Jóvenes, Alabanza"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Fecha de Ingreso</label>
                    <input 
                      type="date"
                      required
                      value={newMember.entryDate}
                      onChange={(e) => setNewMember({...newMember, entryDate: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-3.5 focus:ring-2 focus:ring-[#002157] outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Estado</label>
                    <select 
                      value={newMember.status}
                      onChange={(e) => setNewMember({...newMember, status: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-3.5 focus:ring-2 focus:ring-[#002157] outline-none transition-all"
                    >
                      <option>Activo</option>
                      <option>Inactivo</option>
                      <option>Visitante</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Observaciones</label>
                  <textarea 
                    value={newMember.observations}
                    onChange={(e) => setNewMember({...newMember, observations: e.target.value})}
                    rows={3}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-3.5 focus:ring-2 focus:ring-[#002157] outline-none transition-all"
                    placeholder="Notas relevantes del miembro..."
                  />
                </div>

                <div className="flex justify-end">
                  <button type="submit" className="bg-[#002157] text-white px-10 py-4 rounded-2xl font-bold hover:bg-blue-900 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20">
                    <Users size={20} />
                    Registrar Miembro
                  </button>
                </div>
              </form>
            </div>

            {/* Members List */}
            <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <h3 className="text-xl font-bold text-[#002157]">Listado de Miembros</h3>
                <div className="relative w-full md:w-96">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input placeholder="Buscar por nombre, correo o grupo..." className="w-full pl-12 pr-6 py-3 bg-slate-50 border border-slate-200 rounded-full text-sm outline-none focus:ring-2 focus:ring-[#002157]" />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-widest">
                    <tr>
                      <th className="px-8 py-6">Miembro</th>
                      <th className="px-8 py-6">Contacto</th>
                      <th className="px-8 py-6">Grupo</th>
                      <th className="px-8 py-6">Estado</th>
                      <th className="px-8 py-6 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {members.map((m, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-[#002157] font-bold">
                              {m.fullName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-[#002157]">{m.fullName}</p>
                              <p className="text-[10px] text-slate-400 uppercase tracking-tighter">Desde: {m.entryDate}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex flex-col">
                            <span className="text-sm text-slate-600 font-medium">{m.phone || 'N/A'}</span>
                            <span className="text-xs text-slate-400">{m.email || 'Sin correo'}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="text-sm font-bold text-[#002157] bg-slate-100 px-3 py-1 rounded-lg">
                            {m.group || 'Sin Grupo'}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                            m.status === 'Activo' ? 'bg-emerald-100 text-emerald-700' : 
                            m.status === 'Inactivo' ? 'bg-rose-100 text-rose-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {m.status}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <button className="text-slate-400 hover:text-[#002157] p-2 transition-colors"><Settings size={18} /></button>
                          <button 
                            onClick={async () => {
                              if (confirm('¿Eliminar miembro?')) {
                                await deleteDoc(doc(db, `churches/default-church/members/${m.id}`));
                              }
                            }}
                            className="text-slate-400 hover:text-rose-500 p-2 transition-colors"
                          >
                            <X size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'groups' && (
          <div className="space-y-10">
            {/* Groups Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from(new Set(members.map(m => m.group || 'Sin Grupo'))).map((groupName, i) => {
                const count = members.filter(m => (m.group || 'Sin Grupo') === groupName).length;
                return (
                  <button 
                    key={i}
                    onClick={() => setSelectedGroup(groupName)}
                    className={`p-8 rounded-[2.5rem] border text-left transition-all ${
                      selectedGroup === groupName 
                      ? 'bg-[#002157] text-white border-transparent shadow-xl ring-4 ring-blue-900/10' 
                      : 'bg-white border-slate-100 hover:border-[#D4AF37]'
                    }`}
                  >
                    <div className={`${selectedGroup === groupName ? 'bg-white/10' : 'bg-slate-50'} w-12 h-12 rounded-2xl flex items-center justify-center mb-6`}>
                      <Target size={24} className={selectedGroup === groupName ? 'text-[#D4AF37]' : 'text-[#002157]'} />
                    </div>
                    <h4 className="text-lg font-bold mb-1">{groupName}</h4>
                    <p className={`text-sm ${selectedGroup === groupName ? 'text-slate-400' : 'text-slate-500'}`}>
                      {count} Miembros registrados
                    </p>
                  </button>
                );
              })}
            </div>

            {selectedGroup && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden"
              >
                <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <div>
                    <h3 className="text-xl font-bold text-[#002157]">Miembros de: {selectedGroup}</h3>
                    <p className="text-sm text-slate-500">Listado detallado del grupo seleccionado</p>
                  </div>
                  <button onClick={() => setSelectedGroup(null)} className="text-slate-400 hover:text-[#002157]">
                    <X size={24} />
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-widest border-b border-slate-100">
                      <tr>
                        <th className="px-8 py-6">Nombre</th>
                        <th className="px-8 py-6">Teléfono</th>
                        <th className="px-8 py-6">Correo</th>
                        <th className="px-8 py-6">Estado</th>
                        <th className="px-8 py-6">Observaciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {members.filter(m => (m.group || 'Sin Grupo') === selectedGroup).map((m, i) => (
                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                          <td className="px-8 py-6 font-bold text-[#002157]">{m.fullName}</td>
                          <td className="px-8 py-6 text-sm">{m.phone || '-'}</td>
                          <td className="px-8 py-6 text-sm">{m.email || '-'}</td>
                          <td className="px-8 py-6">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              m.status === 'Activo' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {m.status}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-sm text-slate-500 italic max-w-xs truncate">
                            {m.observations || 'Sin notas'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {activeTab === 'finance' && (
          <div className="space-y-10">
            {/* Add Transaction Form */}
            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
              <h3 className="text-xl font-bold text-[#002157] mb-8 flex items-center gap-3">
                <Wallet className="text-[#D4AF37]" />
                Registrar Movimiento
              </h3>
              <form onSubmit={handleAddTransaction} className="grid grid-cols-1 md:grid-cols-5 gap-6 items-end">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tipo</label>
                  <select 
                    value={newTransaction.type}
                    onChange={(e) => setNewTransaction({...newTransaction, type: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-3.5 focus:ring-2 focus:ring-[#002157] outline-none transition-all"
                  >
                    <option>Ingreso</option>
                    <option>Egreso</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Categoría</label>
                  <select 
                    value={newTransaction.category}
                    onChange={(e) => setNewTransaction({...newTransaction, category: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-3.5 focus:ring-2 focus:ring-[#002157] outline-none transition-all"
                  >
                    <option>Diezmo</option>
                    <option>Ofrenda</option>
                    <option>Gasto Operativo</option>
                    <option>Mantenimiento</option>
                    <option>Social</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Monto ($)</label>
                  <input 
                    type="number"
                    required
                    value={newTransaction.amount}
                    onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-3.5 focus:ring-2 focus:ring-[#002157] outline-none transition-all"
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Fecha</label>
                  <input 
                    type="date"
                    required
                    value={newTransaction.date}
                    onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-3.5 focus:ring-2 focus:ring-[#002157] outline-none transition-all"
                  />
                </div>
                <button type="submit" className="bg-[#002157] text-white py-3.5 rounded-2xl font-bold hover:bg-blue-900 transition-all flex items-center justify-center gap-2">
                  <TrendingUp size={20} />
                  Registrar
                </button>
              </form>
            </div>

            {/* Transactions List */}
            <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-8 border-b border-slate-100">
                <h3 className="text-xl font-bold text-[#002157]">Historial de Transacciones</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-widest">
                    <tr>
                      <th className="px-8 py-6">Fecha</th>
                      <th className="px-8 py-6">Categoría</th>
                      <th className="px-8 py-6">Tipo</th>
                      <th className="px-8 py-6 text-right">Monto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {transactions.sort((a, b) => b.date.localeCompare(a.date)).map((t, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-6 text-sm text-slate-600">{t.date}</td>
                        <td className="px-8 py-6 font-bold text-[#002157]">{t.category}</td>
                        <td className="px-8 py-6">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                            t.type === 'Ingreso' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                          }`}>
                            {t.type}
                          </span>
                        </td>
                        <td className={`px-8 py-6 text-right font-bold ${t.type === 'Ingreso' ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {t.type === 'Ingreso' ? '+' : '-'}${t.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const LoginPage = ({ onBack }: { onBack: () => void }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // For this demo, we'll use Google Login for simplicity and security
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login error:', error);
      alert('Error al iniciar sesión. Por favor intente con Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E5E7EB] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background elements for a tranquil, corporate feel */}
      <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#D4AF37]/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#002157]/10 rounded-full blur-[120px]"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/50 p-10 relative z-10"
      >
        <button 
          onClick={onBack}
          className="absolute top-8 left-8 text-slate-400 hover:text-[#002157] transition-colors flex items-center gap-2 text-sm font-medium group"
        >
          <ArrowRight className="rotate-180 group-hover:-translate-x-1 transition-transform" size={18} />
          Volver
        </button>

        <div className="text-center mb-10 pt-4">
          <div className="flex justify-center mb-6">
            <img 
              src="https://i.imgur.com/uKqj82Z.png" 
              alt="GEDEÓN Admin" 
              className="h-24 w-auto object-contain drop-shadow-md"
              referrerPolicy="no-referrer"
            />
          </div>
          <h2 className="text-3xl font-display text-[#002157] mb-2">GEDEÓN Admin</h2>
          <p className="text-slate-500 font-light">Ingrese sus credenciales de acceso</p>
        </div>

        <div className="space-y-6">
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-white border-2 border-slate-200 text-slate-700 py-4 rounded-2xl font-bold text-lg shadow-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-3 group"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            {loading ? 'Cargando...' : 'Ingresar con Google'}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-400">O use su cuenta Selah</span>
            </div>
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-6 opacity-50 pointer-events-none">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">Correo Electrónico</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#002157] transition-colors">
                  <User size={20} />
                </div>
                <input 
                  type="email" 
                  disabled
                  placeholder="pastor@iglesia.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 focus:outline-none transition-all placeholder:text-slate-300"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">Contraseña</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#002157] transition-colors">
                  <Lock size={20} />
                </div>
                <input 
                  type="password"
                  disabled
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-12 focus:outline-none transition-all placeholder:text-slate-300"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled
              className="w-full bg-[#002157] text-white py-4 rounded-2xl font-bold text-lg shadow-xl"
            >
              Iniciar Sesión
            </button>
          </form>
        </div>

        <div className="mt-10 text-center">
          <p className="text-slate-400 text-sm">
            ¿No tiene acceso? <br />
            <span className="text-[#002157] font-semibold cursor-pointer hover:underline">Contacte a soporte Selah Solutions</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

const Navbar = ({ onLoginClick }: { onLoginClick: () => void }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: "Inicio", href: "#inicio" },
    { name: "Sobre Nosotros", href: "#sobre-nosotros" },
    { name: "GEDEÓN Admin", href: "#gedeon-admin" },
    { name: "Servicios", href: "#servicios" },
    { name: "Contacto", href: "#contacto" },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-[#E5E7EB]/95 backdrop-blur-sm shadow-sm py-2' : 'bg-transparent py-4'}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <div className="flex-shrink-0">
          <span className="text-2xl font-display font-bold text-[#002157] tracking-tight">Selah Solutions</span>
        </div>
        <div className="hidden md:flex items-center space-x-10">
          {navLinks.map((link) => (
            <a key={link.name} href={link.href} className={`text-sm font-medium transition-colors ${isScrolled ? 'text-slate-700 hover:text-[#002157]' : 'text-[#002157] hover:text-slate-600'}`}>
              {link.name}
            </a>
          ))}
          <button 
            onClick={onLoginClick}
            className="bg-[#002157] text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-blue-900 transition-all shadow-lg flex items-center gap-2 group"
          >
            <LogIn size={16} className="group-hover:translate-x-0.5 transition-transform" />
            Ingresar a GEDEÓN Admin
          </button>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className={`md:hidden ${isScrolled ? 'text-slate-700' : 'text-[#002157]'}`}>
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute top-full left-0 right-0 bg-white shadow-xl md:hidden py-6 px-6 space-y-4">
            {navLinks.map((link) => (
              <a key={link.name} href={link.href} onClick={() => setIsMobileMenuOpen(false)} className="block text-lg font-medium text-slate-700">{link.name}</a>
            ))}
            <a 
              href="https://wa.me/573197268303" 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block w-full bg-slate-100 text-[#002157] py-3 rounded-xl font-semibold text-center mb-2"
            >
              Solicitar Diagnóstico Gratuito
            </a>
            <button 
              onClick={() => {
                setIsMobileMenuOpen(false);
                onLoginClick();
              }}
              className="block w-full bg-[#002157] text-white py-3 rounded-xl font-semibold text-center"
            >
              Ingresar a GEDEÓN Admin
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Hero = ({ onLoginClick }: { onLoginClick: () => void }) => (
  <section id="inicio" className="relative min-h-screen flex items-center justify-center overflow-hidden py-20 md:py-32">
    <div className="absolute inset-0 z-0">
      <motion.img 
        initial={{ scale: 1 }}
        animate={{ scale: 1.1 }}
        transition={{ 
          duration: 20, 
          repeat: Infinity, 
          repeatType: "reverse", 
          ease: "linear" 
        }}
        src={HERO_BG} 
        alt="Background" 
        className="w-full h-full object-cover opacity-60" 
        referrerPolicy="no-referrer" 
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#E5E7EB]/40 via-[#E5E7EB]/70 to-[#E5E7EB]"></div>
    </div>
    <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
      <motion.div 
        initial={{ opacity: 0, y: 30 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <div className="flex justify-center mb-8 md:mb-12">
          <motion.img 
            animate={{ 
              y: [0, -15, 0],
            }}
            transition={{ 
              duration: 6, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            src="https://i.imgur.com/d9JKB26.png" 
            alt="Selah Solutions Logo" 
            className="h-48 md:h-64 lg:h-80 w-auto object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.6)] rounded-2xl"
            referrerPolicy="no-referrer"
          />
        </div>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-display italic text-[#002157] mb-6 md:mb-8 leading-tight tracking-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
          “Pausa, claridad y dirección para la administración de la iglesia.”
        </h1>
        <p className="text-lg md:text-xl text-slate-600 mb-10 md:mb-12 max-w-3xl mx-auto leading-relaxed font-light px-4">
          Selah Solutions brinda el orden administrativo que su congregación necesita. A través de GEDEÓN Admin, unificamos la gestión de miembros, el desarrollo de líderes y la organización de eventos, integrando presupuestos y finanzas de manera natural y transparente.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a 
            href="https://wa.me/573197268303" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-[#002157] text-white px-10 py-4 md:px-12 md:py-5 rounded-full text-lg font-bold hover:bg-blue-900 transition-all shadow-2xl flex items-center group hover:scale-105 active:scale-95 w-full sm:w-fit"
          >
            Agendar diagnóstico gratuito
            <ArrowRight className="ml-3 group-hover:translate-x-2 transition-transform" size={24} />
          </a>
          <button 
            onClick={onLoginClick}
            className="bg-white text-[#002157] border-2 border-[#002157] px-10 py-4 md:px-12 md:py-5 rounded-full text-lg font-bold hover:bg-slate-50 transition-all shadow-xl flex items-center justify-center group hover:scale-105 active:scale-95 w-full sm:w-fit"
          >
            <LogIn className="mr-3 group-hover:translate-x-1 transition-transform" size={24} />
            Ingresar a GEDEÓN Admin
          </button>
        </div>
      </motion.div>
    </div>
  </section>
);

const WhySelah = () => (
  <section id="sobre-nosotros" className="py-32 bg-[#E5E7EB]">
    <div className="max-w-7xl mx-auto px-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
          <span className="text-[#D4AF37] font-bold tracking-[0.2em] uppercase text-xs mb-6 block">Nuestra Identidad</span>
          <h2 className="text-5xl md:text-6xl font-display text-[#002157] mb-10 leading-tight">El significado de Selah</h2>
          <div className="space-y-8 text-slate-600 text-xl leading-relaxed font-light">
            <p>Selah es un término bíblico que se encuentra en los Salmos, representando una pausa, un momento de reflexión, un detenerse para evaluar y tomar dirección.</p>
            <p className="font-medium text-[#002157] border-l-4 border-[#D4AF37] pl-6 italic">Selah representa el momento donde la iglesia se detiene para analizar su administración, tomar decisiones con sabiduría y ordenar lo que sostiene su visión.</p>
          </div>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {[
            { 
              title: "Una Pausa", 
              desc: "Detenerse para encontrar calma en medio del ruido corporativo.",
              image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800" 
            },
            { 
              title: "Reflexión", 
              desc: "Mirar hacia adentro con honestidad, propósito y luz.",
              image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800" 
            },
            { 
              title: "Evaluación", 
              desc: "Analizar los frutos y procesos con sabiduría y excelencia.",
              image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800" 
            },
            { 
              title: "Dirección", 
              desc: "Avanzar con claridad hacia la visión que Dios ha establecido.",
              image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80&w=800" 
            },
          ].map((item, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="group relative h-80 rounded-[2rem] overflow-hidden shadow-2xl"
            >
              <img 
                src={item.image} 
                alt={item.title} 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-8">
                <span className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">Concepto Selah</span>
                <h3 className="font-display text-white text-2xl mb-2">{item.title}</h3>
                <p className="text-white/70 text-sm font-light leading-snug opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0 transition-transform">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

const WhyGedeon = () => (
  <section className="py-32 bg-slate-50">
    <div className="max-w-7xl mx-auto px-6">
      <div className="flex flex-col lg:flex-row-reverse items-center gap-20">
        <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="lg:w-1/2">
          <span className="text-[#D4AF37] font-bold tracking-[0.2em] uppercase text-xs mb-6 block">Estrategia Bíblica</span>
          <h2 className="text-5xl md:text-6xl font-display text-[#002157] mb-10 leading-tight">El modelo GEDEÓN</h2>
          <div className="space-y-8 text-slate-600 text-xl leading-relaxed font-light">
            <p>Gedeón ganó con estrategia, no cantidad; optimizó recursos y actuó con dirección clara.</p>
            <p className="font-medium text-[#002157] border-l-4 border-[#D4AF37] pl-6 italic">GEDEÓN Admin es un sistema inspirado en principios de estrategia, orden y administración eficiente, diseñado para ayudar a iglesias a gestionar mejor sus recursos.</p>
          </div>
        </motion.div>
        <div className="lg:w-1/2 flex justify-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="w-full relative group"
          >
            <div className="absolute inset-0 bg-[#D4AF37]/10 rounded-3xl transform rotate-3 transition-transform group-hover:rotate-1"></div>
            <img 
              src="https://i.imgur.com/ZNHyxSm.png" 
              alt="Acróstico Modelo GEDEÓN" 
              className="relative z-10 w-full h-auto rounded-3xl shadow-2xl border-4 border-white object-contain"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        </div>
      </div>
    </div>
  </section>
);

const GedeonAdmin = () => (
  <section id="gedeon-admin" className="py-32 bg-[#002157] text-white overflow-hidden relative">
    <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-900/20 skew-x-12 transform translate-x-1/4"></div>
    <div className="max-w-7xl mx-auto px-6 relative z-10">
      <div className="text-center mb-20">
        <h2 className="text-5xl md:text-6xl font-display mb-8">Sistema GEDEÓN Admin</h2>
        <p className="text-2xl text-slate-300 max-w-3xl mx-auto font-light">Una solución administrativa práctica diseñada específicamente para las necesidades de la iglesia.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { title: "Control de Gastos", icon: Wallet, desc: "Seguimiento riguroso de cada salida de recursos." },
            { title: "Gestión de Compras", icon: ShoppingCart, desc: "Optimización de adquisiciones y proveedores." },
            { title: "Presupuesto", icon: BarChart3, desc: "Planificación financiera anual y mensual." },
            { title: "Ingresos", icon: TrendingUp, desc: "Registro transparente de diezmos y ofrendas." },
            { title: "Control de Gestión", icon: Target, desc: "Seguimiento de objetivos y metas ministeriales." },
            { title: "Líderes", icon: UserCheck, desc: "Administración de perfiles y capacitación." },
            { title: "Grupos", icon: Users, desc: "Organización de grupos pequeños y células." },
            { title: "Asistencia", icon: ClipboardList, desc: "Registro de participación en reuniones." },
            { title: "Membresía", icon: ShieldCheck, desc: "Base de datos de miembros y su crecimiento." },
            { title: "Eventos", icon: Calendar, desc: "Logística de actividades especiales." },
          ].map((item, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              viewport={{ once: true }}
              className="group flex flex-col p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-default"
            >
              <div className="flex items-center space-x-4 mb-3">
                <div className="w-10 h-10 bg-[#D4AF37]/20 rounded-xl flex items-center justify-center group-hover:bg-[#D4AF37] transition-colors">
                  <item.icon className="text-[#D4AF37] group-hover:text-[#002157]" size={22} />
                </div>
                <span className="text-lg font-medium">{item.title}</span>
              </div>
              <p className="text-sm text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-0 group-hover:h-auto overflow-hidden">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
        <div className="relative">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, rotate: -2 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-[2.5rem] shadow-2xl p-8 overflow-hidden border-[12px] border-slate-800 flex items-center justify-center"
          >
            <img 
              src="https://i.imgur.com/uKqj82Z.png" 
              alt="Sistema GEDEÓN Admin Logo" 
              className="w-full h-auto max-h-[400px] object-contain"
              referrerPolicy="no-referrer"
            />
          </motion.div>
          <div className="absolute -bottom-10 -right-10 h-48 w-48 bg-[#D4AF37]/30 rounded-full blur-3xl"></div>
          <div className="absolute -top-10 -left-10 h-48 w-48 bg-blue-400/20 rounded-full blur-3xl"></div>
        </div>
      </div>
    </div>
  </section>
);

const SearchCircle = ({ size }: { size: number }) => (
  <div className="relative">
    <Search size={size} />
    <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#D4AF37] rounded-full"></div>
  </div>
);

const Services = () => (
  <section id="servicios" className="py-32 bg-white relative overflow-hidden">
    {/* Decorative background elements */}
    <div className="absolute top-0 left-0 w-64 h-64 bg-[#D4AF37]/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
    <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#002157]/5 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl"></div>

    <div className="max-w-7xl mx-auto px-6 relative z-10">
      <div className="text-center mb-24">
        <motion.span 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-[#D4AF37] font-bold tracking-[0.3em] uppercase text-xs mb-4 block"
        >
          Excelencia Operativa
        </motion.span>
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-5xl md:text-6xl font-display text-[#002157] mb-8"
        >
          Nuestros Servicios
        </motion.h2>
        <motion.div 
          initial={{ width: 0 }}
          whileInView={{ width: 80 }}
          viewport={{ once: true }}
          className="h-1 bg-[#D4AF37] mx-auto rounded-full"
        ></motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[
          { 
            title: "Diagnóstico Administrativo", 
            desc: "Análisis profundo de sus procesos actuales para trazar una ruta clara hacia el orden y la eficiencia.", 
            icon: Search 
          },
          { 
            title: "Implementación GEDEÓN Admin", 
            desc: "Instalación y configuración experta del ecosistema administrativo integral diseñado para iglesias.", 
            icon: LayoutDashboard 
          },
          { 
            title: "Personalización a su Medida", 
            desc: "Adaptamos cada módulo del sistema para que responda exactamente a la realidad y estructura de su congregación.", 
            icon: Sliders 
          },
          { 
            title: "Gestión de Presupuestos", 
            desc: "Estructuración de presupuestos inteligentes que garantizan total transparencia y previsión financiera.", 
            icon: PieChart 
          },
          { 
            title: "Acompañamiento Continuo", 
            desc: "Soporte y mentoría constante para evolucionar administrativamente junto con el crecimiento de su iglesia.", 
            icon: HeartHandshake 
          },
          { 
            title: "Suscripción App & ERP", 
            desc: "Acceso total a la plataforma en la nube y App móvil para una administración conectada en tiempo real.", 
            icon: Cloud 
          },
        ].map((s, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            viewport={{ once: true }}
            className="group p-10 rounded-[2.5rem] bg-white border border-slate-100 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_60px_-20px_rgba(0,33,87,0.15)] hover:border-[#D4AF37]/30 transition-all duration-500 flex flex-col items-start text-left relative overflow-hidden"
          >
            {/* Hover accent */}
            <div className="absolute top-0 left-0 w-1 h-0 bg-[#D4AF37] group-hover:h-full transition-all duration-500"></div>
            
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-8 text-[#002157] group-hover:bg-[#002157] group-hover:text-white transition-all duration-500 shadow-inner">
              <s.icon size={32} strokeWidth={1.5} />
            </div>
            
            <h3 className="text-2xl font-bold mb-4 text-[#002157] leading-tight group-hover:text-[#D4AF37] transition-colors duration-300">
              {s.title}
            </h3>
            
            <p className="text-slate-500 text-lg leading-relaxed font-light mb-6">
              {s.desc}
            </p>
            
            <a 
              href={`https://wa.me/573197268303?text=${encodeURIComponent(`Hola, quiero saber más acerca de ${s.title}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto flex items-center text-[#D4AF37] font-bold text-sm uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-[-10px] group-hover:translate-x-0 cursor-pointer"
            >
              Saber más <ChevronRight size={16} className="ml-2" />
            </a>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const Benefits = () => (
  <section className="py-32 bg-slate-50 relative overflow-hidden">
    {/* Abstract background pattern */}
    <div className="absolute inset-0 opacity-40">
      <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(#002157 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
    </div>
    
    <div className="max-w-7xl mx-auto px-6 relative z-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
        <div className="max-w-2xl">
          <motion.span 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-[#D4AF37] font-bold tracking-[0.3em] uppercase text-xs mb-4 block"
          >
            Impacto Selah
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl md:text-6xl font-display text-[#002157] leading-tight"
          >
            Resultados que <br /> <span className="text-[#D4AF37]">Transforman</span>
          </motion.h2>
        </div>
        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-slate-600 text-xl font-light max-w-md border-l border-[#D4AF37]/30 pl-8"
        >
          Nuestra metodología GEDEÓN no solo ordena procesos, sino que fortalece la base operativa para el cumplimiento de la Gran Comisión.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[
          {
            title: "Optimización de Recursos",
            desc: "Maximización del impacto ministerial mediante una gestión eficiente de cada recurso disponible.",
            icon: Zap,
            color: "from-amber-500/10 to-transparent"
          },
          {
            title: "Ahorro de Tiempo y Dinero",
            desc: "Reducción drástica de costos operativos y tiempos de ejecución, permitiendo reinvertir en la obra.",
            icon: Clock,
            color: "from-emerald-500/10 to-transparent"
          },
          {
            title: "Transparencia Institucional",
            desc: "Sistemas de reporte claros que generan confianza y fidelidad en toda la congregación.",
            icon: ShieldCheck,
            color: "from-blue-500/10 to-transparent"
          },
          {
            title: "Visibilidad Estratégica",
            desc: "Datos precisos y en tiempo real para una toma de decisiones informada y con visión espiritual.",
            icon: Eye,
            color: "from-indigo-500/10 to-transparent"
          },
          {
            title: "Orden y Paz Administrativa",
            desc: "Eliminación del caos operativo, permitiendo que el liderazgo se enfoque plenamente en la visión.",
            icon: Target,
            color: "from-purple-500/10 to-transparent"
          },
          {
            title: "Crecimiento Sostenible",
            desc: "Estructuras sólidas preparadas para soportar y potenciar el crecimiento orgánico de la iglesia.",
            icon: Rocket,
            color: "from-rose-500/10 to-transparent"
          },
          {
            title: "Excelencia en el Servicio",
            desc: "Procesos ágiles que reflejan el carácter de excelencia que Dios demanda en Su obra.",
            icon: Award,
            color: "from-indigo-500/10 to-transparent"
          }
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            viewport={{ once: true }}
            whileHover={{ y: -10 }}
            className="group relative p-10 rounded-[3rem] bg-[#002157] border border-white/10 shadow-lg hover:shadow-2xl hover:border-[#D4AF37]/50 transition-all duration-500"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${item.color.replace('10', '20')} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[3rem]`}></div>
            
            <div className="relative z-10">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-8 text-[#D4AF37] group-hover:scale-110 group-hover:bg-[#D4AF37] group-hover:text-[#002157] transition-all duration-500">
                <item.icon size={28} strokeWidth={1.5} />
              </div>
              
              <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-[#D4AF37] transition-colors duration-300">
                {item.title}
              </h3>
              
              <p className="text-slate-300 text-lg leading-relaxed font-light group-hover:text-white transition-colors duration-300">
                {item.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const CTA = () => (
  <section className="py-32 bg-[#002157] text-white text-center relative overflow-hidden">
    <div className="absolute top-0 left-0 w-full h-full opacity-10">
      <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
    </div>
    <div className="max-w-4xl mx-auto px-6 relative z-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
      >
        <h2 className="text-5xl md:text-6xl font-display mb-8 leading-tight">¿Listo para ordenar la administración de tu iglesia?</h2>
        <p className="text-2xl text-slate-300 mb-12 font-light">Agenda un diagnóstico gratuito y conoce cómo implementar GEDEÓN Admin en tu iglesia.</p>
        <a 
          href="https://wa.me/573197268303" 
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-white text-[#002157] px-12 py-5 rounded-full text-xl font-bold hover:bg-slate-100 transition-all shadow-2xl hover:scale-105 active:scale-95"
        >
          Contactar ahora
        </a>
      </motion.div>
    </div>
  </section>
);

const Contact = () => (
  <section id="contacto" className="py-32 bg-white">
    <div className="max-w-7xl mx-auto px-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
        <div>
          <span className="text-[#D4AF37] font-bold tracking-[0.2em] uppercase text-xs mb-6 block">Contacto</span>
          <h2 className="text-5xl md:text-6xl font-display text-[#002157] mb-8">Hablemos</h2>
          <p className="text-xl text-slate-600 mb-12 font-light leading-relaxed">Completa el formulario y nos pondremos en contacto contigo a la brevedad para brindarte la claridad que tu iglesia necesita.</p>
          <div className="space-y-8">
            <a href="https://wa.me/573197268303" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-6 p-6 rounded-3xl bg-green-50 border border-green-100 text-green-800 cursor-pointer hover:bg-green-100 transition-all group">
              <div className="w-12 h-12 bg-green-500 text-white rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <MessageCircle size={28} />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg">Contactar por WhatsApp</span>
                <span className="text-sm opacity-80">Respuesta inmediata</span>
              </div>
            </a>
            <div className="flex items-center space-x-6 text-slate-600">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center">
                <Mail size={24} />
              </div>
              <span className="text-lg">selahconsultingsas@gmail.com</span>
            </div>
            <div className="flex items-center space-x-6 text-slate-600">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center">
                <Phone size={24} />
              </div>
              <span className="text-lg">+57 319 726 8303</span>
            </div>
          </div>
        </div>
        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-6 bg-slate-50 p-10 rounded-[3rem] border border-slate-100 shadow-sm"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input type="text" placeholder="Nombre" className="w-full px-6 py-4 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#002157] transition-all bg-white" />
            <input type="text" placeholder="Iglesia" className="w-full px-6 py-4 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#002157] transition-all bg-white" />
          </div>
          <input type="email" placeholder="Email" className="w-full px-6 py-4 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#002157] transition-all bg-white" />
          <input type="tel" placeholder="Teléfono" className="w-full px-6 py-4 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#002157] transition-all bg-white" />
          <textarea placeholder="Mensaje" rows={4} className="w-full px-6 py-4 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#002157] transition-all bg-white resize-none"></textarea>
          <button className="w-full bg-[#002157] text-white py-5 rounded-2xl font-bold shadow-xl hover:bg-blue-900 transition-all hover:scale-[1.02] active:scale-[0.98]">Enviar mensaje</button>
        </motion.form>
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="bg-slate-900 text-white py-16">
    <div className="max-w-7xl mx-auto px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
        <span className="text-2xl font-display font-bold text-white tracking-tight mb-8 md:mb-0">Selah Solutions</span>
        <div className="flex flex-wrap gap-8">
          <a href="#inicio" className="text-slate-400 hover:text-white transition-colors">Inicio</a>
          <a href="#sobre-nosotros" className="text-slate-400 hover:text-white transition-colors">Sobre Nosotros</a>
          <a href="#gedeon-admin" className="text-slate-400 hover:text-white transition-colors">GEDEÓN Admin</a>
          <a href="#servicios" className="text-slate-400 hover:text-white transition-colors">Servicios</a>
          <a href="#contacto" className="text-slate-400 hover:text-white transition-colors">Contacto</a>
        </div>
      </div>
      <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-slate-500 text-sm">
        <div className="flex flex-col items-center md:items-start">
          <p>&copy; {new Date().getFullYear()} Selah Solutions. Todos los derechos reservados.</p>
          <p className="mt-1">Bogotá, Colombia</p>
        </div>
        <div className="flex space-x-6 mt-4 md:mt-0">
          <Facebook size={18} className="hover:text-white cursor-pointer" />
          <Instagram size={18} className="hover:text-white cursor-pointer" />
          <Linkedin size={18} className="hover:text-white cursor-pointer" />
        </div>
      </div>
    </div>
  </footer>
);

// Re-defining Search to avoid confusion if needed, but using Lucide's Search
const SearchIcon = ({ size }: { size: number }) => <Search size={size} />;

export default function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (showLogin) {
      window.scrollTo(0, 0);
    }
  }, [showLogin]);

  if (!authReady) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-[#002157] border-t-[#D4AF37] rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-blue-100 selection:text-[#002157] scroll-smooth relative">
      {user ? (
        <Dashboard user={user} onLogout={() => signOut(auth)} />
      ) : showLogin ? (
        <LoginPage onBack={() => setShowLogin(false)} />
      ) : (
        <>
          <Navbar onLoginClick={() => setShowLogin(true)} />
          <main>
            <Hero onLoginClick={() => setShowLogin(true)} />
            <WhySelah />
            <WhyGedeon />
            <GedeonAdmin />
            <Services />
            <Benefits />
            <CTA />
            <Contact />
          </main>
          <Footer />
        </>
      )}

      {/* Persistent Action Floating Buttons */}
      <div className={`fixed bottom-8 ${user ? 'left-[300px]' : 'left-8'} z-50 flex flex-col gap-4 transition-all duration-500`}>
        <motion.a 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          href="https://wa.me/573197268303?text=Hola,%20quisiera%20agendar%20un%20diagnóstico%20gratuito" 
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-[#002157] text-white px-6 py-4 md:px-8 md:py-4 rounded-full shadow-2xl hover:bg-blue-900 transition-all hover:scale-105 active:scale-95 flex items-center gap-3 group border border-[#D4AF37]/30"
        >
          <Calendar size={20} className="text-[#D4AF37]" />
          <span className="font-bold whitespace-nowrap hidden sm:inline text-sm md:text-base">Agendar diagnóstico gratuito</span>
          <span className="font-bold whitespace-nowrap sm:hidden">Agendar</span>
        </motion.a>
      </div>

      {/* WhatsApp Floating Button */}
      <motion.a 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        href="https://wa.me/573197268303" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 z-50 bg-green-500 text-white p-4 rounded-full shadow-2xl hover:bg-green-600 transition-all hover:scale-110 active:scale-95 group"
      >
        <MessageCircle size={32} />
        <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-white text-slate-800 px-4 py-2 rounded-xl shadow-xl text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          ¿Necesitas ayuda?
        </span>
      </motion.a>
    </div>
  );
}
