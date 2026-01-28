import {
    ArrowRight, CheckCircle, CheckCircle2, Home, Star, Clock,
    Zap, ShieldCheck, Building2, Phone, Award, TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';

import ProcessCircle from '../components/ProcessCircle';
import StatItem from '../components/StatItem';
import ServiceCard from '../components/ServiceCard';
import TestimonialCard from '../components/TestimonialCard';

const HomePage = () => {

    return (
        <div className="font-sans text-gray-900">
            <title>Home | Berman Building Energy Ratings</title>
            <meta name="description" content="Professional BER assessments in Dublin and surrounding counties. Fast, accurate, and SEAI registered. Book your Building Energy Rating today." />
            {/* 1. HERO SECTION */}
            <section className="relative pt-32 pb-20 lg:pt-24   lg:pb-28 overflow-hidden bg-gradient-to-br from-green-50 via-white to-green-50/30 px-10">

                {/* Background Decor (Blur Blobs) - Fixed positioning */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-200/40 rounded-full blur-3xl opacity-50 pointer-events-none -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-lime-200/40 rounded-full blur-3xl opacity-50 pointer-events-none translate-y-1/2 -translate-x-1/2" />

                <div className="container mx-auto px-6 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

                        {/* 1. LEFT CONTENT (Text) */}
                        <div className="text-center lg:text-left">

                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-white border border-green-100 shadow-sm text-[#007F00] text-xs font-bold tracking-wide uppercase">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#9ACD32]"></span>
                                </span>
                                WELCOME
                            </div>

                            {/* Headline */}
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-gray-900 mb-6 leading-tight">
                                Empowering Energy <br /> Efficiency with <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#007F00] to-[#9ACD32]">
                                    Trusted BER Certification
                                </span>
                            </h1>

                            {/* Subheading */}
                            <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-lg mx-auto lg:mx-0">
                                Your trusted partner for accurate Domestic & Commercial BER Certification. We provide safe, reliable, and efficient services to reduce your carbon footprint and energy bills.
                            </p>

                            {/* CTA Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                <Link to="/contact" className="w-full sm:w-auto">
                                    <button className="w-full bg-[#007F00] text-white font-bold px-8 py-4 rounded-full hover:bg-green-800 transition shadow-lg hover:shadow-green-900/20 flex items-center justify-center gap-2 group">
                                        Get a Quote
                                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </Link>
                                <Link to="/services" className="w-full sm:w-auto">
                                    <button className="w-full bg-white border border-gray-200 text-gray-700 font-bold px-8 py-4 rounded-full hover:border-[#007F00] hover:text-[#007F00] transition">
                                        Our Services
                                    </button>
                                </Link>
                            </div>

                            {/* Trust Badges */}
                            <div className="mt-10 flex items-center justify-center lg:justify-start gap-6 text-sm font-medium text-gray-500">
                                <div className="flex items-center gap-2">
                                    <CheckCircle size={18} className="text-[#9ACD32]" /> Fully Insured
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle size={18} className="text-[#9ACD32]" /> SEAI Registered
                                </div>
                            </div>
                        </div>

                        {/* 2. RIGHT IMAGE (Visual Area) */}
                        <div className="relative mx-auto w-full max-w-lg lg:max-w-none">

                            {/* Main Image Container */}
                            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-gray-100 aspect-square md:aspect-[4/3]">
                                {/* Placeholder Image - Using a reliable color block service if real image fails */}
                                <img
                                    src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                                    alt="Modern Eco House"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://placehold.co/800x600/e2e8f0/007F00?text=Hero+Image'; // Fallback
                                    }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                            </div>

                            {/* Floating Card 1: BER Rating (Bottom Left) */}
                            <div className="absolute top-[60%] -left-6 md:-left-12 bg-white p-4 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 flex items-center gap-4 animate-bounce-slow z-20">
                                <div className="bg-green-100 p-3 rounded-full text-[#007F00]">
                                    <Zap size={24} fill="currentColor" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Energy Rating</p>
                                    <p className="text-xl font-bold text-gray-900 leading-none">A-Rated</p>
                                </div>
                            </div>

                            {/* Floating Card 2: Happy Clients (Top Right) */}
                            <div className="hidden md:flex absolute top-8 -right-8 bg-white p-3 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 items-center gap-3 z-20 animate-pulse-slow">
                                <div className="flex -space-x-3">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center overflow-hidden">
                                            <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="Client" />
                                        </div>
                                    ))}
                                    <div className="w-8 h-8 rounded-full bg-[#007F00] border-2 border-white text-white flex items-center justify-center text-xs font-bold">+2k</div>
                                </div>
                                <div className="flex flex-col">
                                    <div className="flex text-yellow-400">
                                        {[1, 2, 3, 4, 5].map(s => <Star key={s} size={10} fill="currentColor" />)}
                                    </div>
                                    <span className="text-xs font-bold text-gray-700">Happy Clients</span>
                                </div>
                            </div>

                        </div>

                    </div>
                </div>

                {/* Animation Styles */}
                <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 4s infinite ease-in-out;
        }
      `}</style>
            </section>

            {/* 2. STATS SECTION */}
            <section className="py-16 bg-[#007F00] text-white overflow-hidden relative">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
                        <StatItem
                            number="10k+"
                            label="Audits Completed"
                            icon={<CheckCircle2 size={24} className="text-[#007F00]" />}
                        />
                        <StatItem
                            number="15+"
                            label="Years Experience"
                            icon={<Clock size={24} className="text-[#007F00]" />}
                        />
                        <StatItem
                            number="100%"
                            label="SEAI Certified"
                            icon={<ShieldCheck size={24} className="text-[#007F00]" />}
                        />
                        <StatItem
                            number="4.9"
                            label="Customer Rating"
                            icon={<Star size={24} className="text-[#007F00]" />}
                        />
                    </div>
                </div>
            </section>

            {/* 3. SERVICES PREVIEW */}
            <section id="services" className="py-24 bg-gray-50 relative overflow-hidden">
                {/* Decorative Blobs */}
                <div className="absolute top-0 left-0 -ml-20 -mt-20 w-96 h-96 bg-[#9ACD32]/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-0 -mr-20 -mb-20 w-96 h-96 bg-[#007F00]/10 rounded-full blur-3xl"></div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="text-center mb-16">
                        <span className="text-[#007F00] font-bold uppercase tracking-widest text-sm mb-2 block">Our Services</span>
                        <h2 className="text-4xl font-serif font-bold text-gray-900 mb-6">Domestic & Commercial BERs</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                            Registering a property for sale or rent? We provide fast, accurate, and SEAI-registered assessments to help you move forward.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <ServiceCard
                            icon={<Home size={32} />}
                            title="Domestic BER"
                            description="Fast turnaround for verified domestic ratings. Essential for selling or renting your home."
                        />
                        <ServiceCard
                            icon={<Building2 size={32} />}
                            title="Commercial BER"
                            description="Expert assessments for retail, office, and industrial units. Ensure compliance and improve efficiency."
                        />
                        <ServiceCard
                            icon={<Zap size={32} />}
                            title="Energy Efficiency"
                            description="Tailored advice on retrofitting, grant applications, and sustainable upgrades."
                        />
                    </div>
                </div>
            </section>

            {/* 4. BANNER AND PROCESS */}
            <section className="relative py-24 bg-gray-900 text-center overflow-hidden">
                <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-[#007F00]/90 to-black/80"></div>
                <div className="container mx-auto px-6 relative z-10">
                    <div className="inline-block mb-6 px-4 py-1 rounded-full bg-[#9ACD32] text-green-900 text-xs font-bold uppercase tracking-wider">
                        The Berman Promise
                    </div>
                    <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">
                        Expert BER Assessments That <br /> Add Long-Term Value
                    </h2>
                    <p className="text-xl text-green-100 max-w-2xl mx-auto mb-10 leading-relaxed">
                        We go beyond the rating. Our experts identify the most cost-effective ways to improve your property's energy performance.
                    </p>
                </div>
            </section>

            <section className="py-24 bg-white overflow-hidden">
                <div className="container mx-auto px-6 text-center">
                    <div className="mb-20">
                        <p className="text-[#007F00] font-bold uppercase tracking-widest text-sm mb-2">Our Work Process</p>
                        <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900">
                            The BER Certification Journey <br />
                            <span className="text-[#007F00] mt-2 block">With THE BER MAN</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 relative max-w-6xl mx-auto">
                        {/* Dotted Line */}
                        <div className="hidden md:block absolute top-[3.5rem] left-[10%] right-[10%] h-1 border-t-2 border-dashed border-[#9ACD32]/50 -z-0"></div>

                        <ProcessCircle icon={<Phone size={32} />} title="Consultation" step="1" />
                        <ProcessCircle icon={<Home size={32} />} title="Assessment" step="2" />
                        <ProcessCircle icon={<Award size={32} />} title="Certification" step="3" />
                        <ProcessCircle icon={<TrendingUp size={32} />} title="Recommendations" step="4" />
                    </div>
                </div>
            </section>

            {/* 5. TESTIMONIALS (New) */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-serif font-bold text-center mb-16">Trusted by Homeowners</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <TestimonialCard
                            quote="The team was professional, fast, and explained everything clearly. Highly recommend!"
                            author="Michael Byrne"
                            location="Dublin"
                        />
                        <TestimonialCard
                            quote="We needed a commercial BER urgently for a lease. The Berman delivered in 24 hours."
                            author="Sarah O'Toole"
                            location="Cork"
                        />
                        <TestimonialCard
                            quote="Great advice on how to improve our rating before selling. Added real value to our home."
                            author="James Murphy"
                            location="Galway"
                        />
                    </div>
                </div>
            </section>

            {/* 6. FAQ PREVIEW (New) */}
            <section className="py-24 bg-[#007F00] text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-white/5 blur-3xl"></div>
                <div className="container mx-auto px-6 grid md:grid-cols-2 gap-16 items-center relative z-10">
                    <div>
                        <h2 className="text-4xl font-serif font-bold mb-6">Common Questions</h2>
                        <p className="text-green-100 text-lg mb-8">
                            Understanding Building Energy Ratings doesn't have to be confusing.
                        </p>
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="mt-1"><CheckCircle2 className="text-[#9ACD32]" /></div>
                                <div>
                                    <h4 className="font-bold text-lg">What is a BER?</h4>
                                    <p className="text-green-100/80 text-sm mt-1">It's a label that says how energy-efficient your home is, rated from A to G.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="mt-1"><CheckCircle2 className="text-[#9ACD32]" /></div>
                                <div>
                                    <h4 className="font-bold text-lg">Who needs one?</h4>
                                    <p className="text-green-100/80 text-sm mt-1">Anyone selling or renting a property, or applying for SEAI grants.</p>
                                </div>
                            </div>
                        </div>
                        <Link to="/services">
                            <button className="mt-10 text-white font-bold border-b-2 border-[#9ACD32] pb-1 hover:text-[#9ACD32] transition">
                                View all FAQs <ArrowRight className="inline ml-1" size={16} />
                            </button>
                        </Link>
                    </div>

                    {/* CTA Box */}
                    <div className="bg-white text-gray-900 p-8 rounded-2xl shadow-2xl transform md:rotate-2 hover:rotate-0 transition duration-500">
                        <h3 className="text-2xl font-bold font-serif mb-4">Ready to book?</h3>
                        <p className="text-gray-600 mb-8">
                            Get your quote today and start your journey to a warmer, more efficient home.
                        </p>
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-[#007F00]">
                                <Phone size={24} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase">Call us</p>
                                <p className="font-bold text-xl">087 442 1653</p>
                            </div>
                        </div>
                        <Link to="/contact">
                            <button className="w-full bg-[#9ACD32] hover:bg-lime-400 text-green-900 font-bold py-4 rounded-xl transition shadow-lg">
                                Online Quote Form
                            </button>
                        </Link>
                    </div>
                </div>
            </section>

        </div >
    );
};

export default HomePage;
