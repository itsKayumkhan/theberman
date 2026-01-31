
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

interface Assessment {
    id: string;
    created_at: string;
    property_address: string;
    status: 'draft' | 'submitted' | 'pending_quote' | 'quote_accepted' | 'scheduled' | 'completed';
    scheduled_date: string | null;
    certificate_url: string | null;
    eircode?: string;
    town?: string;
    county?: string;
    property_type?: string;
    user_id: string;
    profiles?: {
        full_name: string;
        email: string;
    };
}

interface Sponsor {
    id: string;
    name: string;
    headline: string;
    sub_text: string;
    image_url: string;
    destination_url: string;
    is_active: boolean;
}

const Admin = () => {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [sponsors, setSponsors] = useState<Sponsor[]>([]); // New state
    const [view, setView] = useState<'leads' | 'assessments'>('leads');
    const [loading, setLoading] = useState(true);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
    const [showQuoteModal, setShowQuoteModal] = useState(false);
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [showCompleteModal, setShowCompleteModal] = useState(false);

    // Sponsor Modal State
    const [showSponsorModal, setShowSponsorModal] = useState(false);
    const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null);

    const [selectedDate, setSelectedDate] = useState('');
    const [certUrl, setCertUrl] = useState('');

    // Quote Form State
    const [quoteData, setQuoteData] = useState({
        price: '',
        estimated_date: '',
        notes: ''
    });

    // Message Form State
    const [messageContent, setMessageContent] = useState('');

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

    const fetchAssessments = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('assessments')
                .select(`
                    *,
                    profiles:user_id (full_name, email)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setAssessments(data || []);
        } catch (error) {
            console.error('Error fetching assessments:', error);
            toast.error('Failed to load assessments');
        } finally {
            setLoading(false);
        }
    };

    const logAudit = async (action: string, entityType: string, entityId: string, details: any) => {
        try {
            await supabase.from('audit_logs').insert({
                user_id: user?.id,
                action,
                entity_type: entityType,
                entity_id: entityId,
                details
            });
        } catch (error) {
            console.error('Audit log error:', error);
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

    const fetchSponsors = async () => {
        try {
            const { data, error } = await supabase
                .from('sponsors')
                .select('*')
                .order('created_at', { ascending: true });

            if (error) throw error;
            setSponsors(data || []);
        } catch (error) {
            console.error('Error fetching sponsors:', error);
            toast.error('Failed to load sponsors');
        }
    };

    const handleSaveSponsor = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const updates = {
            name: formData.get('name') as string,
            headline: formData.get('headline') as string,
            sub_text: formData.get('sub_text') as string,
            image_url: formData.get('image_url') as string,
            destination_url: formData.get('destination_url') as string,
            is_active: true, // Default to true for now
            updated_at: new Date().toISOString()
        };

        try {
            let data, error;

            if (editingSponsor) {
                const result = await supabase
                    .from('sponsors')
                    .update(updates)
                    .eq('id', editingSponsor.id)
                    .select()
                    .single();
                data = result.data;
                error = result.error;
            } else {
                const result = await supabase
                    .from('sponsors')
                    .insert(updates)
                    .select()
                    .single();
                data = result.data;
                error = result.error;
            }

            if (error) throw error;

            if (editingSponsor) {
                setSponsors(sponsors.map(s => s.id === editingSponsor.id ? data : s));
                toast.success('Sponsor updated!');
            } else {
                setSponsors([...sponsors, data]);
                toast.success('Sponsor added!');
            }
            setShowSponsorModal(false);
            setEditingSponsor(null);
        } catch (error: any) {
            console.error('Error saving sponsor:', error);
            toast.error(`Failed to save sponsor: ${error.message}`);
        }
    };

    const handleDeleteSponsor = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        try {
            const { error } = await supabase
                .from('sponsors')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setSponsors(sponsors.filter(s => s.id !== id));
            toast.success('Sponsor deleted');
        } catch (error: any) {
            console.error('Error deleting sponsor:', error);
            toast.error('Failed to delete sponsor');
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
        if (view === 'leads') {
            fetchLeads();
        } else {
            fetchAssessments();
        }
        fetchPromoSettings();

        // Real-time
        const channel = supabase
            .channel('admin-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => fetchLeads())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'assessments' }, () => fetchAssessments())
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [view]);

    const handleGenerateQuote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAssessment) return;

        try {
            // 1. Create Quote
            const { data: quote, error: quoteError } = await supabase.from('quotes').insert({
                assessment_id: selectedAssessment.id,
                price: parseFloat(quoteData.price),
                estimated_date: quoteData.estimated_date || null,
                notes: quoteData.notes,
                created_by: user?.id
            }).select().single();

            if (quoteError) throw quoteError;

            // 2. Update Assessment Status
            const { error: updateError } = await supabase
                .from('assessments')
                .update({ status: 'pending_quote' })
                .eq('id', selectedAssessment.id);

            if (updateError) throw updateError;

            // 3. Log Audit
            await logAudit('generate_quote', 'assessment', selectedAssessment.id, {
                quote_id: quote.id,
                price: quoteData.price
            });

            toast.success('Quote generated successfully!');
            setShowQuoteModal(false);
            setQuoteData({ price: '', estimated_date: '', notes: '' });
            fetchAssessments();
        } catch (error: any) {
            console.error('Error generating quote:', error);
            toast.error(error.message || 'Failed to generate quote');
        }
    };

    const handleSchedule = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAssessment || !selectedDate) return;

        try {
            const { error } = await supabase
                .from('assessments')
                .update({
                    status: 'scheduled',
                    scheduled_date: selectedDate
                })
                .eq('id', selectedAssessment.id);

            if (error) throw error;

            await logAudit('schedule_assessment', 'assessment', selectedAssessment.id, { scheduled_date: selectedDate });

            toast.success('Assessment scheduled!');
            setShowScheduleModal(false);
            fetchAssessments();
        } catch (error: any) {
            toast.error(error.message || 'Failed to schedule');
        }
    };

    const handleComplete = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAssessment) return;

        try {
            const { error } = await supabase
                .from('assessments')
                .update({
                    status: 'completed',
                    certificate_url: certUrl
                })
                .eq('id', selectedAssessment.id);

            if (error) throw error;

            await logAudit('complete_assessment', 'assessment', selectedAssessment.id, { certificate_url: certUrl });

            toast.success('Assessment marked as completed!');
            setShowCompleteModal(false);
            setCertUrl('');
            fetchAssessments();
        } catch (error: any) {
            toast.error(error.message || 'Failed to complete');
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAssessment || !messageContent.trim()) return;

        try {
            const { data: message, error: messageError } = await supabase.from('assessment_messages').insert({
                assessment_id: selectedAssessment.id,
                sender_id: user?.id,
                content: messageContent
            }).select().single();

            if (messageError) throw messageError;

            // Log Audit
            await logAudit('send_message', 'assessment', selectedAssessment.id, {
                message_id: message.id
            });

            toast.success('Message sent to client!');
            setShowMessageModal(false);
            setMessageContent('');
        } catch (error: any) {
            console.error('Error sending message:', error);
            toast.error(error.message || 'Failed to send message');
        }
    };

    const handleConvertLead = async (): Promise<string | null> => {
        if (!selectedLead) return null;

        try {
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('id, full_name')
                .eq('email', selectedLead.email)
                .maybeSingle();

            if (profileError) throw profileError;

            if (!profile) {
                toast.error(`${selectedLead.name} does not have an account yet. They must register using ${selectedLead.email} first.`);
                return null;
            }

            const { data: assessment, error: assessmentError } = await supabase
                .from('assessments')
                .insert({
                    user_id: profile.id,
                    property_address: selectedLead.town || 'Details pending',
                    town: selectedLead.town,
                    county: selectedLead.county,
                    property_type: selectedLead.property_type,
                    status: 'submitted'
                })
                .select()
                .single();

            if (assessmentError) throw assessmentError;

            await updateStatus(selectedLead.id, 'contacted');

            await logAudit('convert_lead', 'assessment', assessment.id, {
                lead_id: selectedLead.id,
                client_email: selectedLead.email
            });

            toast.success('Lead converted to official assessment!');
            return assessment.id;
        } catch (error: any) {
            console.error('Error converting lead:', error);
            toast.error(error.message || 'Failed to convert lead');
            return null;
        }
    };

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'new':
            case 'pending': return 'bg-blue-100 text-blue-800';
            case 'contacted':
            case 'pending_quote': return 'bg-yellow-100 text-yellow-800';
            case 'completed': return 'bg-green-100 text-green-800';
            case 'scheduled': return 'bg-purple-100 text-purple-800';
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
                            onClick={() => { setShowSponsorModal(true); fetchSponsors(); }}
                            className="text-sm text-gray-600 hover:text-[#007F00] font-medium transition-colors"
                        >
                            Manage Sponsors
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
                    <div className="flex flex-col gap-4 w-full md:w-auto">
                        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-200">
                            <button
                                onClick={() => setView('leads')}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${view === 'leads' ? 'bg-[#007F00] text-white' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Leads
                            </button>
                            <button
                                onClick={() => setView('assessments')}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${view === 'assessments' ? 'bg-[#007F00] text-white' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Assessments
                            </button>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">{view === 'leads' ? 'Leads & Inquiries' : 'BER Assessments'}</h2>
                            <p className="text-gray-500 text-sm mt-1">
                                {view === 'leads' ? 'Manage your website submissions.' : 'Manage homeowner assessment requests.'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={view === 'leads' ? fetchLeads : fetchAssessments}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm text-gray-700 hover:text-[#007F00] hover:border-[#007F00]"
                    >
                        <RefreshCw className={loading ? 'animate-spin' : ''} size={16} />
                        Refresh Data
                    </button>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
                        <RefreshCw className="animate-spin text-[#007F00] mb-4" size={32} />
                        <p className="text-gray-500 font-medium">Loading {view}...</p>
                    </div>
                ) : (view === 'leads' ? leads : assessments).length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                            {view === 'leads' ? <MessageSquare size={32} /> : <Home size={32} />}
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">No {view} yet</h3>
                        <p className="text-gray-500">{view === 'leads' ? 'New form submissions will appear here.' : 'Homeowner requests will appear here.'}</p>
                    </div>
                ) : view === 'leads' ? (
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
                ) : (
                    /* ASSESSMENTS VIEW */
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-600">
                                <thead className="bg-gray-50/50 text-gray-900 font-bold uppercase tracking-wider text-xs border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Address</th>
                                        <th className="px-6 py-4">Client</th>
                                        <th className="px-6 py-4">Scheduled</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {assessments.map((assessment) => (
                                        <tr key={assessment.id} className="hover:bg-green-50/30 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${getStatusColor(assessment.status)}`}>
                                                    {assessment.status.replace('_', ' ')}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-gray-900">
                                                {assessment.property_address}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-medium text-gray-900">{assessment.profiles?.full_name || 'Generic User'}</div>
                                                <div className="text-xs text-gray-400">{assessment.profiles?.email}</div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500">
                                                {assessment.scheduled_date ? new Date(assessment.scheduled_date).toLocaleDateString() : 'TBC'}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {assessment.status === 'submitted' && (
                                                        <button
                                                            onClick={() => {
                                                                setSelectedAssessment(assessment);
                                                                setShowQuoteModal(true);
                                                            }}
                                                            className="bg-[#007F00] text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:bg-green-700 shadow-sm"
                                                        >
                                                            Quote
                                                        </button>
                                                    )}
                                                    {assessment.status === 'quote_accepted' && (
                                                        <button
                                                            onClick={() => {
                                                                setSelectedAssessment(assessment);
                                                                setShowScheduleModal(true);
                                                            }}
                                                            className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:bg-indigo-700 shadow-sm"
                                                        >
                                                            Schedule
                                                        </button>
                                                    )}
                                                    {assessment.status === 'scheduled' && (
                                                        <button
                                                            onClick={() => {
                                                                setSelectedAssessment(assessment);
                                                                setShowCompleteModal(true);
                                                            }}
                                                            className="bg-purple-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:bg-purple-700 shadow-sm"
                                                        >
                                                            Complete
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => {
                                                            setSelectedAssessment(assessment);
                                                            setShowMessageModal(true);
                                                        }}
                                                        className="bg-white border border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                                                    >
                                                        Message
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

                            {/* Conversion Action */}
                            <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                                <div>
                                    <h4 className="text-sm font-bold text-blue-900">Process as Official Assessment?</h4>
                                    <p className="text-xs text-blue-700 mt-1">Convert this lead into a trackable BER assessment with internal messaging and portal access.</p>
                                </div>
                                <button
                                    onClick={handleConvertLead}
                                    className="bg-[#007EA7] text-white px-6 py-2 rounded-xl text-sm font-bold shadow-sm hover:shadow-md transition-all whitespace-nowrap active:scale-95"
                                >
                                    Convert to Assessment
                                </button>
                            </div>

                            <div className="flex flex-col gap-3 pt-4 border-t border-gray-50">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                                    <button
                                        onClick={async () => {
                                            const id = await handleConvertLead();
                                            if (id) {
                                                setView('assessments');
                                                setSelectedLead(null);
                                                // Give a small delay for state update
                                                setTimeout(() => {
                                                    const newAsm = assessments.find(a => a.id === id);
                                                    if (newAsm) setSelectedAssessment(newAsm);
                                                    setShowQuoteModal(true);
                                                }, 500);
                                            }
                                        }}
                                        className="w-full bg-[#007F00] text-white font-bold text-sm py-4 rounded-2xl hover:bg-green-800 transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-lg active:scale-[0.98]"
                                    >
                                        <MessageSquare size={18} />
                                        Formal Quote (Portal)
                                    </button>
                                    <a
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={() => toast.success('Opening Gmail...')}
                                        href={`https://mail.google.com/mail/?view=cm&fs=1&to=${selectedLead.email}&su=${encodeURIComponent('Re: Your inquiry to The Berman')}&body=${encodeURIComponent(`Hi ${selectedLead.name},\n\nThank you for reaching out regarding your property in ${selectedLead.town || 'your area'}.\n\n`)}`}
                                        className="w-full bg-white border-2 border-gray-900 text-gray-900 font-bold text-sm py-4 rounded-2xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-lg active:scale-[0.98] no-underline"
                                    >
                                        <Mail size={18} />
                                        Client Message
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* GENERATE QUOTE MODAL */}
            {showQuoteModal && selectedAssessment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Generate Quote</h3>
                            <button onClick={() => setShowQuoteModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        <p className="text-sm text-gray-500 mb-6">Property: {selectedAssessment.property_address}</p>
                        <form onSubmit={handleGenerateQuote} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Quote Price (€)</label>
                                <input
                                    required
                                    type="number"
                                    step="0.01"
                                    value={quoteData.price}
                                    onChange={(e) => setQuoteData({ ...quoteData, price: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#007F00]"
                                    placeholder="e.g. 250.00"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Estimated Date</label>
                                <input
                                    type="date"
                                    value={quoteData.estimated_date}
                                    onChange={(e) => setQuoteData({ ...quoteData, estimated_date: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#007F00]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Internal Notes</label>
                                <textarea
                                    value={quoteData.notes}
                                    onChange={(e) => setQuoteData({ ...quoteData, notes: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#007F00]"
                                    placeholder="Add any internal details or notes for the quote..."
                                    rows={3}
                                />
                            </div>
                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowQuoteModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-bold text-white bg-[#007F00] rounded-lg hover:bg-green-800"
                                >
                                    Generate & Notify
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MESSAGE CLIENT MODAL */}
            {showMessageModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Message Client</h3>
                            <button onClick={() => setShowMessageModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSendMessage} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Content</label>
                                <textarea
                                    required
                                    value={messageContent}
                                    onChange={(e) => setMessageContent(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#007F00] min-h-[120px]"
                                    placeholder="Type your message..."
                                />
                            </div>
                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setShowMessageModal(false)} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 text-sm font-bold text-white bg-[#007F00] rounded-lg">Send Message</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* SCHEDULE MODAL */}
            {showScheduleModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Schedule Assessment</h3>
                            <button onClick={() => setShowScheduleModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSchedule} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Assessment Date</label>
                                <input
                                    type="datetime-local"
                                    required
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#007F00]"
                                />
                            </div>
                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setShowScheduleModal(false)} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 rounded-lg">Confirm Schedule</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* COMPLETE MODAL */}
            {showCompleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Complete Assessment</h3>
                            <button onClick={() => setShowCompleteModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={14} />
                            </button>
                        </div>
                        <form onSubmit={handleComplete} className="space-y-4">
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-4">
                                <p className="text-xs text-blue-800 font-medium">Finalizing this assessment will allow the homeowner to download their BER certificate.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Certificate URL (e.g. Google Drive/Dropbox/S3)</label>
                                <input
                                    type="url"
                                    required
                                    value={certUrl}
                                    onChange={(e) => setCertUrl(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#007F00]"
                                    placeholder="https://..."
                                />
                            </div>
                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setShowCompleteModal(false)} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 text-sm font-bold text-white bg-purple-600 rounded-lg">Complete & Upload</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* SPONSOR MODAL */}
            {showSponsorModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Manage Sponsors</h3>
                            <button onClick={() => { setShowSponsorModal(false); setEditingSponsor(null); }} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        {/* List Sponsors */}
                        <div className="mb-8">
                            <h4 className="text-sm font-bold text-gray-700 mb-3">Current Sponsors ({sponsors.length}/3)</h4>
                            <div className="space-y-3">
                                {sponsors.length === 0 && <p className="text-sm text-gray-500 italic">No sponsors added yet.</p>}
                                {sponsors.map(sponsor => (
                                    <div key={sponsor.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                        {sponsor.image_url && <img src={sponsor.image_url} alt={sponsor.name} className="w-12 h-12 object-cover rounded-md" />}
                                        <div className="flex-grow">
                                            <p className="font-bold text-sm">{sponsor.headline}</p>
                                            <p className="text-xs text-gray-500">{sponsor.sub_text}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setEditingSponsor(sponsor)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteSponsor(sponsor.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Add/Edit Form */}
                        {(sponsors.length < 3 || editingSponsor) && (
                            <form onSubmit={handleSaveSponsor} className="space-y-4 border-t border-gray-100 pt-6">
                                <h4 className="text-sm font-bold text-gray-900">{editingSponsor ? 'Edit Sponsor' : 'Add New Sponsor'}</h4>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Business Name</label>
                                        <input name="name" defaultValue={editingSponsor?.name} required className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Internal name" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Headline</label>
                                        <input name="headline" defaultValue={editingSponsor?.headline} required className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="e.g. Need Solar?" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Sub-text</label>
                                        <input name="sub_text" defaultValue={editingSponsor?.sub_text} required className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Short description" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Destination URL</label>
                                        <input name="destination_url" defaultValue={editingSponsor?.destination_url} required type="url" className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="https://..." />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Image URL</label>
                                    <input name="image_url" defaultValue={editingSponsor?.image_url} required type="url" className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="https://..." />
                                </div>

                                <div className="pt-2 flex justify-end gap-3">
                                    {editingSponsor && (
                                        <button type="button" onClick={() => setEditingSponsor(null)} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg">Cancel Edit</button>
                                    )}
                                    <button type="submit" className="px-4 py-2 text-sm font-bold text-white bg-[#007F00] rounded-lg">
                                        {editingSponsor ? 'Update Sponsor' : 'Add Sponsor'}
                                    </button>
                                </div>
                            </form>
                        )}

                        {sponsors.length >= 3 && !editingSponsor && (
                            <div className="text-center p-4 bg-yellow-50 text-yellow-800 text-sm rounded-lg">
                                Maximum of 3 sponsors allowed. Delete one to add a new one.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Admin;
