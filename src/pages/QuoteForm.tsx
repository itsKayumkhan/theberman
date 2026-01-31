import QuoteFormModule from '../components/QuoteFormModule';

const QuoteForm = () => {
    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-7xl mx-auto px-4 py-12 md:py-20">
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
