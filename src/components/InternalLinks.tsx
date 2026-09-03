import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, BookOpen, HelpCircle, Info, Mail, Search, Zap, Tag, UserCheck } from 'lucide-react';
import { getTenantFromDomain } from '../lib/tenant';

interface Props {
    page: 'about' | 'locations' | 'blog' | 'blogDetail' | 'faq' | 'contact' | 'home' | 'catalogue' | 'services' | 'pricing' | 'hireAgent';
}

const InternalLinks = ({ page }: Props) => {
    const tenant = getTenantFromDomain();
    const isSpanish = tenant === 'spain';
    const isEngland = tenant === 'england';
    const isPortugal = tenant === 'portugal';
    const isFrance = tenant === 'france';

    const labels = isSpanish ? {
        heading: 'Enlaces Útiles',
        home: 'Inicio',
        about: 'Sobre Nosotros',
        services: 'Servicios',
        pricing: 'Precios',
        locations: 'Ubicaciones',
        blog: 'Blog',
        faq: 'Preguntas Frecuentes',
        contact: 'Contacto',
        catalogue: 'Directorio',
        hireAgent: 'Asesor Energético',
        getQuote: 'Solicitar Presupuesto',
    } : isPortugal ? {
        heading: 'Links Úteis',
        home: 'Início',
        about: 'Sobre Nós',
        services: 'Serviços',
        pricing: 'Preços',
        locations: 'Localizações',
        blog: 'Blog',
        faq: 'FAQ',
        contact: 'Contacto',
        catalogue: 'Catálogo',
        hireAgent: 'Consultor Energético',
        getQuote: 'Pedir Orçamento',
    } : isFrance ? {
        heading: 'Liens Utiles',
        home: 'Accueil',
        about: 'À Propos',
        services: 'Services',
        pricing: 'Tarifs',
        locations: 'Localisation',
        blog: 'Blog',
        faq: 'FAQ',
        contact: 'Contact',
        catalogue: 'Annuaire',
        hireAgent: 'Conseiller Énergétique',
        getQuote: 'Demander un Devis',
    } : isEngland ? {
        heading: 'Useful Links',
        home: 'Home',
        about: 'About Us',
        services: 'Services',
        pricing: 'Pricing',
        locations: 'Locations',
        blog: 'Blog',
        faq: 'FAQ',
        contact: 'Contact',
        catalogue: 'Find Assessors',
        hireAgent: 'Energy Advisor',
        getQuote: 'Get a Free Quote',
    } : {
        heading: 'Useful Links',
        home: 'Home',
        about: 'About Us',
        services: 'Services',
        pricing: 'Pricing',
        locations: 'Locations',
        blog: 'Blog',
        faq: 'FAQ',
        contact: 'Contact',
        catalogue: 'Find Assessors',
        hireAgent: 'Energy Advisor',
        getQuote: 'Get a Free Quote',
    };

    const faqPath = isEngland ? '/epc-faq' : '/faq/';
    const aboutPath = '/about-us';
    const contactPath = '/contact-us';
    const cataloguePath = '/catalogue';
    const hireAgentPath = '/hire-agent';

    const allLinks = [
        { label: labels.home, path: '/', icon: <Info size={16} /> },
        { label: labels.about, path: aboutPath, icon: <Info size={16} /> },
        { label: labels.services, path: '/services', icon: <Zap size={16} /> },
        { label: labels.pricing, path: '/pricing', icon: <Tag size={16} /> },
        { label: labels.catalogue, path: cataloguePath, icon: <Search size={16} /> },
        { label: labels.hireAgent, path: hireAgentPath, icon: <UserCheck size={16} /> },
        { label: labels.locations, path: '/locations', icon: <MapPin size={16} /> },
        { label: labels.blog, path: '/blog', icon: <BookOpen size={16} /> },
        { label: labels.faq, path: faqPath, icon: <HelpCircle size={16} /> },
        { label: labels.contact, path: contactPath, icon: <Mail size={16} /> },
        { label: labels.getQuote, path: '/get-quote', icon: <ArrowRight size={16} /> },
    ];

    const pageToPath: Record<string, string> = {
        home: '/',
        about: aboutPath,
        services: '/services',
        pricing: '/pricing',
        catalogue: cataloguePath,
        hireAgent: hireAgentPath,
        locations: '/locations',
        blog: '/blog',
        blogDetail: '/blog',
        faq: faqPath,
        contact: contactPath,
    };

    const currentPath = pageToPath[page] || page;
    const links = allLinks.filter(l => l.path !== currentPath);

    return (
        <nav className="border-t border-gray-100 bg-gray-50/50 py-8 mt-8" aria-label="Internal navigation">
            <div className="container mx-auto px-6 max-w-5xl">
                <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 text-center">{labels.heading}</h2>
                <div className="flex flex-wrap justify-center gap-2">
                    {links.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 rounded-full text-xs font-bold text-gray-600 hover:text-[#007F00] hover:border-[#007F00]/30 transition-all"
                        >
                            {link.icon}
                            {link.label}
                        </Link>
                    ))}
                </div>
            </div>
        </nav>
    );
};

export default InternalLinks;
