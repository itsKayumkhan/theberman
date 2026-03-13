
import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { LogOut, FileText, User, Home, AlertCircle, X, Menu, Trash2, Search, Clock } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import QuoteModal from '../components/QuoteModal';
import EmailVerification from '../components/EmailVerification';
import PaymentModal from '../components/PaymentModal';
import DashboardLayout, { NavItem } from '../components/DashboardLayout';

interface Quote {
    id: string;
    price: number;
    estimated_date: string | null;
    notes: string;
    status: 'pending' | 'accepted' | 'rejected';
    created_at: string;
    assessment_id: string;
    created_by: string;
    contractor?: {
        full_name: string;
        seai_number: string;
        assessor_type?: string;
        company_name?: string;
        insurance_holder?: boolean;
        vat_registered?: boolean;
    };
    assessment?: any;
    is_loyalty_payout?: boolean;
}

interface Assessment {
    id: string;
    property_address: string;
    status: 'draft' | 'submitted' | 'pending_quote' | 'quote_accepted' | 'scheduled' | 'completed';
    scheduled_date: string | null;
    certificate_url: string | null;
    created_at: string;
    eircode?: string;
    town?: string;
    county?: string;
    property_type?: string;
    quotes?: Quote[];
    preferred_date?: string;
    preferred_time?: string;
    property_size?: string;
    bedrooms?: number;
    heat_pump?: string;
    ber_purpose?: string;
    additional_features?: string[];
    job_type?: string;
    building_type?: string;
    floor_area?: string;
    building_complexity?: string;
    heating_cooling_systems?: string[];
    assessment_purpose?: string;
    existing_docs?: string[];
    notes?: string;
}

const NAV_ITEMS: NavItem[] = [
    { id: 'assessments', label: 'My Assessments', icon: Home },
    { id: 'quotes', label: 'My Quotes', icon: FileText },
];

const UserDashboard = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedDetailsQuote, setSelectedDetailsQuote] = useState<Quote | null>(null); // New state for quote details modal
    const [view, setView] = useState<'assessments' | 'quotes'>('assessments');
    const [searchQuery, setSearchQuery] = useState('');
    const [verifyingQuote, setVerifyingQuote] = useState<{ assessmentId: string, quoteId: string, targetStatus: 'accepted' | 'rejected' } | null>(null);
    const [confirmReject, setConfirmReject] = useState<{ assessmentId: string, quoteId: string } | null>(null);
    const [verificationStep, setVerificationStep] = useState<1 | 2>(1);

    const [verifyEircode, setVerifyEircode] = useState('');
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [paymentQuote, setPaymentQuote] = useState<{ assessmentId: string, quoteId: string, amount: number, balance?: number } | null>(null);
    const [deletingAssessmentId, setDeletingAssessmentId] = useState<string | null>(null);
    const [submittingAssessmentId, setSubmittingAssessmentId] = useState<string | null>(null);

    useEffect(() => {
        fetchAssessments();

        // Real-time subscription
        if (!user) return;

        const channel = supabase
            .channel('db-changes')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'assessments', filter: `user_id=eq.${user.id}` },
                () => fetchAssessments()
            )
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'quotes' },
                () => fetchAssessments()
            )
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'assessment_messages' },
                () => fetchAssessments()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    const fetchAssessments = async () => {
        if (!user) return;

        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('assessments')
                .select(`
                    *,
                    quotes (
                        *,
                        contractor:profiles(
                            full_name,
                            seai_number,
                            assessor_type,
                            company_name,
                            insurance_holder,
                            vat_registered
                        )
                    )
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Filter out jobs older than 5 days that haven't had a quote accepted
            const filteredData = (data || []).filter(assessment => {
                const createdAt = new Date(assessment.created_at);
                const now = new Date();
                const diffInDays = (now.getTime() - createdAt.getTime()) / (1000 * 3600 * 24);

                // Keep if new (< 5 days) OR if it's already progressed beyond pending quotes
                const isExpired = diffInDays > 5 && !['quote_accepted', 'scheduled', 'completed'].includes(assessment.status);
                return !isExpired;
            });

            setAssessments(filteredData);
        } catch (error: any) {
            console.error('Error fetching assessments:', error);
            toast.error('Failed to load assessments');
        } finally {
            setLoading(false);
        }
    };

    const getQuoteExpiry = (quoteCreatedAt: string) => {
        const created = new Date(quoteCreatedAt);
        const expiry = new Date(created.getTime() + 5 * 24 * 60 * 60 * 1000);
        const now = new Date();
        const diffMs = expiry.getTime() - now.getTime();
        const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        return { isExpired: daysLeft <= 0, daysLeft: Math.max(0, daysLeft) };
    };

    const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

    const handleSubmitAssessment = async (id: string) => {
        if (submittingAssessmentId) return; // prevent double-submit
        setSubmittingAssessmentId(id);
        try {
            // 1. Fetch assessment details for notification
            const { error: fetchError } = await supabase
                .from('assessments')
                .select('*, profiles(full_name, email)')
                .eq('id', id)
                .maybeSingle();

            if (fetchError) throw fetchError;

            // 2. Update status to live
            const { error: updateError } = await supabase
                .from('assessments')
                .update({ status: 'live' })
                .eq('id', id);

            if (updateError) throw updateError;

            toast.success('Assessment is now live and assessors have been notified!');
            fetchAssessments();
        } catch (error: any) {
            console.error('Submission error:', error);
            toast.error(error.message || 'Failed to submit');
        } finally {
            setSubmittingAssessmentId(null);
        }
    };

    const handleDeleteAssessment = async (id: string) => {
        try {
            const { data, error } = await supabase.functions.invoke('delete-assessment', {
                body: { assessmentId: id }
            });

            if (error) throw error;
            if (data && !data.success) throw new Error(data.error || 'Failed to delete job');

            toast.success('Job deleted successfully');
            fetchAssessments();
        } catch (error: any) {
            console.error('Delete assessment error:', error);
            toast.error(error.message || 'Failed to delete job');
        } finally {
            setDeletingAssessmentId(null);
        }
    };

    const handleUpdateQuoteStatus = async (assessmentId: string, quoteId: string, newStatus: 'accepted' | 'rejected') => {
        try {
            if (newStatus === 'accepted') {
                // Fetch the quote to get the price and loyalty status
                const { data: quote, error: fetchError } = await supabase
                    .from('quotes')
                    .select('price, is_loyalty_payout')
                    .eq('id', quoteId)
                    .single();

                if (fetchError) throw fetchError;

                // Open Payment Modal with appropriate deposit (fixed €40 or €10 if loyalty) and calculate balance
                const depositAmount = quote.is_loyalty_payout ? 10 : 40;
                const balance = (quote.price + 10) - depositAmount;
                setPaymentQuote({ assessmentId, quoteId, amount: depositAmount, balance });
                setPaymentModalOpen(true);
                return;
            } else {
                const { error: quoteError } = await supabase
                    .from('quotes')
                    .update({ status: newStatus })
                    .eq('id', quoteId);

                if (quoteError) throw quoteError;
                toast.success('Quote rejected');
            }
            fetchAssessments();
        } catch (error: any) {
            toast.error(error.message || 'Action failed');
        }
    };

    const handlePaymentSuccess = async (paymentIntentId: string) => {
        if (!paymentQuote) return;

        try {
            // 1. Record Payment in DB
            const { error: paymentError } = await supabase.from('payments').insert({
                amount: paymentQuote.amount,
                currency: 'eur',
                status: 'completed',
                assessment_id: paymentQuote.assessmentId,
                user_id: user?.id,
                stripe_payment_id: paymentIntentId
            });

            if (paymentError) {
                console.error('Payment recorded failed but stripe succeeded:', paymentError);
                toast.error('Payment recorded with errors. Please contact support.');
            }

            // 2. Finalize Quote Acceptance
            // Fetch the quote to get the contractor_id
            const { data: quote, error: fetchError } = await supabase
                .from('quotes')
                .select('created_by')
                .eq('id', paymentQuote.quoteId)
                .single();

            if (fetchError) throw fetchError;

            const { error: quoteError } = await supabase
                .from('quotes')
                .update({ status: 'accepted' })
                .eq('id', paymentQuote.quoteId);

            if (quoteError) throw quoteError;

            const { error: assessmentError } = await supabase
                .from('assessments')
                .update({
                    status: 'quote_accepted',
                    contractor_id: quote.created_by,
                    payment_status: 'paid'
                })
                .eq('id', paymentQuote.assessmentId);

            if (assessmentError) throw assessmentError;

            // Notify homeowner and contractor about the acceptance
            supabase.functions.invoke('send-acceptance-notification', {
                body: { assessmentId: paymentQuote.assessmentId, quoteId: paymentQuote.quoteId }
            }).catch(err => console.error('Failed to trigger acceptance notification:', err));

            toast.success('Payment successful! Quote accepted.');
            setPaymentModalOpen(false);
            setPaymentQuote(null);
            fetchAssessments();

        } catch (error: any) {
            console.error('Error finalizing acceptance:', error);
            toast.error('Payment succeeded but update failed. Contact support.');
        }
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-50 text-green-700 border-green-100';
            case 'scheduled': return 'bg-purple-50 text-purple-700 border-purple-100';
            case 'quote_accepted': return 'bg-indigo-50 text-indigo-700 border-indigo-100';
            case 'pending_quote': return 'bg-amber-50 text-amber-700 border-amber-100';
            case 'submitted': return 'bg-blue-50 text-blue-700 border-blue-100';
            case 'draft': return 'bg-gray-50 text-gray-600 border-gray-100';
            default: return 'bg-gray-50 text-gray-700 border-gray-100';
        }
    };

    const handleViewChange = (id: string) => {
        setView(id as 'assessments' | 'quotes');
    };

    return (
        <DashboardLayout
            title={view === 'assessments' ? 'My BER Assessments' : 'Received Quotes'}
            subtitle={view === 'assessments' ? 'Track the progress of your property certification and view scheduled assessments.' : 'Review and manage quotes from our verified professional BER Assessors.'}
            navItems={NAV_ITEMS}
            activeView={view}
            onViewChange={handleViewChange}
            onRefresh={fetchAssessments}
            loading={loading}
            roleLabel="Member Portal"
            extraSidebarItems={
                <button
                    onClick={() => navigate('/get-quote')}
                    className="flex items-center gap-3 px-4 py-2 text-xs font-bold text-white opacity-80 hover:opacity-100 transition-all"
                >
                    <Home size={14} className="text-[#9ACD32]" />
                    New Assessment
                </button>
            }
        >
            <div className="max-w-7xl mx-auto">
                {assessments.length === 0 && !loading ? (
                    <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-10 md:p-16 text-center">
                        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 text-[#007F00]">
                            <User size={48} strokeWidth={1.5} />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-3">Welcome Back!</h2>
                        <p className="text-gray-500 text-lg mb-10 max-w-lg mx-auto leading-relaxed">
                            This is your personal dashboard. Tracking of your BER assessments will appear here soon.
                        </p>
                        <button
                            onClick={() => navigate('/get-quote')}
                            className="inline-flex items-center gap-2 bg-[#007F00] text-white px-8 py-4 rounded-full font-bold hover:bg-[#006600] transition-all"
                        >
                            Schedule a BER Assessment
                        </button>
                    </div>
                ) : (
                    <>
                        {view === 'assessments' ? (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search by town, county, type, or address..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-gray-900 focus:ring-2 focus:ring-[#007F00]/20 outline-none transition-all"
                                    />
                                </div>

                                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Property Assessments</h3>
                                        <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-full">{assessments.length}</span>
                                    </div>
                                    <div className="overflow-x-auto hidden md:block">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="bg-gray-50 border-b border-gray-200">
                                                    <th className="text-left py-4 px-6 text-xs font-black text-gray-500 uppercase tracking-widest">Posted</th>
                                                    <th className="text-left py-4 px-6 text-xs font-black text-gray-500 uppercase tracking-widest">Type</th>
                                                    <th className="text-left py-4 px-6 text-xs font-black text-gray-500 uppercase tracking-widest">Town</th>
                                                    <th className="text-left py-4 px-6 text-xs font-black text-gray-500 uppercase tracking-widest">County</th>
                                                    <th className="text-left py-4 px-6 text-xs font-black text-gray-500 uppercase tracking-widest">Status</th>
                                                    <th className="text-right py-4 px-6 text-xs font-black text-gray-500 uppercase tracking-widest">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {assessments.filter(a => {
                                                    if (!searchQuery.trim()) return true;
                                                    const q = searchQuery.toLowerCase();
                                                    return (
                                                        (a.town?.toLowerCase().includes(q)) ||
                                                        (a.county?.toLowerCase().includes(q)) ||
                                                        (a.property_address?.toLowerCase().includes(q))
                                                    );
                                                }).map((assessment) => (
                                                    <tr key={assessment.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                                        <td className="py-4 px-6 text-gray-500 font-bold">
                                                            {new Date(assessment.created_at).toLocaleDateString()}
                                                        </td>
                                                        <td className="py-4 px-6">
                                                            <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase border ${assessment.job_type === 'commercial' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-green-50 text-green-700 border-green-100'}`}>
                                                                {assessment.job_type || 'Domestic'}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-6 font-bold text-gray-900">{assessment.town || '-'}</td>
                                                        <td className="py-4 px-6 text-gray-600 font-medium">{assessment.county || '-'}</td>
                                                        <td className="py-4 px-6">
                                                            <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase border ${getStatusStyles(assessment.status)}`}>
                                                                {assessment.status.replace('_', ' ')}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-6 text-right">
                                                            <div className="flex justify-end gap-2">
                                                                {assessment.status === 'draft' ? (
                                                                    <button
                                                                        onClick={() => handleSubmitAssessment(assessment.id)}
                                                                        className="px-3 py-1.5 bg-[#007F00] text-white rounded-lg text-xs font-bold hover:bg-green-700 transition-all"
                                                                    >
                                                                        Submit
                                                                    </button>
                                                                ) : assessment.status === 'completed' && assessment.certificate_url ? (
                                                                    <a href={assessment.certificate_url} target="_blank" className="px-3 py-1.5 text-[#007F00] border border-green-100 rounded-lg text-xs font-bold hover:bg-green-50 transition-all">
                                                                        Cert
                                                                    </a>
                                                                ) : null}
                                                                <button
                                                                    onClick={() => setDeletingAssessmentId(assessment.id)}
                                                                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
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
                                    {/* Mobile View */}
                                    <div className="md:hidden divide-y divide-gray-100">
                                        {assessments.map(a => (
                                            <div key={a.id} className="p-4 space-y-3">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="text-[10px] font-black text-gray-400 uppercase">{new Date(a.created_at).toLocaleDateString()}</p>
                                                        <h4 className="font-bold text-gray-900 truncate">{a.property_address}</h4>
                                                    </div>
                                                    <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase border ${getStatusStyles(a.status)}`}>
                                                        {a.status.replace('_', ' ')}
                                                    </span>
                                                </div>
                                                <div className="flex gap-2">
                                                    {a.status === 'draft' && (
                                                        <button onClick={() => handleSubmitAssessment(a.id)} className="flex-1 py-2 bg-[#007F00] text-white rounded-lg text-xs font-bold">Submit</button>
                                                    )}
                                                    <button onClick={() => setDeletingAssessmentId(a.id)} className="p-2 border border-gray-100 rounded-lg text-red-400"><Trash2 size={14} /></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                {assessments.flatMap(a => (a.quotes || []).map(q => ({ ...q, assessment: a })))
                                    .length === 0 ? (
                                    <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                                        <FileText className="mx-auto text-gray-200 mb-4" size={48} />
                                        <h3 className="text-lg font-bold text-gray-900">No quotes received</h3>
                                        <p className="text-sm text-gray-500">Wait for assessors to reply to your live jobs.</p>
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                                        <div className="overflow-x-auto hidden md:block">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="bg-gray-50 border-b border-gray-200">
                                                        <th className="text-left py-4 px-6 text-xs font-black text-gray-500 uppercase tracking-widest">Property</th>
                                                        <th className="text-left py-4 px-6 text-xs font-black text-gray-500 uppercase tracking-widest">Price</th>
                                                        <th className="text-left py-4 px-6 text-xs font-black text-gray-500 uppercase tracking-widest">Availability</th>
                                                        <th className="text-left py-4 px-6 text-xs font-black text-gray-500 uppercase tracking-widest">Assessor</th>
                                                        <th className="text-right py-4 px-6 text-xs font-black text-gray-500 uppercase tracking-widest">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {assessments.flatMap(a => (a.quotes || []).map(q => ({ ...q, assessment: a })))
                                                        .map(quote => (
                                                            <tr key={quote.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                                                                <td className="py-4 px-6 font-bold truncate max-w-xs">{quote.assessment.property_address}</td>
                                                                <td className="py-4 px-6 font-black text-gray-900 text-lg">€{quote.price + 10}</td>
                                                                <td className="py-4 px-6 text-gray-600 italic">{quote.estimated_date ? new Date(quote.estimated_date).toLocaleDateString() : 'TBC'}</td>
                                                                <td className="py-4 px-6">
                                                                    <div className="flex flex-col">
                                                                        <span className="font-bold">#{quote.contractor?.seai_number || 'ID'}</span>
                                                                        <Link to={`/profiles/${quote.created_by}`} className="text-[10px] text-green-600 font-black uppercase tracking-widest">View Profile</Link>
                                                                    </div>
                                                                </td>
                                                                <td className="py-4 px-6 text-right">
                                                                    {quote.status === 'pending' ? (
                                                                        <button
                                                                            onClick={() => setSelectedDetailsQuote(quote)}
                                                                            className="px-4 py-2 bg-[#007F00] text-white rounded-lg font-black text-xs hover:bg-green-700 transition-all shadow-sm"
                                                                        >
                                                                            Review & Accept
                                                                        </button>
                                                                    ) : (
                                                                        <span className="text-[10px] font-black uppercase px-2 py-1 bg-gray-50 rounded-lg text-gray-400">{quote.status}</span>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        {/* Mobile View Received Quotes */}
                                        <div className="md:hidden divide-y divide-gray-100">
                                            {assessments.flatMap(a => (a.quotes || []).map(q => ({ ...q, assessment: a }))).map(quote => (
                                                <div key={quote.id} className="p-4 flex justify-between items-center">
                                                    <div>
                                                        <h4 className="font-bold text-gray-900 truncate max-w-[150px]">{quote.assessment.town}</h4>
                                                        <p className="text-xl font-black text-[#007F00]">€{quote.price + 10}</p>
                                                    </div>
                                                    <button onClick={() => setSelectedDetailsQuote(quote)} className="px-3 py-2 bg-[#007F00] text-white rounded-lg text-[10px] font-black">View</button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Modals */}
            <QuoteModal isOpen={isQuoteModalOpen} onClose={() => { setIsQuoteModalOpen(false); fetchAssessments(); }} />

            {paymentModalOpen && paymentQuote && (
                <PaymentModal
                    isOpen={paymentModalOpen}
                    onClose={() => setPaymentModalOpen(false)}
                    amount={paymentQuote.amount}
                    onSuccess={handlePaymentSuccess}
                    metadata={{ assessmentId: paymentQuote.assessmentId, quoteId: paymentQuote.quoteId, userId: user?.id }}
                    title="Secure Booking Deposit"
                    description={`Pay €${paymentQuote.amount.toFixed(2)} deposit to book your assessment. Balance €${paymentQuote.balance?.toFixed(2)} direct to assessor.`}
                />
            )}

            {verifyingQuote && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-[#0c121d]/80 backdrop-blur-sm">
                    <div className={`bg-white rounded-[2rem] shadow-2xl w-full ${verificationStep === 2 ? 'max-w-3xl' : 'max-w-sm'} overflow-hidden`}>
                        {verificationStep === 1 ? (
                            <div className="p-10 text-center space-y-6">
                                <h3 className="text-2xl font-black text-gray-900 uppercase">Verify Eircode</h3>
                                <input
                                    type="text"
                                    value={verifyEircode}
                                    onChange={(e) => setVerifyEircode(e.target.value.toUpperCase().replace(/\s/g, ''))}
                                    placeholder="Eircode"
                                    className="w-full border-2 border-gray-100 rounded-2xl px-6 py-5 text-center text-2xl font-black focus:border-[#007F00] transition-colors outline-none"
                                />
                                <button
                                    onClick={() => {
                                        const assessment = assessments.find(a => a.id === verifyingQuote.assessmentId);
                                        if (assessment && verifyEircode.toUpperCase() === (assessment.eircode?.toUpperCase().replace(/\s/g, '') || '')) {
                                            setVerificationStep(2);
                                        } else {
                                            toast.error('Incorrect Eircode');
                                        }
                                    }}
                                    className="w-full bg-[#007F00] text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-green-200"
                                >
                                    Confirm
                                </button>
                                <button onClick={() => setVerifyingQuote(null)} className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Cancel</button>
                            </div>
                        ) : (
                            <div className="p-6">
                                <EmailVerification
                                    email={user?.email || ''}
                                    assessmentId={verifyingQuote.assessmentId}
                                    onVerified={() => {
                                        handleUpdateQuoteStatus(verifyingQuote.assessmentId, verifyingQuote.quoteId, verifyingQuote.targetStatus);
                                        setVerifyingQuote(null);
                                    }}
                                    onBack={() => setVerificationStep(1)}
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}

            {selectedDetailsQuote && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-[#0c121d]/80 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-10 overflow-hidden text-center">
                        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 text-[#007F00]">
                            <Clock size={32} />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-tight">Accept Quote?</h3>
                        <p className="text-sm text-gray-500 font-medium mb-8">You are about to book professional BERT Assessor #{selectedDetailsQuote.contractor?.seai_number || 'ID'}</p>

                        <div className="space-y-4 mb-10">
                            <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Price</span>
                                <span className="font-black text-gray-900 text-lg">€{selectedDetailsQuote.price + 10}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Availability</span>
                                <span className="font-bold text-gray-900">{selectedDetailsQuote.estimated_date ? new Date(selectedDetailsQuote.estimated_date).toLocaleDateString() : 'TBC'}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => setSelectedDetailsQuote(null)} className="py-4 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase text-[10px] tracking-widest">Close</button>
                            <button
                                onClick={() => {
                                    setVerifyingQuote({ assessmentId: selectedDetailsQuote.assessment_id || selectedDetailsQuote.assessment.id, quoteId: selectedDetailsQuote.id, targetStatus: 'accepted' });
                                    setVerificationStep(1);
                                    setVerifyEircode('');
                                    setSelectedDetailsQuote(null);
                                }}
                                className="py-4 bg-[#007F00] text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-green-200"
                            >
                                Accept
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {deletingAssessmentId && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-[#0c121d]/80 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-10 overflow-hidden text-center">
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                            <Trash2 size={32} />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-tight">Delete Job?</h3>
                        <p className="text-sm text-gray-500 font-medium mb-8">This action is permanent and will cancel any associated quotes.</p>
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => setDeletingAssessmentId(null)} className="py-4 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase text-[10px] tracking-widest">Keep Job</button>
                            <button onClick={() => handleDeleteAssessment(deletingAssessmentId)} className="py-4 bg-red-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-red-200">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default UserDashboard;
