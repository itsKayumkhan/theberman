
import React from 'react';
import { Check, ArrowRight, X, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import FaqItem from '../components/FaqItem';

const Pricing = () => {
    return (
        <div className="font-sans text-gray-900 bg-white">
            {/* 1. HERO SECTION */}
            <section className="pt-32 pb-20 bg-gradient-to-b from-green-50 to-white">
                <div className="container mx-auto px-6 text-center max-w-4xl">
                    <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-green-100 text-[#007F00] text-xs font-bold tracking-wide uppercase">
                        Pricing
                    </div>
                    <h1 className="text-5xl md:text-6xl font-serif font-bold text-gray-900 mb-6 leading-tight">
                        Transparent <span className="text-[#007F00]">Rates.</span>
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                        Choose the plan that fits your property type. No hidden fees, VAT included where applicable.
                    </p>
                </div>
            </section>

            {/* 2. PRICING CARDS */}
            <section className="pb-24">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-start">

                        {/* Apartment Plan */}
                        <PricingCard
                            title="Apartment / Flat"
                            price="€180"
                            description="Ideal for 1-2 bed apartments or duplex units."
                            features={[
                                "Full SEAI Registered assessment",
                                "Advisory Report included",
                                "Cert published within 24h",
                                "VAT Included"
                            ]}
                        />

                        {/* House Plan (Popular) */}
                        <PricingCard
                            title="Standard House"
                            price="€250"
                            isPopular={true}
                            description="For 3-4 bed semi-detached or terraced homes."
                            features={[
                                "Full SEAI Registered assessment",
                                "Advisory Report included",
                                "Cert published within 24h",
                                "Grant eligibility check",
                                "VAT Included"
                            ]}
                        />

                        {/* Commercial/Custom */}
                        <PricingCard
                            title="Commercial"
                            price="Custom"
                            description="For offices, retail units, and industrial buildings."
                            features={[
                                "Non-Domestic Building Assessment",
                                "Detailed Energy Audit",
                                "Compliance Certification",
                                "Retrofit ROI Analysis",
                                "Invoiced to Business"
                            ]}
                            ctaText="Request Quote"
                            ctaLink="/contact"
                        />
                    </div>
                </div>
            </section>

            {/* 3. COMPARISON TABLE (New) */}
            <section className="py-24 bg-gray-50 border-y border-gray-100">
                <div className="container mx-auto px-6 max-w-5xl">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">Compare Features</h2>
                        <p className="text-gray-500">See exactly what you get with each service level.</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-900 font-bold">
                                <tr>
                                    <th className="p-6">Feature</th>
                                    <th className="p-6 text-center">Standard BER</th>
                                    <th className="p-6 text-center text-[#007F00]">Premium Audit</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                <TableRow label="Official SEAI Cert" standard={true} premium={true} />
                                <TableRow label="Advisory Report" standard={true} premium={true} />
                                <TableRow label="Grant Advice" standard={true} premium={true} />
                                <TableRow label="Heat Loss Survey" standard={false} premium={true} />
                                <TableRow label="Retrofit ROI Calc" standard={false} premium={true} />
                                <TableRow label="Solar PV Simulation" standard={false} premium={true} />
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* 4. FAQ SECTION */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-6 max-w-3xl">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
                    </div>
                    <div className="space-y-6">
                        <FaqItem
                            question="How long does a BER assessment take?"
                            answer="Typically, a domestic assessment takes about 45 minutes to an hour on-site, depending on the size and complexity of the property."
                        />
                        <FaqItem
                            question="How long is a BER certificate valid for?"
                            answer="A BER certificate is valid for 10 years, provided no structural changes or upgrades are made to the property."
                        />
                        <FaqItem
                            question="Do I need a BER to sell my house?"
                            answer="Yes, it is a legal requirement to provide a BER certificate to prospective buyers or tenants."
                        />
                        <FaqItem
                            question="What happens if I get a bad rating?"
                            answer="A bad rating does not prevent you from selling. It simply informs the buyer. Our advisory report will suggest ways to improve it."
                        />
                    </div>
                </div>
            </section>

            {/* 5. CTA */}
            <section className="py-20 bg-[#007F00] text-center text-white">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-serif font-bold mb-6">Need a custom quote for a portfolio?</h2>
                    <Link to="/contact">
                        <button className="bg-white text-[#007F00] font-bold px-10 py-4 rounded-full hover:bg-gray-100 transition shadow-lg">
                            Contact Sales Team
                        </button>
                    </Link>
                </div>
            </section>

        </div>
    );
};

// --- SUBCOMPONENTS ---

const PricingCard = ({
    title,
    price,
    description,
    features,
    isPopular = false,
    ctaText = "Book Now",
    ctaLink = "/contact"
}: {
    title: string,
    price: string,
    description: string,
    features: string[],
    isPopular?: boolean,
    ctaText?: string,
    ctaLink?: string
}) => (
    <div className={`relative bg-white rounded-2xl flex flex-col transition-all duration-300 ${isPopular ? 'border-2 border-[#9ACD32] shadow-xl scale-105 z-10' : 'border border-gray-100 hover:shadow-lg'}`}>
        {isPopular && (
            <div className="absolute top-0 transform -translate-y-1/2 left-1/2 -translate-x-1/2 bg-[#9ACD32] text-green-900 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
                Most Popular
            </div>
        )}
        <div className="p-8 flex-grow">
            <h3 className="text-lg font-bold text-gray-500 mb-2 uppercase tracking-wide">{title}</h3>
            <div className="flex items-baseline mb-4">
                <span className="text-5xl font-bold font-serif text-gray-900">{price}</span>
                {price !== "Custom" && <span className="text-gray-500 ml-1 text-lg">/unit</span>}
            </div>
            <p className="text-gray-600 mb-8 leading-relaxed">{description}</p>

            <ul className="space-y-4 mb-8">
                {features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                        <Check className="w-5 h-5 text-[#007F00] mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 font-medium text-sm">{feature}</span>
                    </li>
                ))}
            </ul>
        </div>

        <div className="p-8 pt-0 mt-auto">
            <Link to={ctaLink}>
                <button
                    className={`w-full py-4 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 ${isPopular
                        ? 'bg-[#007F00] text-white hover:bg-green-800'
                        : 'bg-green-50 text-[#007F00] hover:bg-green-100'
                        }`}
                >
                    {ctaText} <ArrowRight size={18} />
                </button>
            </Link>
        </div>
    </div>
);

const TableRow = ({ label, standard, premium }: { label: string, standard: boolean, premium: boolean }) => (
    <tr className="hover:bg-gray-50 transition">
        <td className="p-6 font-medium text-gray-800">{label}</td>
        <td className="p-6 text-center bg-gray-50/50">
            {standard ? <CheckCircle2 className="mx-auto text-gray-400" size={20} /> : <X className="mx-auto text-gray-300" size={20} />}
        </td>
        <td className="p-6 text-center bg-green-50/30">
            {premium ? <CheckCircle2 className="mx-auto text-[#007F00]" size={20} /> : <X className="mx-auto text-gray-300" size={20} />}
        </td>
    </tr>
)


export default Pricing;
