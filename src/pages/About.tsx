import React from 'react';
import { Target, Users, Globe, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import ServiceCard from '../components/ServiceCard';

const About = () => {
    return (
        <div className="font-sans text-gray-900 bg-white">
            {/* 1. HERO SECTION */}
            <section className="pt-32 pb-20 bg-gradient-to-b from-green-50 to-white">
                <div className="container mx-auto px-6 text-center max-w-4xl">
                    <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-green-100 text-[#007F00] text-xs font-bold tracking-wide uppercase">
                        Who We Are
                    </div>
                    <h1 className="text-5xl md:text-6xl font-serif font-bold text-gray-900 mb-6 leading-tight">
                        Driving Sustainable <br />
                        <span className="text-[#007F00]">Change.</span>
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                        We are Ireland's leading energy consultancy, dedicated to helping homeowners and businesses reduce their carbon footprint and energy costs.
                    </p>
                </div>
            </section>

            {/* 2. MISSION & STORY */}
            <section className="py-20 border-t border-gray-100">
                <div className="container mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-3xl font-serif font-bold text-gray-900 mb-6">Our Mission</h2>
                        <div className="prose prose-lg text-gray-600 space-y-4">
                            <p>
                                Founded with a vision to revolutionize the energy assessment industry, The Berman started as a small initiative to help local businesses optimize their efficiency.
                            </p>
                            <p>
                                We believe that sustainability shouldn't be complicated. Our goal is to provide clear, actionable advice that makes energy compliance accessible to everyone.
                            </p>
                            <div className="flex flex-col gap-3 mt-6">
                                {["SEAI Registered Professionals", "Over 10,000 Assessments Completed", "Fully Insured & Indemnified"].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <CheckCircle2 className="text-[#9ACD32] flex-shrink-0" size={20} />
                                        <span className="font-medium text-gray-700">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 h-full flex flex-col justify-center">
                        <blockquote className="text-2xl font-serif italic text-gray-800 mb-6">
                            "We don't just measure energy; we help you understand and improve it. That's the Berman promise."
                        </blockquote>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[#007F00] rounded-full flex items-center justify-center text-white font-bold text-xl">
                                K
                            </div>
                            <div>
                                <div className="font-bold text-gray-900">Kayum Khansayal</div>
                                <div className="text-sm text-[#007F00] font-bold uppercase tracking-wider">Founder & Lead Assessor</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. TIMELINE (New) */}
            <section className="py-24 bg-white border-t border-gray-100">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">Our Journey</h2>
                        <p className="text-gray-500">A decade of excellence in energy consulting.</p>
                    </div>
                    <div className="max-w-4xl mx-auto space-y-12 relative">
                        {/* Vertical Line */}
                        <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gray-100 hidden md:block"></div>

                        <TimelineItem year="2015" title="The Beginning" desc="Founded in Dublin with a small team of 2 assessors." align="left" />
                        <TimelineItem year="2018" title="Expansion" desc="Opened regional offices in Cork and Galway." align="right" />
                        <TimelineItem year="2021" title="Digital Leaps" desc="Launched our bespoke digital reporting platform." align="left" />
                        <TimelineItem year="2024" title="Industry Leader" desc="Recognized as Ireland's top commercial rating agency." align="right" />
                    </div>
                </div>
            </section>

            {/* 4. TEAM SECTION (New) */}
            <section className="py-24 bg-gray-50">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">Meet the Experts</h2>
                        <p className="text-gray-500 max-w-xl mx-auto">Our team of certified engineers and assessors.</p>
                    </div>
                    <div className="grid md:grid-cols-4 gap-8">
                        <TeamMember name="Kayum K." role="Principal Engineer" />
                        <TeamMember name="Sarah O." role="Senior Assessor" />
                        <TeamMember name="Michael B." role="commercial Lead" />
                        <TeamMember name="James R." role="Technical Advisor" />
                    </div>
                </div>
            </section>

            {/* 5. CORE VALUES (Cards Style) */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">Our Core Values</h2>
                        <p className="text-gray-500 max-w-xl mx-auto">The principles that guide every assessment we undertake.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <ServiceCard
                            compact={true}
                            showLink={false}
                            icon={<Target size={28} />}
                            title="Precision"
                            description="We use state-of-the-art equipment to ensure every rating is accurate and reliable."
                        />
                        <ServiceCard
                            compact={true}
                            showLink={false}
                            icon={<Users size={28} />}
                            title="Customer First"
                            description="We explain everything in plain English, ensuring you understand your property's potential."
                        />
                        <ServiceCard
                            compact={true}
                            showLink={false}
                            icon={<Globe size={28} />}
                            title="Sustainability"
                            description="Every recommendation we make is aimed at long-term environmental and financial savings."
                        />
                    </div>
                </div>
            </section>

            {/* 6. CTA SECTION */}
            <section className="py-24 bg-[#007F00] text-white">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-4xl font-serif font-bold mb-6">Join thousands of satisfied clients</h2>
                    <p className="text-green-100 text-lg mb-10 max-w-2xl mx-auto">
                        Ready to improve your energy rating and save on bills? Get in touch today for a free consultation.
                    </p>
                    <Link to="/contact">
                        <button className="bg-[#9ACD32] text-green-900 font-bold px-10 py-4 rounded-full hover:bg-lime-400 transition shadow-lg flex items-center gap-2 mx-auto">
                            Get Started <ArrowRight size={20} />
                        </button>
                    </Link>
                </div>
            </section>
        </div>
    );
};

// --- SUBCOMPONENTS ---

const TeamMember = ({ name, role }: { name: string, role: string }) => (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 text-center hover:shadow-lg transition">
        <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center text-gray-400">
            <Users size={32} />
        </div>
        <h3 className="font-bold text-lg text-gray-900">{name}</h3>
        <p className="text-[#007F00] text-xs font-bold uppercase tracking-wide">{role}</p>
    </div>
);

const TimelineItem = ({ year, title, desc, align }: { year: string, title: string, desc: string, align: 'left' | 'right' }) => (
    <div className={`md:flex items-center justify-between ${align === 'right' ? 'flex-row-reverse' : ''}`}>
        <div className="hidden md:block w-5/12"></div>
        <div className="w-full md:w-2/12 flex justify-center mb-4 md:mb-0">
            <div className="w-12 h-12 bg-[#9ACD32] text-green-900 rounded-full flex items-center justify-center font-bold text-sm shadow-md z-10">
                {year}
            </div>
        </div>
        <div className={`w-full md:w-5/12 text-center ${align === 'left' ? 'md:text-left' : 'md:text-right'}`}>
            <h3 className="font-bold text-xl text-gray-900">{title}</h3>
            <p className="text-gray-600">{desc}</p>
        </div>
    </div>
);

export default About;
