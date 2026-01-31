
import { ArrowRight, Zap, Thermometer, Sun, Wind, Droplets } from 'lucide-react';
import { Link } from 'react-router-dom';

const CATEGORIES = [
    {
        title: 'Insulation',
        description: 'Keep your home warm and reduce heat loss with attic, wall, and floor insulation.',
        icon: <Thermometer size={32} className="text-[#007F00]" />,
        items: ['Attic Insulation', 'External Wall Insulation', 'Internal Dry Lining', 'Cavity Wall Insulation']
    },
    {
        title: 'Heat Pumps',
        description: 'Transition to sustainable heating with Air-to-Water or Ground Source heat pumps.',
        icon: <Zap size={32} className="text-[#007F00]" />,
        items: ['Air to Water Pumps', 'Ground Source Pumps', 'Heat Pump Servicing', 'Underfloor Heating']
    },
    {
        title: 'Solar Energy',
        description: 'Generate your own electricity and hot water with solar PV and thermal panels.',
        icon: <Sun size={32} className="text-[#007F00]" />,
        items: ['Solar PV Panels', 'Battery Storage', 'Solar Thermal', 'Smart EV Charging']
    },
    {
        title: 'Ventilation',
        description: 'Improve air quality and prevent damp with modern ventilation systems.',
        icon: <Wind size={32} className="text-[#007F00]" />,
        items: ['Mechanical Ventilation', 'Extract Fans', 'Air Filtration', 'Humidity Control']
    },
    {
        title: 'Windows & Doors',
        description: 'High-performance glazing to eliminate draughts and improve security.',
        icon: <Droplets size={32} className="text-[#007F00]" />, // Using droplets for seal/weather theme
        items: ['Triple Glazing', 'Double Glazing', 'Composite Doors', 'A-Rated Frames']
    }
];

const Catalogue = () => {
    return (
        <div className="font-sans text-gray-900 bg-white min-h-screen">
            <title>Home Energy Upgrade Catalogue ⭐ | The Berman</title>

            {/* HERO SECTION */}
            <section className="pt-32 pb-20 bg-gradient-to-b from-green-50 to-white">
                <div className="container mx-auto px-6 text-center max-w-4xl">
                    <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-[#9ACD32] text-green-900 text-xs font-bold tracking-wide uppercase">
                        The Berman ⭐
                    </div>
                    <h1 className="text-5xl md:text-6xl font-serif font-bold text-gray-900 mb-6 leading-tight">
                        Home Energy Upgrade <br /> <span className="text-[#007F00]">Catalogue.</span>
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                        Explore the best solutions for a warmer, more efficient home. We help you navigate grants, installers, and the latest technology.
                    </p>
                </div>
            </section>

            {/* CATALOGUE GRID */}
            <section className="pb-24">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {CATEGORIES.map((category, idx) => (
                            <div key={idx} className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:border-[#9ACD32] transition-all group flex flex-col">
                                <div className="bg-green-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#9ACD32]/20 transition-colors">
                                    {category.icon}
                                </div>
                                <h3 className="text-2xl font-serif font-bold mb-4">{category.title}</h3>
                                <p className="text-gray-600 mb-6 text-sm flex-grow leading-relaxed">
                                    {category.description}
                                </p>
                                <ul className="space-y-2 mb-8">
                                    {category.items.map((item, i) => (
                                        <li key={i} className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                                            <div className="w-1.5 h-1.5 bg-[#9ACD32] rounded-full"></div>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                                <Link to="/contact">
                                    <button className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gray-50 group-hover:bg-[#007F00] group-hover:text-white transition-all font-bold text-sm">
                                        Enquire Now <ArrowRight size={16} />
                                    </button>
                                </Link>
                            </div>
                        ))}

                        {/* Special "Can't find what you need?" Card */}
                        <div className="bg-[#007F00] rounded-3xl p-8 shadow-xl text-white md:col-span-2 lg:col-span-1 flex flex-col justify-between">
                            <div>
                                <h3 className="text-3xl font-serif font-bold mb-6">Need a Custom Consultation?</h3>
                                <p className="text-green-100 mb-8 leading-relaxed">
                                    Our experts can help you design a complete energy upgrade plan tailored to your specific budget and property goals.
                                </p>
                            </div>
                            <div className="space-y-4">
                                <div className="border-t border-green-700 pt-6">
                                    <p className="text-xs font-bold uppercase tracking-widest text-[#9ACD32] mb-1">Call Our Advisory Team</p>
                                    <p className="text-2xl font-bold">087 442 1653</p>
                                </div>
                                <Link to="/contact">
                                    <button className="w-full bg-white text-[#007F00] py-4 rounded-xl font-bold transition shadow-lg hover:bg-green-50">
                                        Book Assessment
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA SECTION */}
            <section className="py-20 bg-gray-50 border-t border-gray-100">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-3xl font-serif font-bold mb-4">Ready to start your upgrade?</h2>
                    <p className="text-gray-600 mb-10 max-w-xl mx-auto">
                        Join thousands of homeowners who have significantly reduced their energy bills with our help.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/contact">
                            <button className="bg-[#007F00] text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:bg-green-800 transition">
                                Get Free Quote
                            </button>
                        </Link>
                        <Link to="/pricing">
                            <button className="bg-white border border-gray-200 text-gray-700 px-8 py-4 rounded-xl font-bold hover:border-gray-400 transition">
                                View Pricing
                            </button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Catalogue;
