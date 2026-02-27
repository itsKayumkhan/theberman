import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import QuoteFormModule from '../components/QuoteFormModule';
import { useAuth } from '../hooks/useAuth';

const QuoteForm = () => {
    const navigate = useNavigate();
    const { role } = useAuth();

    // Redirect admin and BER assessor users away from the quote form
    if (role === 'admin' || role === 'contractor') {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center px-6">
                    <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center mb-6 mx-auto">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-3">Quote Form Not Available</h1>
                    <p className="text-gray-500 max-w-md mx-auto mb-8">
                        {role === 'admin'
                            ? 'As an admin, you cannot submit quote requests. This form is for homeowners and users looking for BER assessments.'
                            : 'As a BER assessor, you cannot submit quote requests. This form is for homeowners and users looking for BER assessments.'}
                    </p>
                    <button
                        onClick={() => navigate(role === 'admin' ? '/admin' : '/dashboard/ber-assessor')}
                        className="px-8 py-3 bg-[#007F00] text-white font-bold rounded-xl hover:bg-[#006600] transition-colors"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-7xl mx-auto px-4 py-12 md:py-20">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-3 text-gray-500 hover:text-[#007F00] transition-all mb-8 group cursor-pointer"
                >
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-green-50 group-hover:text-[#007F00] transition-all border border-gray-100 group-hover:border-green-100">
                        <ArrowLeft size={20} />
                    </div>
                    <span className="font-black text-xs uppercase tracking-widest">Back</span>
                </button>

                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">
                        Get Your BER Quote
                    </h1>
                    <p className="text-gray-500 max-w-2xl mx-auto">
                        Complete the form below to receive competitive quotes from SEAI registered BER assessors in your area.
                    </p>
                </div>

                <div className="max-w-4xl mx-auto">
                    <QuoteFormModule />
                </div>
            </div>
        </div>
    );
};

export default QuoteForm;
