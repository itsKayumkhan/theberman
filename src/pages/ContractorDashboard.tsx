import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import EmailVerification from '../components/EmailVerification';
import {
    LogOut,
    HardHat,
    ClipboardList,
    CheckCircle2,
    Clock,
    AlertCircle,
    X,
    MessageSquare,
    TrendingUp,
    DollarSign,
    Briefcase,
    Calendar,
    MapPin,
    ArrowRight,
    ArrowLeft,
    AlertTriangle,
    CheckCircle,
    Phone,
    Mail,
    ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface Quote {
    id: string;
    price: number;
    notes: string;
    status: 'pending' | 'accepted' | 'rejected';
    created_at: string;
    assessment_id: string;
}

interface Assessment {
    id: string;
    property_address: string;
    town: string;
    county: string;
    property_type: string;
    status: 'live' | 'submitted' | 'pending_quote' | 'quote_accepted' | 'scheduled' | 'completed';
    created_at: string;
    scheduled_date: string | null;
    user_id: string;
    property_size: string;
    bedrooms: number;
    additional_features: string[];
    heat_pump: string;
    ber_purpose: string;
    preferred_date: string;
    preferred_time: string;
    contact_name?: string;
    contact_email?: string;
    contact_phone?: string;
    certificate_url?: string;
    profiles?: {
        full_name: string;
    };
    quotes?: Quote[];
}

const ContractorDashboard = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    const [view, setView] = useState<'available' | 'my_quotes' | 'active'>('available');
    const [availableJobs, setAvailableJobs] = useState<Assessment[]>([]);
    const [myQuotes, setMyQuotes] = useState<Quote[]>([]);
    const [activeJobs, setActiveJobs] = useState<Assessment[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedJob, setSelectedJob] = useState<Assessment | null>(null);
    const [quoteModalOpen, setQuoteModalOpen] = useState(false);
    const [quotePrice, setQuotePrice] = useState('');
    const [quoteNotes, setQuoteNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [jobDetailsModalOpen, setJobDetailsModalOpen] = useState(false);
    const [schedulingJob, setSchedulingJob] = useState<Assessment | null>(null);
    const [scheduledDate, setScheduledDate] = useState('');
    const [completingJob, setCompletingJob] = useState<Assessment | null>(null);
    const [certUrl, setCertUrl] = useState('');

    // Multi-step Quoting & Rejection States
    const [quoteStep, setQuoteStep] = useState<1 | 2 | 3>(1); // 1: Details, 2: Price, 3: Confirmation/OTP
    const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');



    useEffect(() => {
        if (user) {
            fetchData();

            // Real-time updates
            const channel = supabase
                .channel('contractor-dashboard')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'assessments' }, () => fetchData())
                .on('postgres_changes', { event: '*', schema: 'public', table: 'quotes' }, () => fetchData())
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [user]);

    const fetchData = async () => {
        try {
            setLoading(true);

            // 1. Fetch Available Jobs (submitted status, no quote from this contractor yet)
            const { data: jobs, error: jobsError } = await supabase
                .from('assessments')
                .select(`
                    *,
                    profiles:user_id (full_name),
                    quotes (*)
                `)
                .in('status', ['live', 'submitted', 'pending_quote'])
                .order('created_at', { ascending: false });

            if (jobsError) throw jobsError;

            // 2. Fetch My Quotes
            const { data: quotes, error: quotesError } = await supabase
                .from('quotes')
                .select('*')
                .eq('created_by', user?.id)
                .order('created_at', { ascending: false });

            if (quotesError) throw quotesError;

            // 3. Filter data
            setMyQuotes(quotes || []);

            // Available jobs are those without a quote from this contractor
            const quotedIds = new Set(quotes?.map(q => q.assessment_id) || []);
            setAvailableJobs(jobs?.filter(j => !quotedIds.has(j.id)) || []);

            // Active jobs are those where contractor_id matches this contractor
            const { data: active, error: activeError } = await supabase
                .from('assessments')
                .select(`
                    *,
                    profiles:user_id (full_name),
                    contact_name,
                    contact_email,
                    contact_phone,
                    certificate_url
                `)
                .eq('contractor_id', user?.id)
                .order('created_at', { ascending: false });

            if (activeError) throw activeError;
            setActiveJobs(active || []);

        } catch (error: any) {
            console.error('Error fetching contractor data:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    const handleStartQuote = () => {
        setJobDetailsModalOpen(false);
        setQuoteModalOpen(true);
        setQuoteStep(1);
    };



    const handleSubmitQuote = async () => {
        if (!selectedJob || !quotePrice || isSubmitting) return;

        try {
            setIsSubmitting(true);
            const { error } = await supabase.from('quotes').insert({
                assessment_id: selectedJob.id,
                price: parseFloat(quotePrice),
                notes: quoteNotes,
                created_by: user?.id,
                status: 'pending'
            });

            if (error) throw error;

            if (selectedJob.status === 'submitted') {
                await supabase
                    .from('assessments')
                    .update({ status: 'pending_quote' })
                    .eq('id', selectedJob.id);
            }

            // Notify homeowner about the new quote
            supabase.functions.invoke('send-quote-notification', {
                body: { assessmentId: selectedJob.id }
            }).catch(err => console.error('Failed to trigger homeowner notification:', err));

            toast.success('Quote submitted successfully!');
            setQuoteModalOpen(false);
            setQuotePrice('');
            setQuoteNotes('');
            setSelectedJob(null);
            fetchData();
        } catch (error: any) {
            toast.error(error.message || 'Failed to submit quote');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRejectJob = async () => {
        if (!selectedJob || !rejectionReason || isSubmitting) return;

        try {
            setIsSubmitting(true);
            // Log rejection 
            const { error } = await supabase.from('audit_logs').insert({
                user_id: user?.id,
                action: 'lead_rejected',
                details: {
                    assessment_id: selectedJob.id,
                    reason: rejectionReason,
                    address: selectedJob.property_address
                }
            });

            if (error) throw error;

            toast.success('Lead rejected. It will no longer appear in your list.');
            setRejectionModalOpen(false);
            setJobDetailsModalOpen(false);
            setRejectionReason('');
            fetchData();
        } catch (error: any) {
            toast.error(error.message || 'Failed to reject lead');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateStatus = async (jobId: string, newStatus: string, extraData: any = {}) => {
        try {
            setIsSubmitting(true);
            const { error } = await supabase
                .from('assessments')
                .update({
                    status: newStatus,
                    ...extraData
                })
                .eq('id', jobId);

            if (error) throw error;

            toast.success(`Job marked as ${newStatus.replace('_', ' ')}`);
            setSchedulingJob(null);
            setCompletingJob(null);
            fetchData();
        } catch (error: any) {
            toast.error(error.message || 'Failed to update status');
        } finally {
            setIsSubmitting(false);
        }
    };

    const stats = {
        earnings: myQuotes.filter(q => q.status === 'accepted').reduce((sum, q) => sum + Number(q.price), 0),
        pending: myQuotes.filter(q => q.status === 'pending').length,
        completed: activeJobs.filter(j => j.status === 'completed').length,
        totalQuotes: myQuotes.length
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans">
            {/* Nav */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#007EA7] rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
                            <HardHat size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 leading-tight">Partner Portal</h1>
                            <span className="text-[10px] font-bold text-[#007EA7] uppercase tracking-widest">Licensed Contractor</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex flex-col items-end">
                            <span className="text-sm font-bold text-gray-900">{user?.email?.split('@')[0]}</span>
                            <span className="text-[10px] text-gray-400 font-medium">Verified Partner</span>
                        </div>
                        <button
                            onClick={handleSignOut}
                            className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-gray-100"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                                <DollarSign size={20} />
                            </div>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Earnings</span>
                        </div>
                        <p className="text-2xl font-black text-gray-900">€{stats.earnings.toLocaleString()}</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                <Clock size={20} />
                            </div>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pending Quotes</span>
                        </div>
                        <p className="text-2xl font-black text-gray-900">{stats.pending}</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                <CheckCircle2 size={20} />
                            </div>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Jobs Done</span>
                        </div>
                        <p className="text-2xl font-black text-gray-900">{stats.completed}</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                                <TrendingUp size={20} />
                            </div>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Quote Success</span>
                        </div>
                        <p className="text-2xl font-black text-gray-900">
                            {stats.totalQuotes > 0 ? Math.round((stats.completed / stats.totalQuotes) * 100) : 0}%
                        </p>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
                    <div className="flex border-b border-gray-100 p-2 gap-2 bg-gray-50/50">
                        <button
                            onClick={() => setView('available')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all ${view === 'available' ? 'bg-[#007EA7] text-white shadow-md' : 'text-gray-500 hover:bg-white hover:text-gray-900'}`}
                        >
                            <Briefcase size={18} />
                            Available Jobs
                            {availableJobs.length > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1">{availableJobs.length}</span>}
                        </button>
                        <button
                            onClick={() => setView('my_quotes')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all ${view === 'my_quotes' ? 'bg-[#007EA7] text-white shadow-md' : 'text-gray-500 hover:bg-white hover:text-gray-900'}`}
                        >
                            <ClipboardList size={18} />
                            My Quotes
                        </button>
                        <button
                            onClick={() => setView('active')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all ${view === 'active' ? 'bg-[#007EA7] text-white shadow-md' : 'text-gray-500 hover:bg-white hover:text-gray-900'}`}
                        >
                            <ClipboardList size={18} />
                            Active Jobs
                        </button>
                    </div>

                    <div className="flex-1 p-6">
                        {loading ? (
                            <div className="h-full flex flex-col items-center justify-center py-20">
                                <div className="w-10 h-10 border-4 border-blue-50 border-t-[#007EA7] rounded-full animate-spin"></div>
                                <p className="mt-4 text-sm font-bold text-gray-400 uppercase tracking-widest">Refreshing Dashboard...</p>
                            </div>
                        ) : view === 'available' ? (
                            availableJobs.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center py-20">
                                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-300">
                                        <Briefcase size={40} />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">No jobs available right now</h3>
                                    <p className="text-gray-500 max-w-sm">We'll notify you when new assessment requests are submitted by homeowners in your area.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {availableJobs.map(job => (
                                        <div key={job.id} className="group bg-white border border-gray-200 rounded-2xl p-6 hover:border-[#007EA7] hover:shadow-xl hover:shadow-blue-900/5 transition-all">
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="p-3 bg-blue-50 text-[#007EA7] rounded-xl">
                                                    <MapPin size={24} />
                                                </div>
                                                <span className="text-[10px] font-black uppercase bg-gray-100 text-gray-500 px-2 py-1 rounded-md">
                                                    New Request
                                                </span>
                                            </div>
                                            <h4 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">{job.property_address}</h4>
                                            <div className="flex flex-wrap gap-2 mb-6">
                                                <div className="text-[10px] font-bold bg-blue-50 text-[#007EA7] px-2 py-1 rounded-md flex items-center gap-1">
                                                    <MapPin size={10} />
                                                    {job.county}
                                                </div>
                                                <div className="text-[10px] font-bold bg-green-50 text-green-700 px-2 py-1 rounded-md flex items-center gap-1">
                                                    <HardHat size={10} />
                                                    {job.property_type}
                                                </div>
                                                <div className="text-[10px] font-bold bg-gray-50 text-gray-500 px-2 py-1 rounded-md flex items-center gap-1">
                                                    <Calendar size={10} />
                                                    {new Date(job.created_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setSelectedJob(job);
                                                    setJobDetailsModalOpen(true);
                                                }}
                                                className="w-full flex items-center justify-center gap-2 py-3 bg-[#007EA7] text-white rounded-xl font-bold hover:bg-[#005F7E] transition-all shadow-lg shadow-blue-100"
                                            >
                                                View Details
                                                <ArrowRight size={18} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )
                        ) : view === 'my_quotes' ? (
                            myQuotes.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center py-20">
                                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-300">
                                        <ClipboardList size={40} />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">You haven't sent any quotes</h3>
                                    <p className="text-gray-500 max-w-sm">Tap on "Available Jobs" to find homeowners looking for BER assessments.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {myQuotes.map(quote => (
                                        <div key={quote.id} className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${quote.status === 'accepted' ? 'bg-green-50 text-green-600' : quote.status === 'rejected' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                                                {quote.status === 'accepted' ? <CheckCircle2 size={24} /> : quote.status === 'rejected' ? <AlertCircle size={24} /> : <Clock size={24} />}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-bold text-gray-900">€{quote.price.toLocaleString()}</h4>
                                                        <p className="text-xs text-gray-400 font-medium">Sent on {new Date(quote.created_at).toLocaleDateString()}</p>
                                                    </div>
                                                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${quote.status === 'accepted' ? 'bg-green-100 text-green-700' : quote.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                                        {quote.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        ) : (
                            activeJobs.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center py-20">
                                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-300">
                                        <HardHat size={40} />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">No active jobs</h3>
                                    <p className="text-gray-500 max-w-sm">When a homeowner accepts your quote, the job will appear here for you to manage.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {activeJobs.map(job => (
                                        <div key={job.id} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">
                                            <div className="flex justify-between items-start mb-6">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${job.status === 'completed' ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-700'}`}>
                                                            {job.status.replace('_', ' ')}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-gray-400">ID: {job.id.slice(0, 8)}</span>
                                                    </div>
                                                    <h4 className="text-lg font-bold text-gray-900">{job.property_address}</h4>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button className="p-2 bg-blue-50 text-[#007EA7] rounded-xl hover:bg-blue-100 transition-colors">
                                                        <MessageSquare size={20} />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-t border-gray-50 mb-6">
                                                <div>
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase">Customer</span>
                                                    <p className="text-sm font-bold text-gray-700">{job.profiles?.full_name || 'Homeowner'}</p>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase">Type</span>
                                                    <p className="text-sm font-bold text-gray-700">{job.property_type}</p>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase">Town</span>
                                                    <p className="text-sm font-bold text-gray-700">{job.town}</p>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase">Bedrooms</span>
                                                    <p className="text-sm font-bold text-gray-700">{job.bedrooms}</p>
                                                </div>
                                            </div>

                                            {job.scheduled_date && (
                                                <div className="bg-blue-50/50 border border-blue-100/50 rounded-2xl p-4 mb-6 flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-white rounded-lg text-[#007EA7] shadow-sm">
                                                            <Calendar size={18} />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-black text-[#007EA7] uppercase tracking-widest">Inspection Date</p>
                                                            <p className="text-sm font-bold text-gray-900">
                                                                {new Date(job.scheduled_date).toLocaleDateString('en-IE', {
                                                                    weekday: 'short',
                                                                    day: 'numeric',
                                                                    month: 'short',
                                                                    year: 'numeric'
                                                                })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            setSchedulingJob(job);
                                                            setScheduledDate(new Date(job.scheduled_date!).toISOString().split('T')[0]);
                                                        }}
                                                        className="text-[10px] font-black text-[#007EA7] uppercase hover:underline"
                                                    >
                                                        Reschedule
                                                    </button>
                                                </div>
                                            )}

                                            {job.status !== 'completed' && (
                                                <div className="flex gap-3">
                                                    {job.status === 'quote_accepted' && (
                                                        <button
                                                            onClick={() => {
                                                                setSchedulingJob(job);
                                                                setScheduledDate(new Date().toISOString().split('T')[0]);
                                                            }}
                                                            disabled={isSubmitting}
                                                            className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
                                                        >
                                                            <Calendar size={18} />
                                                            Schedule Inspection
                                                        </button>
                                                    )}
                                                    {job.status === 'scheduled' && (
                                                        <button
                                                            onClick={() => {
                                                                setCompletingJob(job);
                                                                setCertUrl('');
                                                            }}
                                                            disabled={isSubmitting}
                                                            className="flex-1 py-3 bg-[#007F00] text-white rounded-xl font-bold hover:bg-green-800 transition-all shadow-lg shadow-green-100 flex items-center justify-center gap-2"
                                                        >
                                                            <CheckCircle size={18} />
                                                            Complete Job
                                                        </button>
                                                    )}
                                                </div>
                                            )}

                                            {job.status !== 'completed' && job.contact_phone && (
                                                <div className="mt-6 pt-6 border-t border-gray-50 flex flex-wrap gap-4">
                                                    <a href={`tel:${job.contact_phone}`} className="flex items-center gap-2 text-xs font-bold text-[#007EA7] bg-blue-50 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors">
                                                        <Phone size={14} />
                                                        {job.contact_phone}
                                                    </a>
                                                    <a href={`mailto:${job.contact_email}`} className="flex items-center gap-2 text-xs font-bold text-gray-600 bg-gray-50 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                                                        <Mail size={14} />
                                                        Email Customer
                                                    </a>
                                                </div>
                                            )}

                                            {job.status === 'completed' && (
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-2 text-green-600 font-bold text-sm bg-green-50 p-4 rounded-2xl">
                                                        <CheckCircle size={18} />
                                                        Job successfully completed and certified.
                                                    </div>
                                                    {job.certificate_url && (
                                                        <a
                                                            href={job.certificate_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center justify-center gap-2 w-full py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all text-sm"
                                                        >
                                                            <ExternalLink size={16} />
                                                            View Certificate
                                                        </a>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )
                        )}
                    </div>
                </div>
            </main>

            {/* Job Details Modal - STEP 1 */}
            {jobDetailsModalOpen && selectedJob && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="bg-white border-b border-gray-100 p-8 flex justify-between items-start">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900">Job Opportunity</h3>
                                <p className="text-sm text-gray-500 font-medium mt-1">Review the details before proceeding</p>
                            </div>
                            <button onClick={() => setJobDetailsModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-8 space-y-8">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Location</span>
                                    <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                        <MapPin size={14} className="text-[#007EA7]" />
                                        {selectedJob.town}, {selectedJob.county}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Property Type</span>
                                    <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                        <HardHat size={14} className="text-[#007EA7]" />
                                        {selectedJob.property_type}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Size</span>
                                    <p className="text-sm font-bold text-gray-900">{selectedJob.property_size}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Bedrooms</span>
                                    <p className="text-sm font-bold text-gray-900">{selectedJob.bedrooms}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Purpose</span>
                                    <p className="text-sm font-bold text-gray-900">{selectedJob.ber_purpose}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Heat Pump</span>
                                    <p className="text-sm font-bold text-gray-900">{selectedJob.heat_pump}</p>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <span className="text-[10px] font-black text-[#007EA7] uppercase tracking-widest block">Preferred Schedule</span>
                                        <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                            <Calendar size={14} />
                                            {selectedJob.preferred_date} at {selectedJob.preferred_time}
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <span className="text-[10px] font-black text-[#007EA7] uppercase tracking-widest block">Features</span>
                                        <div className="flex flex-wrap gap-1">
                                            {selectedJob.additional_features && selectedJob.additional_features.length > 0 ? (
                                                selectedJob.additional_features.map((feature, i) => (
                                                    <span key={i} className="text-[10px] bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                                                        {feature}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-xs text-gray-400">Standard property</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100">
                                <span className="text-[10px] font-black text-[#007EA7] uppercase tracking-widest block mb-2">Internal Reference</span>
                                <p className="text-base font-bold text-gray-900 leading-relaxed italic">
                                    "{selectedJob.property_address}"
                                </p>
                            </div>

                            <div className="flex flex-col gap-4">
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => {
                                            setJobDetailsModalOpen(false);
                                            setRejectionModalOpen(true);
                                        }}
                                        className="flex-1 py-4 text-red-500 rounded-2xl font-bold bg-red-50 hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                                    >
                                        <X size={20} />
                                        Reject Lead
                                    </button>
                                    <button
                                        onClick={handleStartQuote}
                                        className="flex-[2] py-4 bg-[#007EA7] text-white rounded-2xl font-black text-lg hover:bg-[#005F7E] transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-3"
                                    >
                                        Start Quoting
                                        <ArrowRight size={20} />
                                    </button>
                                </div>
                                <button
                                    onClick={() => setJobDetailsModalOpen(false)}
                                    className="text-sm text-gray-400 font-bold hover:text-gray-600"
                                >
                                    Decide Later
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Quote Modal - STEPS 2 & 3 */}
            {quoteModalOpen && selectedJob && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="bg-[#007EA7] p-8 text-white relative">
                            <button
                                onClick={() => setQuoteModalOpen(false)}
                                className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors"
                            >
                                <X size={24} />
                            </button>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest">
                                    Step {quoteStep} of 3
                                </div>
                                {quoteStep > 1 && (
                                    <button
                                        onClick={() => setQuoteStep(prev => (prev - 1) as 1 | 2 | 3)}
                                        className="text-xs font-bold text-white/80 hover:text-white flex items-center gap-1"
                                    >
                                        <ArrowLeft size={14} /> Back
                                    </button>
                                )}
                            </div>
                            <h3 className="text-2xl font-black">
                                {quoteStep === 1 ? 'Quoting Details' : quoteStep === 2 ? 'Review Quote' : 'Email Verification'}
                            </h3>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8">
                            {quoteStep === 1 && (
                                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Proposed Price (€)</label>
                                        <div className="relative">
                                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xl font-bold text-gray-400">€</span>
                                            <input
                                                type="number"
                                                value={quotePrice}
                                                onChange={(e) => setQuotePrice(e.target.value)}
                                                className="w-full bg-gray-50 border-2 border-transparent focus:border-[#007EA7] rounded-2xl pl-12 pr-6 py-4 text-2xl font-black outline-none transition-all"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Notes for Client</label>
                                        <textarea
                                            value={quoteNotes}
                                            onChange={(e) => setQuoteNotes(e.target.value)}
                                            className="w-full bg-gray-50 border-2 border-transparent focus:border-[#007EA7] rounded-2xl px-6 py-4 text-sm font-medium outline-none transition-all min-h-[120px]"
                                            placeholder="Timeline, service details..."
                                        />
                                    </div>
                                    <button
                                        onClick={() => setQuoteStep(2)}
                                        className="w-full py-5 bg-[#007EA7] text-white rounded-2xl font-black text-lg hover:bg-[#005F7E] transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-3"
                                    >
                                        Preview Quote
                                        <ArrowRight size={20} />
                                    </button>
                                </div>
                            )}

                            {quoteStep === 2 && (
                                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                    <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 space-y-4">
                                        <div className="flex justify-between items-center border-b border-gray-200 pb-4">
                                            <span className="text-xs font-bold text-gray-400 uppercase">Grand Total</span>
                                            <span className="text-3xl font-black text-[#007EA7]">€{parseFloat(quotePrice).toLocaleString()}</span>
                                        </div>
                                        <div className="space-y-2">
                                            <span className="text-[10px] font-black text-gray-400 uppercase">Your Notes</span>
                                            <p className="text-sm font-medium text-gray-600 italic">"{quoteNotes || 'No notes provided'}"</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-4 bg-amber-50 text-amber-700 rounded-2xl border border-amber-100">
                                        <Mail size={20} />
                                        <p className="text-xs font-bold">A verification code will be sent to your email to confirm this quote.</p>
                                    </div>
                                    <button
                                        onClick={() => setQuoteStep(3)}
                                        className="w-full py-5 bg-[#007EA7] text-white rounded-2xl font-black text-lg hover:bg-[#005F7E] transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-3"
                                    >
                                        Proceed to Verification
                                        <ArrowRight size={20} />
                                    </button>
                                </div>
                            )}

                            {quoteStep === 3 && (
                                <div className="animate-in slide-in-from-right-4 duration-300">
                                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                                        <EmailVerification
                                            email={user?.email || ''}
                                            assessmentId={selectedJob?.id}
                                            onVerified={() => {
                                                handleSubmitQuote();
                                            }}
                                            onBack={() => setQuoteStep(2)}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Rejection Modal */}
            {rejectionModalOpen && selectedJob && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8 text-center space-y-6">
                            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
                                <AlertTriangle size={40} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-gray-900">Reject this lead?</h3>
                                <p className="text-sm text-gray-500 font-medium">Please let us know why you're unable to take this job.</p>
                            </div>

                            <select
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="w-full bg-gray-50 border-2 border-transparent focus:border-red-500 rounded-2xl px-6 py-4 text-sm font-bold outline-none transition-all"
                            >
                                <option value="">Select a reason...</option>
                                <option value="too_busy">Too busy / High workload</option>
                                <option value="outside_area">Outside my service area</option>
                                <option value="incorrect_requirements">Incorrect property requirements</option>
                                <option value="safety_concerns">Safety or access concerns</option>
                                <option value="other">Other reason</option>
                            </select>

                            <div className="flex gap-4 pt-2">
                                <button
                                    onClick={() => setRejectionModalOpen(false)}
                                    className="flex-1 py-4 text-gray-500 font-bold bg-gray-100 rounded-2xl hover:bg-gray-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleRejectJob}
                                    disabled={!rejectionReason || isSubmitting}
                                    className="flex-[2] py-4 bg-red-500 text-white rounded-2xl font-black hover:bg-red-600 transition-all shadow-xl shadow-red-100 disabled:opacity-50"
                                >
                                    Confirm Rejection
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Scheduling Modal */}
            {schedulingJob && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm p-8 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-gray-900">Schedule Inspection</h3>
                            <button onClick={() => setSchedulingJob(null)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Inspection Date</label>
                                <input
                                    type="date"
                                    value={scheduledDate}
                                    onChange={(e) => setScheduledDate(e.target.value)}
                                    className="w-full border-2 border-gray-100 rounded-2xl px-4 py-3 focus:outline-none focus:border-[#007EA7] transition-colors font-bold text-gray-900"
                                />
                            </div>
                            <button
                                onClick={() => handleUpdateStatus(schedulingJob.id, 'scheduled', { scheduled_date: scheduledDate })}
                                disabled={isSubmitting || !scheduledDate}
                                className="w-full bg-[#007EA7] text-white py-4 rounded-2xl font-bold hover:bg-[#005F7E] transition-all shadow-lg shadow-blue-100 disabled:opacity-50"
                            >
                                {isSubmitting ? 'Scheduling...' : 'Confirm Schedule'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Completion Modal */}
            {completingJob && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm p-8 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-gray-900">Complete Job</h3>
                            <button onClick={() => setCompletingJob(null)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">BER Certificate URL</label>
                                <input
                                    type="url"
                                    placeholder="https://..."
                                    value={certUrl}
                                    onChange={(e) => setCertUrl(e.target.value)}
                                    className="w-full border-2 border-gray-100 rounded-2xl px-4 py-3 focus:outline-none focus:border-[#007EA7] transition-colors font-bold text-gray-900"
                                />
                                <p className="text-[10px] text-gray-400 mt-2 font-medium italic">Please provide a link to the generated BER certificate.</p>
                            </div>
                            <button
                                onClick={() => handleUpdateStatus(completingJob.id, 'completed', { certificate_url: certUrl })}
                                disabled={isSubmitting || !certUrl}
                                className="w-full bg-[#007F00] text-white py-4 rounded-2xl font-bold hover:bg-green-800 transition-all shadow-lg shadow-green-100 disabled:opacity-50"
                            >
                                {isSubmitting ? 'Completing...' : 'Submit & Complete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContractorDashboard;
