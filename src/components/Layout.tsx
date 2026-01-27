
import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Menu, X, ArrowRight, Home, Smartphone, Mail } from 'lucide-react';

const NAV_LINKS = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Services', path: '/services' },
    { label: 'Pricing', path: '/pricing' },
    { label: 'Contact', path: '/contact' },
];

const Layout = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const closeMenu = () => setIsMenuOpen(false);

    return (
        <div className="flex flex-col min-h-screen font-sans">
            {/* HEADER */}
            <header className="fixed w-full top-0 z-50 bg-[#007F00] backdrop-blur-md border-b border-green-700 shadow-sm transition-all duration-300">
                <div className="container mx-auto px-6 h-20 flex justify-between items-center">

                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group  " onClick={closeMenu}>
                        <div className="relative">
                            <img src="/logo.svg" alt="The Berman Logo" className="h-18 w-auto relative z-10 brightness-0 invert" />
                        </div>
                        <span className="text-2xl font-serif font-bold text-white group-hover:text-green-200 transition-colors">
                            The Berman
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        {NAV_LINKS.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`text-sm font-bold tracking-wide transition-colors ${location.pathname === link.path
                                    ? 'text-white border-b-2 border-white'
                                    : 'text-green-100 hover:text-white'
                                    }`}
                            >
                                {link.label.toUpperCase()}
                            </Link>
                        ))}

                        <Link to="/contact">
                            <button className="bg-white hover:bg-green-50 text-[#007F00] text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-full transition shadow-md flex items-center gap-2">
                                Book Now <ArrowRight size={14} />
                            </button>
                        </Link>
                    </nav>

                    {/* Mobile Menu Button */}
                    <button className="md:hidden p-2 text-white hover:text-green-200 transition" onClick={toggleMenu}>
                        {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>

                {/* Mobile Navigation Dropdown */}
                {isMenuOpen && (
                    <nav className="md:hidden bg-[#007F00] border-t border-green-700 flex flex-col p-6 shadow-lg absolute w-full h-screen animate-fade-in-up">
                        <div className="flex flex-col gap-6 text-center">
                            {NAV_LINKS.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={closeMenu}
                                    className={`text-xl font-serif font-bold ${location.pathname === link.path
                                        ? 'text-white'
                                        : 'text-green-100'
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <Link to="/contact" onClick={closeMenu}>
                                <button className="w-full bg-white text-[#007F00] font-bold py-4 rounded-xl mt-4">
                                    Get a Free Quote
                                </button>
                            </Link>
                        </div>
                    </nav>
                )}
            </header>

            {/* MAIN CONTENT */}
            <main className="flex-grow">
                <Outlet />
            </main>

            {/* FOOTER */}
            <footer className="bg-gray-900 text-white border-t border-green-900 pt-16 pb-8">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-4 gap-12 mb-12">

                        {/* Brand Column */}
                        <div className="col-span-1 md:col-span-1">
                            <div className="flex items-center gap-2 mb-6">
                                <img src="logo.svg" alt="The Berman" className="h-16" />
                                <span className="text-xl font-serif font-bold">The Berman</span>
                            </div>
                            <p className="text-gray-400 text-sm leading-relaxed mb-6">
                                Ireland's trusted partner for BER assessments and energy consulting. We make sustainability simple and profitable.
                            </p>
                            <div className="flex gap-4">
                                {/* Social Placeholders */}
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#9ACD32] hover:text-green-900 transition cursor-pointer"><Smartphone size={16} /></div>
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#9ACD32] hover:text-green-900 transition cursor-pointer"><Mail size={16} /></div>
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#9ACD32] hover:text-green-900 transition cursor-pointer"><Home size={16} /></div>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h4 className="text-sm font-bold uppercase tracking-wider text-[#9ACD32] mb-6">Quick Links</h4>
                            <ul className="space-y-3">
                                {NAV_LINKS.map(link => (
                                    <li key={link.path}>
                                        <Link to={link.path} className="text-gray-400 hover:text-white transition text-sm flex items-center gap-2">
                                            <div className="w-1 h-1 bg-[#9ACD32] rounded-full"></div> {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>



                        {/* Contact */}
                        <div>
                            <h4 className="text-sm font-bold uppercase tracking-wider text-[#9ACD32] mb-6">Get in Touch</h4>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3 text-gray-400 text-sm">
                                    <Smartphone className="text-[#9ACD32] mt-0.5" size={16} />
                                    <a href="tel:0874421653" className="hover:text-white transition">087 442 1653</a>
                                </li>
                                <li className="flex items-start gap-3 text-gray-400 text-sm">
                                    <Mail className="text-[#9ACD32] mt-0.5" size={16} />
                                    <a href="mailto:hello@theberman.eu" className="hover:text-white transition">hello@theberman.eu</a>
                                </li>
                                <li className="flex items-start gap-3 text-gray-400 text-sm">
                                    <Home className="text-[#9ACD32] mt-0.5" size={16} />
                                    <span>Dublin 4, Ireland</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
                        <p>&copy; {new Date().getFullYear()} The Berman. All rights reserved.</p>
                        <div className="flex gap-6 mt-4 md:mt-0">
                            <span className="hover:text-white cursor-pointer transition">Privacy Policy</span>
                            <span className="hover:text-white cursor-pointer transition">Terms of Service</span>
                            <Link to="/admin" className="hover:text-white cursor-pointer transition">Admin Login</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
