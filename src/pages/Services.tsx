import React from 'react';
import { Truck, BarChart3, Cpu, Globe2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import ServiceCard from '../components/ServiceCard';

const Services = () => {
    return (
        <div className="font-sans text-gray-900 bg-white">
            {/* 1. HERO SECTION */}
            <section className="pt-32 pb-20 bg-gradient-to-b from-green-50 to-white">
                <div className="container mx-auto px-6 text-center max-w-4xl">
                    <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-green-100 text-[#007F00] text-xs font-bold tracking-wide uppercase">
                        What We Do
                    </div>
                    <h1 className="text-5xl md:text-6xl font-serif font-bold text-gray-900 mb-6 leading-tight">
                        Comprehensive Energy <br />
                        <span className="text-[#007F00]">Solutions.</span>
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                        From Domestic BERs to large-scale commercial audits, we provide the expertise you need to meet regulations and cut costs.
                    </p>
                </div>
            </section>

            {/* 2. DO I NEED A BER SECTION (New) */}
            <section className="py-16 border-y border-gray-100">
                <div className="container mx-auto px-6">
                    <div className="bg-yellow-50 rounded-2xl p-8 border border-yellow-200 flex flex-col md:flex-row gap-8 items-start">
                        <div className="bg-yellow-100 p-4 rounded-full text-yellow-700 mt-1 flex-shrink-0">
                            <AlertTriangle size={32} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-serif font-bold text-gray-900 mb-4">Who needs a BER Certificate?</h3>
                            <p className="text-gray-700 mb-6 max-w-3xl">
                                A Building Energy Rating (BER) is required by law if you are offering a property for sale or rent in Ireland. It is also required applying for SEAI grants to improve your home's energy efficiency.
                            </p>
                            <div className="grid md:grid-cols-2 gap-4">
                                <CheckItem text="Homeowners selling their property" />
                                <CheckItem text="Landlords renting out a unit" />
                                <CheckItem text="Applicants for SEAI Grants" />
                                <CheckItem text="New Builds (Provisional & Final)" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. DETAILED SERVICES (New - Detailed Breakdown) */}
            <section className="py-24">
                <div className="container mx-auto px-6 space-y-32">

                    {/* Domestic */}
                    <DetailedService
                        title="Domestic BER Assessments"
                        desc="For homeowners and landlords. We survey your property to calculate its energy performance."
                        points={[
                            "Fast turnaround (24-48 hours)",
                            "Advisory Report included with every cert",
                            "Grant eligibility checks included",
                            "Discounts for multiple properties"
                        ]}
                        image="/api/placeholder/600/400"
                        align="left"
                    />

                    {/* Commercial */}
                    <DetailedService
                        title="Commercial Energy Audits"
                        desc="Detailed analysis for businesses, retail, and industrial units. Reduce overheads and meet compliance."
                        points={[
                            "Non-Domestic Energy Assessment (NDBER)",
                            "Display Energy Certificates (DEC)",
                            "detailed payback analysis for upgrades",
                            "Portfolio management"
                        ]}
                        image="/api/placeholder/600/400"
                        align="right"
                    />
                </div>
            </section>

            {/* 4. ALL SERVICES GRID */}
            <section className="py-24 bg-gray-50">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">Other Services</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <ServiceCard
                            compact={true}
                            icon={<Cpu className="w-7 h-7" />}
                            title="Technical Advisory"
                            description="Expert guidance on heat pump suitability, insulation upgrades, and solar PV potential for your property."
                        />
                        <ServiceCard
                            compact={true}
                            icon={<BarChart3 className="w-7 h-7" />}
                            title="Energy Audits"
                            description="Deep-dive analysis into energy usage patterns to identify wastage and significant cost-saving opportunities."
                        />
                        <ServiceCard
                            compact={true}
                            icon={<Globe2 className="w-7 h-7" />}
                            title="Grant Consulting"
                            description="Navigate the SEAI grant process with ease. We help you identify what grants you qualify for."
                        />
                        <ServiceCard
                            compact={true}
                            icon={<Truck className="w-7 h-7" />}
                            title="Fleet Analysis"
                            description="For logistics businesses, we analyze fleet efficiency and recommend strategies to reduce fuel consumption."
                        />
                    </div>
                </div>
            </section>

            {/* 5. PROCESS */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">How It Works</h2>
                        <p className="text-gray-500 max-w-xl mx-auto">Simple steps to get your certification.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gray-200 -z-10"></div>

                        {[
                            { step: "01", title: "Book Assessment", desc: "Contact us to schedule a convenient time." },
                            { step: "02", title: "Site Survey", desc: "Our assessor visits to inspect and measure." },
                            { step: "03", title: "Receive Cert", desc: "Get your BER certificate and advisory report." }
                        ].map((item, i) => (
                            <div key={i} className="text-center bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                                <div className="w-16 h-16 bg-[#9ACD32] text-green-900 rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-6 border-4 border-green-50">
                                    {item.step}
                                </div>
                                <h3 className="text-xl font-bold font-serif mb-3">{item.title}</h3>
                                <p className="text-gray-600">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 6. CTA SECTION */}
            <section className="py-24 bg-[#007F00] text-white">
                <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-4xl font-serif font-bold mb-6">Not sure what you need?</h2>
                        <p className="text-green-100 text-lg mb-8">
                            Our team is happy to advise on the best solution for your property or business requirements.
                        </p>
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="text-[#9ACD32]" />
                                <span className="font-medium">Free initial consultation</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="text-[#9ACD32]" />
                                <span className="font-medium">Transparent pricing</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-8 rounded-2xl text-gray-900 text-center">
                        <h3 className="text-2xl font-bold font-serif mb-4">Get a Quote Today</h3>
                        <p className="text-gray-600 mb-8">Fill out our simple form to get started.</p>
                        <Link to="/contact">
                            <button className="w-full bg-[#9ACD32] text-green-900 font-bold py-4 rounded-lg hover:bg-lime-400 transition shadow-lg">
                                Go to Contact Form
                            </button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

// --- SUBCOMPONENTS ---


const DetailedService = ({ title, desc, points, image, align }: { title: string, desc: string, points: string[], image: string, align: 'left' | 'right' }) => (
    <div className={`flex flex-col md:flex-row gap-16 items-center ${align === 'right' ? 'md:flex-row-reverse' : ''}`}>
        <div className="flex-1">
            <div className="bg-green-100 text-[#007F00] px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide inline-block mb-4">
                Service Focus
            </div>
            <h3 className="text-3xl font-serif font-bold text-gray-900 mb-6">{title}</h3>
            <p className="text-gray-600 text-lg mb-8 leading-relaxed">{desc}</p>
            <ul className="space-y-4">
                {points.map((p, i) => (
                    <li key={i} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <CheckCircle2 className="text-[#9ACD32] flex-shrink-0" />
                        <span className="font-medium text-gray-800">{p}</span>
                    </li>
                ))}
            </ul>
        </div>
        <div className="flex-1 relative">
            <div className="absolute inset-4 bg-[#9ACD32]/20 rounded-3xl transform rotate-3"></div>
            <div className="bg-gray-100 rounded-3xl w-full h-[400px] overflow-hidden flex items-center justify-center relative z-10 border border-gray-200 shadow-xl">
                <img src={image} alt={title} className="w-full h-full object-cover" />
            </div>
        </div>
    </div>
);

const CheckItem = ({ text }: { text: string }) => (
    <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
        <span className="text-gray-700 font-medium">{text}</span>
    </div>
);

export default Services;
