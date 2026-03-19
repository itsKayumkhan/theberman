import { useEffect, useState, Fragment } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { LogOut, HardHat, ClipboardList, CheckCircle2, Clock, X, TrendingUp, DollarSign, Briefcase, Calendar, MapPin, ArrowRight, ArrowLeft, AlertTriangle, AlertCircle, Settings, MessageCircle, User, Menu, Plus, Search } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { DatePicker } from '../components/ui/DatePicker';
import { geocodeAddress } from '../lib/geocoding';
import DashboardLayout, { type NavItem } from '../components/DashboardLayout';

import toast from 'react-hot-toast';

interface Quote {
    id: string;
    price: number;
    notes: string;
    status: 'pending' | 'accepted' | 'rejected';
    created_at: string;
    assessment_id: string;
    lowestPrice?: number;
    assessment?: {
        id: string;
        town: string;
        county: string;
        property_type: string;
        property_size: string;
        bedrooms: number;
        heat_pump: string;
        ber_purpose: string;
        additional_features: string[];
        preferred_date: string;
        preferred_time?: string;
        created_at: string;
        property_address?: string;
        scheduled_date: string | null;
        completed_at?: string | null;
        user_id: string;
        status: 'live' | 'submitted' | 'pending_quote' | 'quote_accepted' | 'scheduled' | 'completed';
        eircode?: string;
    };
    is_loyalty_payout?: boolean;
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
    completed_at?: string | null;
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
    payment_status?: string;
    eircode?: string;
    job_type?: string;
    building_type?: string;
    floor_area?: string;
    building_complexity?: string;
    assessment_purpose?: string;
    heating_cooling_systems?: string[];
    existing_docs?: string[];
    notes?: string;
    contractor_payout?: number;
}

const COUNTIES = [
    'Carlow', 'Cavan', 'Clare', 'Cork', 'Donegal', 'Dublin', 'Galway', 'Kerry',
    'Kildare', 'Kilkenny', 'Laois', 'Leitrim', 'Limerick', 'Longford', 'Louth',
    'Mayo', 'Meath', 'Monaghan', 'Offaly', 'Roscommon', 'Sligo', 'Tipperary',
    'Waterford', 'Westmeath', 'Wexford', 'Wicklow'
];

const NAV_ITEMS: NavItem[] = [
    { id: 'available', label: 'Available Jobs', icon: Briefcase },
    { id: 'my_quotes', label: 'My Quotes', icon: ClipboardList },
    { id: 'active', label: 'My Clients', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
];

const ContractorDashboard = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    const [view, setView] = useState<'available' | 'my_quotes' | 'active' | 'settings'>('available');
    const [profile, setProfile] = useState<any>(null);
    const [catalogueListing, setCatalogueListing] = useState<any>(null);
    const [availableJobs, setAvailableJobs] = useState<Assessment[]>([]);
    const [myQuotes, setMyQuotes] = useState<Quote[]>([]);
    const [activeJobs, setActiveJobs] = useState<Assessment[]>([]);
    const [loading, setLoading] = useState(true);

    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

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
    const [quoteStep, setQuoteStep] = useState<1 | 2 | 3 | 4>(1);
    const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [expandedContactId, setExpandedContactId] = useState<string | null>(null);
    const [selectedAvailabilityDate, setSelectedAvailabilityDate] = useState<string | null>(null);
    const [termsAgreed, setTermsAgreed] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (catalogueListing?.address) {
            const addressLower = catalogueListing.address.toLowerCase();
            const detectedCounty = COUNTIES.find(c => addressLower.includes(c.toLowerCase()));
            if (detectedCounty && detectedCounty !== profile?.home_county) {
                setProfile((prev: any) => ({ ...prev, home_county: detectedCounty }));
            }
        }
    }, [catalogueListing?.address]);

    useEffect(() => {
        if (user) {
            fetchData();
            const channel = supabase
                .channel('contractor-dashboard')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'assessments' }, () => fetchData())
                .on('postgres_changes', { event: '*', schema: 'public', table: 'quotes' }, () => fetchData())
                .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => fetchData())
                .subscribe();
            return () => { supabase.removeChannel(channel); };
        }
    }, [user]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user?.id)
                .maybeSingle();

            if (!profileError && profileData) setProfile(profileData);

            const { data: listingData, error: listingError } = await supabase
                .from('catalogue_listings')
                .select('*')
                .eq('email', user?.email)
                .maybeSingle();

            if (!listingError && listingData) setCatalogueListing(listingData);

            const { data: jobs, error: jobsError } = await supabase
                .from('assessments')
                .select(`*, profiles:user_id (full_name), quotes (*)`)
                .in('status', ['live', 'submitted', 'pending_quote'])
                .order('created_at', { ascending: false });

            if (jobsError) throw jobsError;

            const validJobs = (jobs || []).filter(job => {
                const diffInDays = (new Date().getTime() - new Date(job.created_at).getTime()) / (1000 * 3600 * 24);
                return diffInDays <= 5;
            });

            const { data: quotes, error: quotesError } = await supabase
                .from('quotes')
                .select(`*, assessment:assessment_id (*)`)
                .eq('created_by', user?.id)
                .order('created_at', { ascending: false });

            if (quotesError) throw quotesError;

            const uniqueQuotesMap = new Map();
            quotes?.forEach(q => { if (!uniqueQuotesMap.has(q.assessment_id)) uniqueQuotesMap.set(q.assessment_id, q); });

            const uniqueQuotes = Array.from(uniqueQuotesMap.values()).filter((q: any) => {
                if (q.status === 'accepted') return true;
                const diffInDays = (new Date().getTime() - new Date(q.assessment?.created_at || q.created_at).getTime()) / (1000 * 3600 * 24);
                return diffInDays <= 5;
            });

            const assessmentIds = uniqueQuotes.map(q => q.assessment_id);
            let enrichedQuotes = uniqueQuotes;
            if (assessmentIds.length > 0) {
                const { data: lowestQuotesData, error: rpcError } = await supabase.rpc('get_assessment_lowest_quotes', { p_assessment_ids: assessmentIds });
                if (!rpcError && lowestQuotesData) {
                    const minPrices: Record<string, number> = {};
                    lowestQuotesData.forEach((item: any) => { minPrices[item.assessment_id] = item.min_price; });
                    enrichedQuotes = uniqueQuotes.map(q => ({ ...q, lowestPrice: minPrices[q.assessment_id] || q.price }));
                }
            }
            setMyQuotes(enrichedQuotes);

            const quotedIds = new Set(quotes?.map(q => q.assessment_id) || []);
            let filteredAvailableJobs = validJobs?.filter(j => !quotedIds.has(j.id)) || [];

            if (profileData?.preferred_counties && profileData.preferred_counties.length > 0) {
                filteredAvailableJobs = filteredAvailableJobs.filter(job => profileData.preferred_counties.includes(job.county));
            }

            const assessorType = profileData?.assessor_type || '';
            const isDomesticAssessor = assessorType.includes('Domestic');
            const isCommercialAssessor = assessorType.includes('Commercial');

            filteredAvailableJobs = filteredAvailableJobs.filter(job => {
                return job.job_type === 'commercial' ? isCommercialAssessor : isDomesticAssessor;
            });

            setAvailableJobs(filteredAvailableJobs);

            const { data: active, error: activeError } = await supabase
                .from('assessments')
                .select(`*, profiles:user_id (full_name), contact_name, contact_email, contact_phone, certificate_url`)
                .eq('contractor_id', user?.id)
                .order('created_at', { ascending: false });

            if (activeError) throw activeError;

            const activeWithQuotes = (active || []).map(job => ({
                ...job,
                quotes: quotes?.filter(q => q.assessment_id === job.id) || []
            }));

            setActiveJobs(activeWithQuotes);
        } catch (error: any) {
            console.error('Error fetching contractor data:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleStartQuote = () => {
        setJobDetailsModalOpen(false);
        setQuoteModalOpen(true);
        setQuoteStep(1);
        setSelectedAvailabilityDate(null);
        setTermsAgreed(false);
        setQuotePrice('');
        setQuoteNotes('');
    };

    const handleReQuote = (quote: Quote) => {
        if (!quote.assessment) return;
        const jobData: Assessment = {
            id: quote.assessment_id,
            property_address: quote.assessment.property_address || '',
            town: quote.assessment.town,
            county: quote.assessment.county,
            property_type: quote.assessment.property_type,
            property_size: quote.assessment.property_size,
            bedrooms: quote.assessment.bedrooms,
            heat_pump: quote.assessment.heat_pump,
            ber_purpose: quote.assessment.ber_purpose,
            additional_features: quote.assessment.additional_features,
            created_at: quote.assessment.created_at,
            preferred_date: quote.assessment.preferred_date,
            preferred_time: quote.assessment.preferred_time || '',
            status: 'pending_quote',
            scheduled_date: quote.assessment.scheduled_date,
            completed_at: quote.assessment.completed_at,
            user_id: quote.assessment.user_id,
        };
        setSelectedJob(jobData);
        setQuoteModalOpen(true);
        setQuoteStep(1);
        setSelectedAvailabilityDate(null);
        setTermsAgreed(false);
        setQuotePrice('');
        setQuoteNotes('');
    };

    const handleSubmitQuote = async () => {
        if (!selectedJob || !quotePrice || isSubmitting) return;
        try {
            setIsSubmitting(true);
            const existingQuote = myQuotes.find(q => q.assessment_id === selectedJob.id);
            let error;
            if (existingQuote) {
                const { error: updateError } = await supabase.from('quotes').update({ price: parseFloat(quotePrice), notes: quoteNotes, status: 'pending' }).eq('id', existingQuote.id);
                error = updateError;
            } else {
                const isLoyaltyJob = (profile?.completed_jobs_count || 0) % 11 === 10;
                const { error: insertError } = await supabase.from('quotes').insert({ assessment_id: selectedJob.id, price: parseFloat(quotePrice), notes: quoteNotes, created_by: user?.id, status: 'pending', is_loyalty_payout: isLoyaltyJob });
                error = insertError;
            }
            if (error) throw error;
            if (selectedJob.status === 'submitted') await supabase.from('assessments').update({ status: 'pending_quote' }).eq('id', selectedJob.id);
            supabase.functions.invoke('send-quote-notification', { body: { assessmentId: selectedJob.id } }).catch(err => console.error(err));
            toast.success('Quote submitted!');
            setQuoteModalOpen(false);
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
            const { error } = await supabase.from('audit_logs').insert({ user_id: user?.id, action: 'lead_rejected', details: { assessment_id: selectedJob.id, reason: rejectionReason, address: selectedJob.property_address } });
            if (error) throw error;
            toast.success('Lead rejected.');
            setRejectionModalOpen(false);
            setJobDetailsModalOpen(false);
            fetchData();
        } catch (error: any) {
            toast.error('Failed to reject lead');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateStatus = async (jobId: string, newStatus: string, extraData: any = {}) => {
        try {
            setIsSubmitting(true);
            const { data: currentJob } = await supabase.from('assessments').select('status, scheduled_date').eq('id', jobId).maybeSingle();
            const isRescheduled = newStatus === 'scheduled' && currentJob?.status === 'scheduled' && currentJob?.scheduled_date !== extraData.scheduled_date;
            const { error } = await supabase.from('assessments').update({ status: newStatus, ...extraData }).eq('id', jobId);
            if (error) throw error;
            if (newStatus === 'scheduled' || newStatus === 'completed') {
                supabase.functions.invoke('send-job-status-notification', { body: { assessmentId: jobId, status: isRescheduled ? 'rescheduled' : newStatus, details: { inspectionDate: extraData.scheduled_date, certificateUrl: extraData.certificate_url, contractorName: profile?.full_name } } }).catch(err => console.error(err));
            }
            toast.success(`Job marked as ${newStatus}`);
            setSchedulingJob(null);
            setCompletingJob(null);
            fetchData();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const stats = {
        earnings: myQuotes.filter(q => q.status === 'accepted').reduce((sum, q) => sum + Number(q.price), 0),
        pending: myQuotes.filter(q => q.status === 'pending').length,
        completed: activeJobs.filter(j => j.status === 'completed').length,
        totalQuotes: myQuotes.length,
        loyaltyJobs: profile?.completed_jobs_count || 0
    };

    const isSuspended = profile?.stripe_payment_id === 'SUSPENDED';
    if (isSuspended || profile?.registration_status === 'pending') {
        const suspended = isSuspended;
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
                <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                    <div className={`h-2 ${suspended ? 'bg-red-500' : 'bg-[#007F00]'}`} />
                    <div className="p-10 text-center">
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${suspended ? 'bg-red-50' : 'bg-green-50'}`}>
                            <AlertCircle size={40} className={suspended ? 'text-red-500' : 'text-[#007F00]'} />
                        </div>
                        <h1 className="text-2xl font-black text-gray-900 mb-3">{suspended ? 'Account Suspended' : 'Account Pending'}</h1>
                        <p className="text-gray-500 mb-6">{suspended ? 'Your account has been suspended.' : 'Your profile is waiting for review.'}</p>
                        <button onClick={() => { signOut(); navigate('/login'); }} className="w-full py-4 border border-gray-100 rounded-2xl font-black uppercase text-xs hover:bg-gray-50 transition-all">Sign Out</button>
                    </div>
                </div>
            </div>
        );
    }

    const handleViewChange = (id: string) => setView(id as any);

    return (
        <DashboardLayout
            title={view === 'available' ? 'Available Jobs' : view === 'my_quotes' ? 'My Active Quotes' : view === 'active' ? 'My Assessment Clients' : 'Assessor Settings'}
            subtitle="Manage your professional energy assessment workflow and client base."
            navItems={NAV_ITEMS}
            activeView={view}
            onViewChange={handleViewChange}
            onRefresh={fetchData}
            loading={loading}
            roleLabel="Assessor Portal"
        >
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all hover:translate-y-[-2px]">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-green-50 text-green-600 rounded-lg"><DollarSign size={20} /></div>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Earnings</span>
                        </div>
                        <p className="text-2xl font-black text-gray-900">€{stats.earnings.toLocaleString()}</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all hover:translate-y-[-2px]">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Clock size={20} /></div>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pending</span>
                        </div>
                        <p className="text-2xl font-black text-gray-900">{stats.pending}</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all hover:translate-y-[-2px]">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><CheckCircle2 size={20} /></div>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Done</span>
                        </div>
                        <p className="text-2xl font-black text-gray-900">{stats.completed}</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all hover:translate-y-[-2px]">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><TrendingUp size={20} /></div>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Success</span>
                        </div>
                        <p className="text-2xl font-black text-gray-900">{stats.totalQuotes > 0 ? Math.round((stats.completed / stats.totalQuotes) * 100) : 0}%</p>
                    </div>
                </div>

                {/* Subscription Warning */}
                {(profile?.subscription_status === 'expired' || profile?.is_active === false) && profile?.registration_status === 'active' && profile?.stripe_payment_id !== 'MANUAL_BY_ADMIN' && (
                    <div className="bg-red-50 border-2 border-red-100 p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-red-100 text-red-600 rounded-full"><AlertCircle /></div>
                            <div>
                                <h4 className="font-black text-red-900 uppercase text-sm">Subscription Expired</h4>
                                <p className="text-red-700 text-xs font-medium">Please renew to reactivate your listing and assessments.</p>
                            </div>
                        </div>
                        <Link to="/pricing" className="bg-red-600 text-white px-8 py-3 rounded-2xl font-black uppercase text-xs shadow-lg shadow-red-100">Renew Now</Link>
                    </div>
                )}

                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-6">
                    {view === 'available' ? (
                        <div className="space-y-6">
                            {availableJobs.length === 0 ? (
                                <div className="text-center py-20">
                                    <Briefcase className="mx-auto text-gray-200 mb-6" size={64} />
                                    <h3 className="text-xl font-bold text-gray-900">No jobs available</h3>
                                    <p className="text-gray-500">We'll notify you of new leads in your area.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto hidden md:block">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-200">
                                                <th className="text-left py-4 px-4 text-xs font-black text-gray-500 uppercase tracking-widest">Posted</th>
                                                <th className="text-left py-4 px-4 text-xs font-black text-gray-500 uppercase tracking-widest">Town</th>
                                                <th className="text-left py-4 px-4 text-xs font-black text-gray-500 uppercase tracking-widest">Type</th>
                                                <th className="text-left py-4 px-4 text-xs font-black text-gray-500 uppercase tracking-widest">Sq. Mt.</th>
                                                <th className="text-right py-4 px-4 text-xs font-black text-gray-500 uppercase tracking-widest">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {availableJobs.map(job => (
                                                <tr key={job.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                                    <td className="py-4 px-4 text-gray-500 font-bold">{new Date(job.created_at).toLocaleDateString()}</td>
                                                    <td className="py-4 px-4 font-black text-gray-900">{job.town}, {job.county}</td>
                                                    <td className="py-4 px-4">
                                                        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase border ${job.job_type === 'commercial' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                                                            {job.job_type === 'commercial' ? 'Comm' : 'Dom'}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-4 italic text-gray-500">{job.property_size || '-'}</td>
                                                    <td className="py-4 px-4 text-right">
                                                        <button onClick={() => { setSelectedJob(job); setJobDetailsModalOpen(true); }} className="bg-[#007EA7] text-white px-4 py-2 rounded-lg font-black text-xs hover:bg-blue-700 transition-all shadow-sm">Quote</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    ) : view === 'my_quotes' ? (
                        <div className="space-y-6">
                            {myQuotes.length === 0 ? (
                                <div className="text-center py-20">
                                    <ClipboardList className="mx-auto text-gray-200 mb-6" size={64} />
                                    <h3 className="text-xl font-bold text-gray-900">No active quotes</h3>
                                </div>
                            ) : (
                                <div className="overflow-x-auto hidden md:block">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-200">
                                                <th className="text-left py-4 px-4 text-xs font-black text-gray-500 uppercase tracking-widest">Posted</th>
                                                <th className="text-left py-4 px-4 text-xs font-black text-gray-500 uppercase tracking-widest">Property</th>
                                                <th className="text-left py-4 px-4 text-xs font-black text-gray-500 uppercase tracking-widest">My Quote</th>
                                                <th className="text-left py-4 px-4 text-xs font-black text-gray-500 uppercase tracking-widest">Status</th>
                                                <th className="text-right py-4 px-4 text-xs font-black text-gray-500 uppercase tracking-widest">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {myQuotes.map(quote => (
                                                <tr key={quote.id} className="border-b border-gray-50 hover:bg-gray-50">
                                                    <td className="py-4 px-4 font-bold text-gray-400">{new Date(quote.created_at).toLocaleDateString()}</td>
                                                    <td className="py-4 px-4 font-black">{quote.assessment?.town || '-'}</td>
                                                    <td className="py-4 px-4 font-black text-[#007EA7]">€{quote.price.toLocaleString()}</td>
                                                    <td className="py-4 px-4">
                                                        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${quote.status === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{quote.status}</span>
                                                    </td>
                                                    <td className="py-4 px-4 text-right">
                                                        <button onClick={() => handleReQuote(quote)} className="text-[10px] font-black uppercase text-green-600 hover:underline">Re-Quote</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    ) : view === 'active' ? (
                        <div className="space-y-6">
                            {activeJobs.length === 0 ? (
                                <div className="text-center py-20">
                                    <User className="mx-auto text-gray-200 mb-6" size={64} />
                                    <h3 className="text-xl font-bold text-gray-900">No active clients</h3>
                                </div>
                            ) : (
                                <div className="overflow-x-auto hidden md:block">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-200">
                                                <th className="text-left py-4 px-4 text-xs font-black text-gray-500 uppercase tracking-widest">Town</th>
                                                <th className="text-left py-4 px-4 text-xs font-black text-gray-500 uppercase tracking-widest">Status</th>
                                                <th className="text-left py-4 px-4 text-xs font-black text-gray-500 uppercase tracking-widest">Contact</th>
                                                <th className="text-right py-4 px-4 text-xs font-black text-gray-500 uppercase tracking-widest">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {activeJobs.map(job => (
                                                <tr key={job.id} className="border-b border-gray-50">
                                                    <td className="py-4 px-4 font-black">{job.town}</td>
                                                    <td className="py-4 px-4">
                                                        <span className="px-2 py-1 rounded text-[10px] font-black uppercase bg-green-50 text-green-600 border border-green-100">{job.status.replace('_', ' ')}</span>
                                                    </td>
                                                    <td className="py-4 px-4 flex flex-col">
                                                        <span className="font-bold text-gray-900">{job.contact_name || 'N/A'}</span>
                                                        <span className="text-[10px] font-medium text-gray-400">{job.contact_email}</span>
                                                    </td>
                                                    <td className="py-4 px-4 text-right">
                                                        {job.status === 'quote_accepted' && <button onClick={() => setSchedulingJob(job)} className="bg-[#007EA7] text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase">Schedule</button>}
                                                        {job.status === 'scheduled' && <button onClick={() => setCompletingJob(job)} className="bg-[#007F00] text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase">Complete</button>}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="max-w-3xl mx-auto space-y-12">
                            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-8 text-white flex justify-between items-center shadow-xl">
                                <div className="space-y-2">
                                    <h4 className="text-2xl font-black">Loyalty Program</h4>
                                    <p className="text-white/80 font-medium">Next free job in {10 - (stats.loyaltyJobs % 11)} assessments.</p>
                                </div>
                                <div className="text-5xl font-black opacity-30">{(stats.loyaltyJobs % 11)}/10</div>
                            </div>
                            <div className="space-y-6">
                                <h4 className="text-xl font-black text-gray-900 uppercase tracking-tight">Service Area Preferences</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {COUNTIES.map(county => {
                                        const isSelected = profile?.preferred_counties?.includes(county);
                                        return (
                                            <button key={county} onClick={async () => {
                                                const current = profile?.preferred_counties || [];
                                                const newCounties = current.includes(county) ? current.filter((c: any) => c !== county) : [...current, county];
                                                setProfile({ ...profile, preferred_counties: newCounties });
                                                await supabase.from('profiles').update({ preferred_counties: newCounties }).eq('id', user?.id);
                                                toast.success(`${county} updated`);
                                            }} className={`py-4 px-6 rounded-2xl border-2 transition-all font-black text-[10px] uppercase tracking-widest ${isSelected ? 'bg-[#5CB85C] border-[#5CB85C] text-white' : 'bg-gray-50 border-gray-100 text-gray-400 hover:border-gray-200'}`}>{county}</button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            {jobDetailsModalOpen && selectedJob && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-[#0c121d]/80 backdrop-blur-sm">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg p-10 text-center animate-in zoom-in-95 duration-200">
                        <div className="w-20 h-20 bg-blue-50 text-[#007EA7] rounded-full flex items-center justify-center mx-auto mb-6"><MapPin size={32} /></div>
                        <h3 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tight">Lead Details</h3>
                        <p className="text-sm text-gray-500 font-medium mb-8">Professional survey for {selectedJob.town}, Co. {selectedJob.county}</p>
                        <div className="grid grid-cols-2 gap-4 mb-10 text-left bg-gray-50 p-6 rounded-2xl">
                            <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Type</p><p className="font-bold text-gray-900">{selectedJob.property_type || selectedJob.building_type}</p></div>
                            <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Size</p><p className="font-bold text-gray-900">{selectedJob.property_size || selectedJob.floor_area}</p></div>
                            <div className="col-span-2"><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Purpose</p><p className="font-bold text-gray-900">{selectedJob.ber_purpose || selectedJob.assessment_purpose}</p></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => setJobDetailsModalOpen(false)} className="py-4 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase text-[10px] tracking-widest">Dismiss</button>
                            <button onClick={handleStartQuote} className="py-4 bg-[#007EA7] text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-blue-200">Start Quoting</button>
                        </div>
                    </div>
                </div>
            )}

            {quoteModalOpen && selectedJob && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-[#0c121d]/80 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg my-10 animate-in zoom-in-95 duration-200 overflow-hidden">
                        {quoteStep === 1 ? (
                            <div className="p-10 space-y-8">
                                <div className="text-center"><h3 className="text-2xl font-black text-gray-900 uppercase">Select Survey Date</h3><p className="text-sm text-gray-500 font-medium">When is the earliest you can perform this BER survey?</p></div>
                                <div className="grid grid-cols-4 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {Array.from({ length: 28 }, (_, i) => {
                                        const d = new Date(); d.setDate(d.getDate() + i + 1);
                                        const ds = d.toISOString().split('T')[0];
                                        return (
                                            <button key={ds} onClick={() => { setSelectedAvailabilityDate(ds); setQuoteStep(2); }} className="p-3 rounded-xl border-2 border-gray-100 hover:border-[#5CB85C] transition-all text-center group">
                                                <p className="text-[10px] font-black text-gray-400 group-hover:text-[#5CB85C]">{d.toLocaleDateString('en-IE', { weekday: 'short' })}</p>
                                                <p className="font-black text-gray-900">{d.getDate()}</p>
                                            </button>
                                        );
                                    })}
                                </div>
                                <button onClick={() => setQuoteModalOpen(false)} className="w-full text-gray-400 font-bold uppercase text-[10px] text-center">Cancel</button>
                            </div>
                        ) : (
                            <div className="p-10 space-y-8">
                                <div className="text-center"><h3 className="text-2xl font-black text-gray-900 uppercase">Your Quote</h3><p className="text-sm text-gray-500 font-medium">Enter your professional fee (including SEAI & platform charges)</p></div>
                                <div className="relative">
                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl font-black text-gray-300">€</div>
                                    <input type="number" value={quotePrice} onChange={(e) => setQuotePrice(e.target.value)} placeholder="000" className="w-full bg-gray-50 border-4 border-transparent focus:border-[#5CB85C] rounded-[2rem] py-8 px-16 text-center text-5xl font-black outline-none transition-all" />
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3 p-4 bg-blue-50/50 rounded-2xl">
                                        <input type="checkbox" id="termsCheck" checked={termsAgreed} onChange={(e) => setTermsAgreed(e.target.checked)} className="mt-1" />
                                        <label htmlFor="termsCheck" className="text-[11px] font-bold text-blue-900 cursor-pointer">I agree to the terms of service and confirm I am qualified for this assessment.</label>
                                    </div>
                                    <button onClick={handleSubmitQuote} disabled={!quotePrice || !termsAgreed || isSubmitting} className="w-full bg-[#5CB85C] text-white py-6 rounded-[2rem] font-black uppercase text-sm shadow-xl shadow-green-100 disabled:opacity-50 transition-all hover:scale-[1.02]">{isSubmitting ? 'Sending...' : 'Confirm & Submit Quote'}</button>
                                    <button onClick={() => setQuoteStep(1)} className="w-full text-gray-400 font-bold uppercase text-[10px] tracking-widest text-center">Change Date</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {schedulingJob && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-[#0c121d]/80 backdrop-blur-sm">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm p-10 text-center animate-in zoom-in-95 duration-200">
                        <div className="w-20 h-20 bg-blue-50 text-[#007EA7] rounded-full flex items-center justify-center mx-auto mb-6"><Calendar size={32} /></div>
                        <h3 className="text-xl font-black text-gray-900 mb-6 uppercase tracking-tight">Set Inspection Date</h3>
                        <div className="mb-8 overflow-hidden rounded-xl border-2 border-gray-100">
                            <DatePicker value={scheduledDate} onChange={setScheduledDate} min={tomorrow} label="" placeholder="Choose Date" />
                        </div>
                        <button onClick={() => handleUpdateStatus(schedulingJob.id, 'scheduled', { scheduled_date: scheduledDate })} disabled={!scheduledDate || isSubmitting} className="w-full bg-[#007EA7] text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-blue-200">Confirm Appointment</button>
                        <button onClick={() => setSchedulingJob(null)} className="mt-4 text-gray-400 font-bold uppercase text-[10px] tracking-widest">Cancel</button>
                    </div>
                </div>
            )}

            {completingJob && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-[#0c121d]/80 backdrop-blur-sm">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm p-10 text-center animate-in zoom-in-95 duration-200">
                        <div className="w-20 h-20 bg-green-50 text-[#007F00] rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle2 size={32} /></div>
                        <h3 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-tight">Finalize Assessment</h3>
                        <p className="text-xs text-gray-500 font-medium mb-8">Enter the public URL to the completed BER certificate.</p>
                        <input type="url" value={certUrl} onChange={(e) => setCertUrl(e.target.value)} placeholder="https://..." className="w-full bg-gray-50 border-2 border-gray-100 focus:border-[#007F00] rounded-2xl py-4 px-6 text-center text-sm font-bold outline-none mb-6 transition-all" />
                        <button onClick={() => handleUpdateStatus(completingJob.id, 'completed', { certificate_url: certUrl, completed_at: new Date().toISOString() })} disabled={!certUrl || isSubmitting} className="w-full bg-[#007F00] text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-green-200">Complete Job</button>
                        <button onClick={() => setCompletingJob(null)} className="mt-4 text-gray-400 font-bold uppercase text-[10px] tracking-widest">Dismiss</button>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default ContractorDashboard;
