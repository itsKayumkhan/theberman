import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { LogOut, RefreshCw, Mail, Phone, Calendar, MessageSquare, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Lead {
    id: string;
    created_at: string;
    name: string;
    email: string;
    phone: string;
    message: string;
    status: string;
}

const Admin = () => {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const { signOut, user } = useAuth();
    const navigate = useNavigate();

    const fetchLeads = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('leads')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setLeads(data || []);
        } catch (error) {
            console.error('Error fetching leads:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from('leads')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;
            // Optimistic update
            setLeads(leads.map(lead => lead.id === id ? { ...lead, status: newStatus } : lead));
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const deleteLead = async (id: string) => {
        if (!confirm('Are you sure you want to delete this lead?')) return;
        try {
            const { error } = await supabase
                .from('leads')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setLeads(leads.filter(lead => lead.id !== id));
        } catch (error) {
            console.error('Error deleting lead:', error);
        }
    };

    useEffect(() => {
        fetchLeads();
    }, []);

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'new': return 'bg-blue-100 text-blue-800';
            case 'contacted': return 'bg-yellow-100 text-yellow-800';
            case 'completed': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Admin Header */}
            <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#007F00] rounded-lg flex items-center justify-center text-white font-bold">
                            BM
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                Live Connection
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-gray-600 hidden md:block">
                            {user?.email}
                        </span>
                        <button
                            onClick={handleSignOut}
                            className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 transition-colors border px-3 py-1.5 rounded-lg hover:bg-gray-50"
                        >
                            <LogOut size={16} />
                            Sign Out
                        </button>
                    </div>
                </div>
            </header>

            {/* Dashboard Content */}
            <main className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Leads & Inquiries</h2>
                        <p className="text-gray-500 text-sm mt-1">Manage your website submissions.</p>
                    </div>
                    <button
                        onClick={fetchLeads}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm text-gray-700 hover:text-[#007F00] hover:border-[#007F00]"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        Refresh Data
                    </button>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
                        <RefreshCw className="animate-spin text-[#007F00] mb-4" size={32} />
                        <p className="text-gray-500 font-medium">Loading your leads...</p>
                    </div>
                ) : leads.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                            <MessageSquare size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">No leads yet</h3>
                        <p className="text-gray-500">New form submissions will appear here.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-600">
                                <thead className="bg-gray-50/50 text-gray-900 font-bold uppercase tracking-wider text-xs border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Date Received</th>
                                        <th className="px-6 py-4">Client Details</th>
                                        <th className="px-6 py-4 w-1/3">Message</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {leads.map((lead) => (
                                        <tr key={lead.id} className="hover:bg-green-50/30 transition-colors group">
                                            <td className="px-6 py-4">
                                                <select
                                                    value={lead.status || 'new'}
                                                    onChange={(e) => updateStatus(lead.id, e.target.value)}
                                                    className={`appearance-none cursor-pointer pl-3 pr-8 py-1 rounded-full text-xs font-bold uppercase tracking-wide border-0 focus:ring-2 focus:ring-green-500 outline-none transition-all ${getStatusColor(lead.status || 'new')}`}
                                                >
                                                    <option value="new">New</option>
                                                    <option value="contacted">Contacted</option>
                                                    <option value="completed">Completed</option>
                                                </select>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2 font-medium text-gray-900">
                                                    <Calendar size={14} className="text-[#007F00]" />
                                                    {new Date(lead.created_at).toLocaleDateString()}
                                                </div>
                                                <div className="text-xs text-gray-400 pl-6 mt-0.5">
                                                    {new Date(lead.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-900 text-base mb-1">{lead.name}</div>
                                                <div className="flex flex-col gap-1 text-xs">
                                                    <div className="flex items-center gap-2 hover:text-[#007F00] transition-colors cursor-pointer" title="Copy Email" onClick={() => navigator.clipboard.writeText(lead.email)}>
                                                        <Mail size={12} className="text-gray-400" />
                                                        <span>{lead.email}</span>
                                                    </div>
                                                    {lead.phone && (
                                                        <div className="flex items-center gap-2 hover:text-[#007F00] transition-colors cursor-pointer" title="Copy Phone" onClick={() => navigator.clipboard.writeText(lead.phone)}>
                                                            <Phone size={12} className="text-gray-400" />
                                                            <span>{lead.phone}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-gray-700 italic text-sm">
                                                    "{lead.message}"
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => deleteLead(lead.id)}
                                                    className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                                                    title="Delete Lead"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Admin;
