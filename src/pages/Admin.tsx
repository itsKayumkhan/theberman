
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { LogOut, RefreshCw, MessageSquare, Trash2, Eye, X, Mail, Phone, MapPin, Home, Calendar, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface Lead {
    id: string;
    created_at: string;
    name: string;
    email: string;
    phone: string;
    message: string;
    status: string;
    county?: string;
    town?: string;
    property_type?: string;
    purpose?: string;
}

const Admin = () => {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
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
            if (selectedLead?.id === id) {
                setSelectedLead({ ...selectedLead, status: newStatus });
            }
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
            if (selectedLead?.id === id) setSelectedLead(null);
        } catch (error) {
            console.error('Error deleting lead:', error);
        }
    };

    const [showPromoModal, setShowPromoModal] = useState(false);
    const [promoSettings, setPromoSettings] = useState({
        is_enabled: false,
        headline: '',
        sub_text: '',
        image_url: '',
        destination_url: ''
    });

    const fetchPromoSettings = async () => {
        try {
            const { data, error } = await supabase
                .from('promo_settings')
                .select('*')
                .eq('id', 1)
                .maybeSingle();

            if (data) {
                setPromoSettings(data);
            } else if (!error) {
                // Initialize if not exists (though migration should handle this, doing it here too is safe)
                const defaultSettings = { id: 1, is_enabled: false, headline: 'Considering Solar Panels?', sub_text: 'Compare the Best Solar Deals', image_url: '', destination_url: '' };
                setPromoSettings(defaultSettings);
            }
        } catch (error) {
            console.error('Error fetching promo settings:', error);
        }
    };

    const savePromoSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const updates = {
                id: 1,
                is_enabled: promoSettings.is_enabled,
                headline: promoSettings.headline,
                sub_text: promoSettings.sub_text,
                image_url: promoSettings.image_url,
                destination_url: promoSettings.destination_url,
                updated_at: new Date().toISOString()
            };

            const { data, error } = await supabase
                .from('promo_settings')
                .upsert(updates)
                .select()
                .single();

            if (error) throw error;

            if (data) {
                setPromoSettings(data);
            }
            setShowPromoModal(false);
            toast.success('Promo settings updated successfully!');
        } catch (error: any) {
            console.error('Error saving promo settings:', error);
            toast.error(`Failed to update settings: ${error.message || 'Unknown error'}`);
        }
    };

    useEffect(() => {
        fetchLeads();
        fetchPromoSettings();
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
        <div className="min-h-screen bg-gray-50 font-sans relative">
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
                        <button
                            onClick={() => setShowPromoModal(true)}
                            className="text-sm text-gray-600 hover:text-[#007F00] font-medium transition-colors"
                        >
                            Partner Promo
                        </button>
                        <span className="w-px h-4 bg-gray-300 hidden md:block"></span>
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
                        <RefreshCw className={loading ? 'animate-spin' : ''} size={16} />
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
                        {/* Mobile View: Cards */}
                        <div className="md:hidden">
                            {leads.map((lead) => (
                                <div key={lead.id} className="p-4 border-b border-gray-100 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-gray-900">{lead.name}</p>
                                            <p className="text-xs text-gray-500">{new Date(lead.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <div className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusColor(lead.status || 'new')}`}>
                                            {lead.status || 'new'}
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        <p>{lead.email}</p>
                                        <p className="mt-1">{lead.town}, {lead.county}</p>
                                    </div>
                                    <div className="flex justify-end gap-2 pt-2">
                                        <button
                                            onClick={() => setSelectedLead(lead)}
                                            className="text-xs bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg font-bold text-gray-700"
                                        >
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop View: Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-600">
                                <thead className="bg-gray-50/50 text-gray-900 font-bold uppercase tracking-wider text-xs border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4">Client Name</th>
                                        <th className="px-6 py-4">Location</th>
                                        <th className="px-6 py-4">Purpose</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {leads.map((lead) => (
                                        <tr key={lead.id} className="hover:bg-green-50/30 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${getStatusColor(lead.status || 'new')}`}>
                                                    {lead.status || 'new'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                                {new Date(lead.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-gray-900">
                                                {lead.name}
                                                <div className="text-xs text-gray-400 font-normal">{lead.email}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {lead.town ? `${lead.town}, ${lead.county || ''} ` : '-'}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500">
                                                {lead.purpose || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => setSelectedLead(lead)}
                                                        className="flex items-center gap-1 bg-white border border-gray-200 text-gray-600 hover:text-[#007F00] hover:border-[#007F00] px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
                                                    >
                                                        <Eye size={14} />
                                                        View More
                                                    </button>
                                                    <button
                                                        onClick={() => deleteLead(lead.id)}
                                                        className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                                                        title="Delete Lead"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>

            {/* PROMO SETTINGS MODAL */}
            {showPromoModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Partner Promo Settings</h3>
                            <button onClick={() => setShowPromoModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={savePromoSettings} className="space-y-4">
                            <div className="flex items-center gap-2 mb-4">
                                <input
                                    type="checkbox"
                                    id="promo_enabled"
                                    checked={promoSettings.is_enabled}
                                    onChange={(e) => setPromoSettings({ ...promoSettings, is_enabled: e.target.checked })}
                                    className="w-4 h-4 text-[#007F00] focus:ring-[#007F00] border-gray-300 rounded"
                                />
                                <label htmlFor="promo_enabled" className="text-sm font-medium text-gray-700">
                                    Enable Partner Promo in Emails
                                </label>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Headline</label>
                                <input
                                    type="text"
                                    value={promoSettings.headline || ''}
                                    onChange={(e) => setPromoSettings({ ...promoSettings, headline: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#007F00]"
                                    placeholder="e.g. Considering Solar Panels?"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Sub-text</label>
                                <input
                                    type="text"
                                    value={promoSettings.sub_text || ''}
                                    onChange={(e) => setPromoSettings({ ...promoSettings, sub_text: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#007F00]"
                                    placeholder="e.g. Compare the Best Solar Deals"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Image URL</label>
                                <input
                                    type="text"
                                    value={promoSettings.image_url || ''}
                                    onChange={(e) => setPromoSettings({ ...promoSettings, image_url: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#007F00]"
                                    placeholder="https://example.com/banner.png"
                                />
                                {promoSettings.image_url && (
                                    <div className="mt-2 bg-gray-50 p-2 rounded border border-gray-200">
                                        <p className="text-xs text-gray-500 mb-1">Preview:</p>
                                        <img src={promoSettings.image_url} alt="Preview" className="h-16 object-contain" />
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Destination URL</label>
                                <input
                                    type="text"
                                    value={promoSettings.destination_url || ''}
                                    onChange={(e) => setPromoSettings({ ...promoSettings, destination_url: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#007F00]"
                                    placeholder="https://partner-site.com"
                                />
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowPromoModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-bold text-white bg-[#007F00] rounded-lg hover:bg-green-800"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* LEAL DETAILS MODAL */}
            {selectedLead && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="bg-white border-b border-gray-100 p-6 flex justify-between items-start shrink-0">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">Lead Details</h3>
                                <p className="text-sm text-gray-400 flex items-center gap-2 mt-1.5 font-medium">
                                    <Calendar size={14} />
                                    Received: {new Date(selectedLead.created_at).toLocaleString()}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="relative group">
                                    <select
                                        value={selectedLead.status || 'new'}
                                        onChange={(e) => updateStatus(selectedLead.id, e.target.value)}
                                        className={`appearance-none cursor-pointer pl-4 pr-9 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border-0 ring-1 ring-inset focus:ring-2 outline-none transition-all shadow-sm ${getStatusColor(selectedLead.status || 'new')} ring-black/5 hover:ring-black/10`}
                                    >
                                        <option value="new">New</option>
                                        <option value="contacted">Contacted</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500/80 pointer-events-none group-hover:text-gray-700 transition-colors" size={14} />
                                </div>
                                <button
                                    onClick={() => setSelectedLead(null)}
                                    className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 pt-2 overflow-y-auto space-y-4 grow">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Client Info Card */}
                                <div className="border border-gray-100 rounded-2xl p-6 bg-white hover:border-[#007F00]/30 hover:shadow-md hover:shadow-green-500/5 transition-all duration-300 group">
                                    <div className="flex items-center justify-between mb-6">
                                        <h4 className="text-[11px] font-extrabold text-[#007F00] uppercase tracking-widest bg-green-50 px-3 py-1 rounded-full">Client Information</h4>
                                    </div>

                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-50 to-green-100 text-[#007F00] flex items-center justify-center font-bold text-xl shadow-sm border border-green-200/50">
                                            {selectedLead.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 text-lg break-words">{selectedLead.name}</p>
                                            <p className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded inline-block mt-1">Customer</p>
                                        </div>
                                    </div>

                                    <div className="border-t border-dashed border-gray-200 my-5"></div>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 text-sm text-gray-600 font-medium p-2 hover:bg-gray-50 rounded-lg transition-colors -mx-2 break-all">
                                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#007F00]/10 group-hover:text-[#007F00] transition-colors shrink-0">
                                                <Mail size={16} />
                                            </div>
                                            {selectedLead.email}
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-gray-600 font-medium p-2 hover:bg-gray-50 rounded-lg transition-colors -mx-2">
                                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#007F00]/10 group-hover:text-[#007F00] transition-colors shrink-0">
                                                <Phone size={16} />
                                            </div>
                                            {selectedLead.phone}
                                        </div>
                                    </div>
                                </div>

                                {/* Property Info Card */}
                                <div className="border border-gray-100 rounded-2xl p-6 bg-white hover:border-[#007EA7]/30 hover:shadow-md hover:shadow-blue-500/5 transition-all duration-300 h-full flex flex-col justify-between group">
                                    <div>
                                        <div className="flex items-center justify-between mb-6">
                                            <h4 className="text-[11px] font-extrabold text-[#007EA7] uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">Property Details</h4>
                                        </div>
                                        <div className="space-y-6">
                                            <div className="flex items-start gap-4 p-2 -mx-2">
                                                <div className="w-10 h-10 rounded-full bg-blue-50 text-[#007EA7] flex items-center justify-center shrink-0 border border-blue-100">
                                                    <MapPin size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 text-lg leading-tight mb-1">{selectedLead.town || 'Not provided'}</p>
                                                    <p className="text-sm text-gray-500 font-medium">{selectedLead.county || 'County not provided'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm text-gray-700 p-2 hover:bg-blue-50/50 rounded-lg transition-colors -mx-2">
                                                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#007EA7]/10 group-hover:text-[#007EA7] transition-colors shrink-0">
                                                    <Home size={18} />
                                                </div>
                                                <span className="font-medium text-gray-600">{selectedLead.property_type || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6">
                                        <div className="inline-flex items-center px-4 py-1.5 bg-[#007EA7] text-white rounded-full text-xs font-bold shadow-sm">
                                            Purpose: {selectedLead.purpose || 'N/A'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Message */}
                            <div>
                                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 pl-1">MESSAGE FROM CLIENT</h4>
                                <div className="bg-gray-50 rounded-xl p-6 text-gray-700 text-sm leading-relaxed border border-gray-100 font-medium">
                                    {selectedLead.message}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                <button
                                    onClick={() => {
                                        window.location.href = `mailto:${selectedLead.email}?subject=${encodeURIComponent('Quote for your project - The Berman')}&body=${encodeURIComponent(`Hi ${selectedLead.name},\n\nBased on your requirements for ${selectedLead.purpose || 'your project'}, we are pleased to provide the following quote:\n\n[Insert Quote Details Here]\n\nPlease let us know if you would like to proceed.\n\nBest regards,\nThe Berman Team`)}`;
                                    }}
                                    className="w-full bg-[#007F00] text-white font-bold text-sm py-4 rounded-xl hover:bg-green-800 transition-colors flex items-center justify-center gap-2 shadow-sm hover:shadow-md cursor-pointer no-underline"
                                >
                                    <MessageSquare size={18} />
                                    Generate Quote
                                </button>
                                <button
                                    onClick={() => {
                                        window.location.href = `mailto:${selectedLead.email}?subject=${encodeURIComponent('Re: Your inquiry to The Berman')}&body=${encodeURIComponent(`Hi ${selectedLead.name},\n\nThank you for reaching out regarding your property in ${selectedLead.town || 'your area'}.\n\n`)}`;
                                    }}
                                    className="w-full bg-white border-2 border-gray-900 text-gray-900 font-bold text-sm py-4 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 cursor-pointer no-underline"
                                >
                                    <Mail size={18} />
                                    Email Client
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Admin;
