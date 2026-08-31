
import { ArrowRight, X, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import InternalLinks from '../components/InternalLinks';

import { useAuth } from '../hooks/useAuth';
import { getTenantFromDomain } from '../lib/tenant';

const Pricing = () => {
    const { profile } = useAuth();
    const tenant = getTenantFromDomain();
    const isManualActive = profile?.stripe_payment_id === 'MANUAL_BY_ADMIN';
    const isEngland = tenant === 'england';
    const isSpanish = tenant === 'spain';
    const isFrance = tenant === 'france';
    const isPortugal = tenant === 'portugal';
    const currencySymbol = isEngland ? '£' : '€';
    const baseUrl = tenant === 'england' ? 'https://www.epccert.com' : isSpanish ? 'https://www.xn--certificadoenergtico-q2b.eu' : tenant === 'france' ? 'https://www.dpecert.fr' : tenant === 'portugal' ? 'https://www.certificadoenergia.com' : 'https://www.theberman.eu';
    const brand = isSpanish ? 'Certificado Energético' : isEngland ? 'EPC Cert' : isFrance ? 'DPE Cert France' : isPortugal ? 'Certificado Energético' : 'The Berman';

    const tr = isEngland ? {
        badge: 'Pricing', heroTitle1: 'Transparent', heroTitle2: 'Rates.',
        heroDesc: 'Choose the plan that fits your property type. No hidden fees, all assessments handled by registered experts.',
        manual: 'Your account is currently active under a manual administrator activation. You have full access to all features.',
        apartmentTitle: 'Apartment / Flat', apartmentDesc: 'Ideal for 1-2 bed self-contained units or duplexes.',
        apartmentFeatures: ['Full registered assessment', 'Advisory Report included', 'Cert published within 48h', 'VAT Included'],
        houseTitle: 'Standard House', houseDesc: 'For 3-4 bed semi-detached or terraced homes.',
        houseFeatures: ['Full registered assessment', 'Advisory Report included', 'Cert published within 48h', 'Grant eligibility check', 'VAT Included'],
        commercialTitle: 'Commercial', commercialDesc: 'For offices, retail units, and industrial buildings.',
        commercialFeatures: ['Non-Domestic Assessment', 'Detailed technical survey', 'Compliance Certification', 'Portfolio management', 'VAT Included'],
        custom: 'Custom', mostPopular: 'Most Popular', perUnit: '/unit', bookNow: 'Book Now', requestQuote: 'Request Quote',
        compareTitle: 'Compare Features', compareSubtitle: 'Detail-oriented services',
        feature: 'Feature', standard: 'Standard', premium: 'Premium',
        tableFeatures: ['Official Cert', 'Advisory Report', 'Grant Advice', 'Heat Loss Survey', 'Retrofit ROI Calc', 'Solar PV Simulation'],
        ctaTitle: 'Need a custom quote?', ctaDesc: 'For large portfolios or specialized industrial units, our team can provide a tailored proposal.', ctaButton: 'Contact Sales'
    } : isSpanish ? {
        badge: 'Precios', heroTitle1: 'Tarifas', heroTitle2: 'Transparentes.',
        heroDesc: 'Elija el plan que se ajusta a su tipo de propiedad. Sin tarifas ocultas, todas las valoraciones son realizadas por técnicos acreditados.',
        manual: 'Su cuenta está activa manualmente por un administrador. Tiene acceso completo a todas las funciones.',
        apartmentTitle: 'Piso / Apartamento', apartmentDesc: 'Ideal para unidades independientes de 1-2 habitaciones o dúplex.',
        apartmentFeatures: ['Valoración completa registrada', 'Informe asesor incluido', 'Certificado publicado en 48h', 'IVA incluido'],
        houseTitle: 'Vivienda estándar', houseDesc: 'Para casas adosadas o pareadas de 3-4 habitaciones.',
        houseFeatures: ['Valoración completa registrada', 'Informe asesor incluido', 'Certificado publicado en 48h', 'Comprobación de subvenciones', 'IVA incluido'],
        commercialTitle: 'Comercial', commercialDesc: 'Para oficinas, locales comerciales e industriales.',
        commercialFeatures: ['Valoración no doméstica (CEE)', 'Estudio técnico detallado', 'Certificación de cumplimiento', 'Gestión de carteras', 'IVA incluido'],
        custom: 'Personalizado', mostPopular: 'Más popular', perUnit: '/unidad', bookNow: 'Reservar', requestQuote: 'Solicitar presupuesto',
        compareTitle: 'Comparar características', compareSubtitle: 'Servicios detallados',
        feature: 'Característica', standard: 'Estándar', premium: 'Premium',
        tableFeatures: ['Certificado oficial', 'Informe asesor', 'Asesoría de subvenciones', 'Estudio de pérdidas de calor', 'Cálculo de retorno de inversión', 'Simulación fotovoltaica'],
        ctaTitle: '¿Necesita un presupuesto personalizado?', ctaDesc: 'Para grandes carteras o unidades industriales especializadas, nuestro equipo puede proporcionarle una propuesta a medida.', ctaButton: 'Contactar con ventas'
    } : isFrance ? {
        badge: 'Tarifs', heroTitle1: 'Tarifs', heroTitle2: 'Transparents.',
        heroDesc: 'Choisissez le forfait adapté à votre type de bien. Pas de frais cachés, tous les diagnostics sont réalisés par des experts certifiés.',
        manual: 'Votre compte est actuellement actif sous une activation manuelle de l\'administrateur. Vous avez accès à toutes les fonctionnalités.',
        apartmentTitle: 'Appartement', apartmentDesc: 'Idéal pour les logements indépendants de 1-2 chambres ou les duplex.',
        apartmentFeatures: ['Diagnostic complet certifié', 'Rapport conseil inclus', 'Certificat publié sous 48h', 'TVA incluse'],
        houseTitle: 'Maison standard', houseDesc: 'Pour les maisons mitoyennes ou jumelées de 3-4 chambres.',
        houseFeatures: ['Diagnostic complet certifié', 'Rapport conseil inclus', 'Certificat publié sous 48h', 'Vérification des aides', 'TVA incluse'],
        commercialTitle: 'Commercial', commercialDesc: 'Pour bureaux, commerces et locaux industriels.',
        commercialFeatures: ['Diagnostic non résidentiel', 'Étude technique détaillée', 'Certification de conformité', 'Gestion de parc', 'TVA incluse'],
        custom: 'Sur mesure', mostPopular: 'Le plus populaire', perUnit: '/unité', bookNow: 'Réserver', requestQuote: 'Demander un devis',
        compareTitle: 'Comparer les prestations', compareSubtitle: 'Services détaillés',
        feature: 'Prestation', standard: 'Standard', premium: 'Premium',
        tableFeatures: ['Certificat officiel', 'Rapport conseil', 'Conseil aides', 'Étude des déperditions', 'Calcul retour investissement', 'Simulation photovoltaïque'],
        ctaTitle: 'Besoin d\'un devis personnalisé ?', ctaDesc: 'Pour les grands parcs immobiliers ou les unités industrielles spécialisées, notre équipe peut vous préparer une proposition sur mesure.', ctaButton: 'Contacter les ventes'
    } : isPortugal ? {
        badge: 'Preços', heroTitle1: 'Preços', heroTitle2: 'Transparentes.',
        heroDesc: 'Escolha o plano adequado ao seu tipo de propriedade. Sem taxas ocultas, todas as avaliações são efetuadas por técnicos acreditados.',
        manual: 'A sua conta está atualmente ativa mediante ativação manual de um administrador. Tem acesso total a todas as funcionalidades.',
        apartmentTitle: 'Apartamento', apartmentDesc: 'Ideal para unidades independentes de 1-2 quartos ou duplex.',
        apartmentFeatures: ['Avaliação completa acreditada', 'Relatório de aconselhamento incluído', 'Certificado publicado em 48h', 'IVA incluído'],
        houseTitle: 'Moradia padrão', houseDesc: 'Para moradias geminadas ou em banda de 3-4 quartos.',
        houseFeatures: ['Avaliação completa acreditada', 'Relatório de aconselhamento incluído', 'Certificado publicado em 48h', 'Verificação de subsídios', 'IVA incluído'],
        commercialTitle: 'Comercial', commercialDesc: 'Para escritórios, lojas e edifícios industriais.',
        commercialFeatures: ['Avaliação não residencial', 'Estudo técnico detalhado', 'Certificação de conformidade', 'Gestão de carteiras', 'IVA incluído'],
        custom: 'Personalizado', mostPopular: 'Mais popular', perUnit: '/unidade', bookNow: 'Reservar', requestQuote: 'Pedir orçamento',
        compareTitle: 'Comparar funcionalidades', compareSubtitle: 'Serviços detalhados',
        feature: 'Funcionalidade', standard: 'Standard', premium: 'Premium',
        tableFeatures: ['Certificado oficial', 'Relatório de aconselhamento', 'Aconselhamento de subsídios', 'Estudo de perdas de calor', 'Cálculo de retorno do investimento', 'Simulação fotovoltaica'],
        ctaTitle: 'Precisa de um orçamento personalizado?', ctaDesc: 'Para grandes carteiras ou unidades industriais especializadas, a nossa equipa pode elaborar uma proposta à medida.', ctaButton: 'Contactar vendas'
    } : {
        badge: 'Pricing', heroTitle1: 'Transparent', heroTitle2: 'Rates.',
        heroDesc: 'Choose the plan that fits your property type. No hidden fees, all assessments handled by registered experts.',
        manual: 'Your account is currently active under a manual administrator activation. You have full access to all features.',
        apartmentTitle: 'Apartment / Flat', apartmentDesc: 'Ideal for 1-2 bed self-contained units or duplexes.',
        apartmentFeatures: ['Full registered assessment', 'Advisory Report included', 'Cert published within 48h', 'VAT Included'],
        houseTitle: 'Standard House', houseDesc: 'For 3-4 bed semi-detached or terraced homes.',
        houseFeatures: ['Full registered assessment', 'Advisory Report included', 'Cert published within 48h', 'Grant eligibility check', 'VAT Included'],
        commercialTitle: 'Commercial', commercialDesc: 'For offices, retail units, and industrial buildings.',
        commercialFeatures: ['Non-Domestic Assessment', 'Detailed technical survey', 'Compliance Certification', 'Portfolio management', 'VAT Included'],
        custom: 'Custom', mostPopular: 'Most Popular', perUnit: '/unit', bookNow: 'Book Now', requestQuote: 'Request Quote',
        compareTitle: 'Compare Features', compareSubtitle: 'Detail-oriented services',
        feature: 'Feature', standard: 'Standard', premium: 'Premium',
        tableFeatures: ['Official Cert', 'Advisory Report', 'Grant Advice', 'Heat Loss Survey', 'Retrofit ROI Calc', 'Solar PV Simulation'],
        ctaTitle: 'Need a custom quote?', ctaDesc: 'For large portfolios or specialized industrial units, our team can provide a tailored proposal.', ctaButton: 'Contact Sales'
    };

    return (
        <div className="font-sans text-gray-900 bg-white min-h-screen">
            <SEOHead
                title={isSpanish ? 'Precios - Costes Transparentes de Certificación Energética' : isEngland ? 'EPC Certificate Cost England 2026 | Compare Prices | EPC Cert' : isFrance ? 'Tarifs - Coûts Transparent du DPE' : isPortugal ? 'Preços - Custos Transparentes de Certificação Energética' : 'BER Certificate Cost Ireland 2026 | Compare Prices | The Berman'}
                description={isSpanish ? 'Precios claros y por adelantado para certificados energéticos. Planes para apartamentos, casas y locales comerciales.' : isEngland ? 'View transparent EPC Certificate pricing across England. Compare domestic & commercial costs, book online, and get fast EPCs with no hidden fees.' : isFrance ? 'Tarifs clairs et transparents pour les diagnostics de performance énergétique. Formules pour appartements, maisons et locaux commerciaux.' : isPortugal ? 'Preços claros e transparentes para certificação energética. Planos para apartamentos, casas e espaços comerciais.' : 'How much does a BER certificate cost? Compare BER cert prices from €150, based on property size, from SEAI-registered assessors nationwide.'}
                canonical="/pricing"
                ogTitle={!isSpanish && !isEngland && !isFrance && !isPortugal ? 'BER Cert Cost Ireland | Compare Prices From €150' : isEngland ? 'Affordable EPC Costs Across England | Certificate for EPC' : undefined}
                ogDescription={!isSpanish && !isEngland && !isFrance && !isPortugal ? "Ireland's largest BER platform. Compare quotes from trusted local assessors and book your Building Energy Rating assessment online today." : isEngland ? 'EPC Certificate Pricing | Affordable Domestic, Commercial Costs' : undefined}
                twitterTitle={!isSpanish && !isEngland && !isFrance && !isPortugal ? 'BER Cert Cost Ireland 2026 | From €150' : isEngland ? 'Fast & Affordable EPC Certificates Across England | EPCCert' : undefined}
                twitterDescription={!isSpanish && !isEngland && !isFrance && !isPortugal ? 'Compare BER certificate prices by property size from SEAI-registered assessors across Ireland.' : isEngland ? 'Compare affordable domestic & commercial EPC prices across England. Book certified assessors online with fast turnaround & zero hidden fees.' : undefined}
                skipSiteNameSuffix={!isSpanish && !isFrance && !isPortugal}
                jsonLd={{
                    '@context': 'https://schema.org',
                    '@type': 'Organization',
                    name: brand,
                    url: baseUrl,
                    logo: `${baseUrl}/logo.png`,
                    sameAs: tenant === 'england'
                        ? ['https://www.facebook.com/epccert', 'https://www.instagram.com/epccert']
                        : isSpanish
                            ? ['https://www.facebook.com/certificadoenergetico', 'https://www.instagram.com/certificadoenergetico']
                            : tenant === 'france'
                                ? ['https://www.facebook.com/dpefrance', 'https://www.instagram.com/dpefrance']
                                : tenant === 'portugal'
                                    ? ['https://www.facebook.com/certificadoenergeticopt', 'https://www.instagram.com/certificadoenergeticopt']
                                    : ['https://www.facebook.com/people/The-Berman/61578159843471/', 'https://www.instagram.com/thebermanireland'],
                }}
            />

            {/* 1. COMPACT HERO SECTION */}
            <section className="pt-32 pb-12 bg-white">
                <div className="container mx-auto px-6 text-center max-w-4xl">
                    <span className="inline-block mb-4 px-4 py-1.5 rounded-full bg-green-50 text-[#007F00] text-xs font-black tracking-widest uppercase border border-green-100">
                        {tr.badge}
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 leading-tight">
                        {tr.heroTitle1} <br className="hidden md:block" />
                        <span className="text-[#007F00]">{tr.heroTitle2}</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
                        {isManualActive ? tr.manual : tr.heroDesc}
                    </p>
                </div>
            </section>

            {/* 2. PRICING GRID */}
            <section className="pb-24 bg-white">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="grid md:grid-cols-3 gap-8">
                        <PricingCard
                            title={tr.apartmentTitle}
                            price={`${currencySymbol}150-${currencySymbol}250`}
                            description={tr.apartmentDesc}
                            features={tr.apartmentFeatures}
                        />
                        <PricingCard
                            title={tr.houseTitle}
                            price={`${currencySymbol}200-${currencySymbol}400`}
                            isPopular={true}
                            description={tr.houseDesc}
                            features={tr.houseFeatures}
                            popularLabel={tr.mostPopular}
                        />
                        <PricingCard
                            title={tr.commercialTitle}
                            price={tr.custom}
                            description={tr.commercialDesc}
                            features={tr.commercialFeatures}
                            ctaText={tr.requestQuote}
                            ctaLink="/contact-us"
                        />
                    </div>
                </div>
            </section>

            {/* 3. COMPARISON TABLE */}
            <section className="py-24 bg-gray-50 border-y border-gray-100">
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-black text-gray-900 mb-2 uppercase tracking-tight">{tr.compareTitle}</h2>
                        <p className="text-gray-400 text-xs font-black uppercase tracking-widest">{tr.compareSubtitle}</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
                        <table className="w-full text-left min-w-[500px] md:min-w-0">
                            <thead className="bg-gray-50 text-gray-900 border-b border-gray-100">
                                <tr>
                                    <th className="p-4 md:p-6 text-[10px] md:text-xs font-black uppercase tracking-widest">{tr.feature}</th>
                                    <th className="p-4 md:p-6 text-center text-[10px] md:text-xs font-black uppercase tracking-widest">{tr.standard}</th>
                                    <th className="p-4 md:p-6 text-center text-[10px] md:text-xs font-black uppercase tracking-widest text-[#007F00]">{tr.premium}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 font-bold text-xs md:text-sm">
                                {tr.tableFeatures.map((label, i) => (
                                    <TableRow key={i} label={label} standard={i < 3} premium={true} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* 4. FINISH CTA SECTION */}
            <section className="py-2">
                <div className="container max-w-full">
                    <div className="bg-gray-50 p-12 md:p-20 text-center relative overflow-hidden border border-gray-100">
                        <div className="relative z-10">
                            <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-6 uppercase tracking-tight">{tr.ctaTitle}</h2>
                            <p className="text-gray-500 text-lg mb-10 max-w-xl mx-auto font-medium">
                                {tr.ctaDesc}
                            </p>
                            <Link to="/contact-us">
                                <button className="bg-[#007F00] text-white font-black px-12 py-5 rounded-2xl hover:bg-[#006400] transition-all shadow-xl flex items-center gap-3 mx-auto transform hover:-translate-y-1 active:translate-y-0 cursor-pointer">
                                    {tr.ctaButton} <ArrowRight size={20} />
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
            <InternalLinks page="pricing" />
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
    ctaText,
    ctaLink = "/contact-us",
    popularLabel = 'Most Popular'
}: {
    title: string,
    price: string,
    description: string,
    features: string[],
    isPopular?: boolean,
    ctaText?: string,
    ctaLink?: string,
    popularLabel?: string
}) => (
    <div className={`p-10 bg-white rounded-[2.5rem] border transition-all hover:shadow-lg flex flex-col cursor-pointer ${isPopular ? 'border-[#007F00] ring-1 ring-[#007F00]/10' : 'border-gray-100'}`}>
        {isPopular && (
            <div className="mb-6 self-start px-3 py-1 bg-green-50 text-[#007F00] rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100">
                {popularLabel}
            </div>
        )}
        <h3 className="text-lg font-black text-gray-900 mb-1 uppercase tracking-tight">{title}</h3>
        <div className="flex items-baseline mb-6">
            <span className="text-4xl font-black text-gray-900">{price}</span>
            {price !== "Custom" && price !== "Personalizado" && price !== "Sur mesure" && <span className="text-gray-400 ml-1 text-sm font-bold">/unit</span>}
        </div>
        <p className="text-gray-500 font-bold text-sm leading-relaxed mb-8 flex-grow">
            {description}
        </p>

        <ul className="space-y-4 mb-10">
            {features.map((feature, index) => (
                <li key={index} className="flex items-start text-sm font-bold text-gray-700">
                    <CheckCircle2 size={18} className="text-[#007F00] mr-3 flex-shrink-0 mt-0.5" />
                    {feature}
                </li>
            ))}
        </ul>

        <Link to={ctaLink}>
            <button className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all cursor-pointer ${isPopular ? 'bg-[#007F00] text-white hover:bg-[#006400] shadow-lg shadow-green-100' : 'bg-gray-50 text-gray-900 hover:bg-gray-100 border border-gray-100'}`}>
                {ctaText || 'Book Now'}
            </button>
        </Link>
    </div>
);

const TableRow = ({ label, standard, premium }: { label: string, standard: boolean, premium: boolean }) => (
    <tr className="hover:bg-gray-50/50 transition-colors">
        <td className="p-6 font-bold text-gray-700">{label}</td>
        <td className="p-6 text-center">
            {standard ? <CheckCircle2 className="mx-auto text-green-500" size={20} /> : <X className="mx-auto text-gray-300" size={20} />}
        </td>
        <td className="p-6 text-center">
            {premium ? <CheckCircle2 className="mx-auto text-[#007F00]" size={20} /> : <X className="mx-auto text-gray-300" size={20} />}
        </td>
    </tr>
);

export default Pricing;
