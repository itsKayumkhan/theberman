import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import QuoteFormModule from '../components/QuoteFormModule';
import { useTranslation } from '../hooks/useTranslation';
import SEOHead from '../components/SEOHead';

const QuoteForm = () => {
    const navigate = useNavigate();
    const { t, isSpanish, tenant } = useTranslation();
    const isEngland = tenant === 'england';
    const isFrance = tenant === 'france';
    const isPortugal = tenant === 'portugal';
    const isIreland = !isSpanish && !isEngland && !isFrance && !isPortugal;
    const ratingName = isSpanish ? 'Certificado Energético' : tenant === 'england' ? 'EPC' : tenant === 'france' ? 'DPE' : tenant === 'portugal' ? 'Certificado Energético' : 'BER';
    const assessorDesc = isSpanish ? 'certificadores acreditados' : tenant === 'england' ? 'accredited EPC assessors' : tenant === 'france' ? 'diagnostiqueurs certifiés' : tenant === 'portugal' ? 'peritos qualificados' : 'SEAI registered BER assessors';

    const seoTitle = isIreland ? 'Get a Free BER Quote | Compare Prices Instantly' : isSpanish ? `Solicitar Presupuesto ${ratingName}` : isEngland ? 'Get a Free EPC Quote | Compare Prices' : isFrance ? `Obtenir un Devis ${ratingName}` : isPortugal ? `Pedir Orçamento ${ratingName}` : `Get Your ${ratingName} Quote`;
    const seoDesc = isIreland ? 'Request a free BER certificate quote in minutes. Compare prices from SEAI-registered assessors near you and book your assessment online.' : isSpanish ? 'Rellena el formulario para recibir presupuestos competitivos de certificadores acreditados en tu zona.' : isEngland ? 'Request a free EPC quote in minutes. Compare prices from accredited assessors near you and book your assessment online.' : isFrance ? `Remplissez le formulaire ci-dessous pour recevoir des devis compétitifs de ${assessorDesc} dans votre région.` : isPortugal ? `Preencha o formulário abaixo para receber orçamentos competitivos de ${assessorDesc} na sua zona.` : `Complete the form below to receive competitive quotes from ${assessorDesc} in your area.`;
    const ogTitle = isIreland ? 'Get Your Free BER Quote Today' : undefined;
    const ogDesc = isIreland ? 'Enter your property details and get competing BER certificate quotes from SEAI-registered assessors in minutes.' : undefined;
    const twitterTitle = isIreland ? 'Get a Free BER Quote in Minutes' : undefined;
    const twitterDesc = isIreland ? 'Compare BER certificate quotes from SEAI-registered assessors near you - free, fast, no obligation.' : undefined;

    return (
        <div className="min-h-screen bg-white">
            <SEOHead
                title={seoTitle}
                description={seoDesc}
                canonical="/get-quote"
                ogTitle={ogTitle}
                ogDescription={ogDesc}
                twitterTitle={twitterTitle}
                twitterDescription={twitterDesc}
                skipSiteNameSuffix={isIreland}
            />
            <div className="max-w-7xl mx-auto px-4 py-12 md:py-20">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-3 text-gray-500 hover:text-[#007F00] transition-all mb-8 group cursor-pointer"
                >
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-green-50 group-hover:text-[#007F00] transition-all border border-gray-100 group-hover:border-green-100">
                        <ArrowLeft size={20} />
                    </div>
                    <span className="font-black text-xs uppercase tracking-widest">{t('back')}</span>
                </button>

                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">
                        {isSpanish ? 'Solicita tu Presupuesto' : tenant === 'france' ? `Obtenez votre Devis ${ratingName}` : tenant === 'portugal' ? `Peça o seu Orçamento para ${ratingName}` : `Get Your ${ratingName} Quote`}
                    </h1>
                    <p className="text-gray-500 max-w-2xl mx-auto">
                        {isSpanish ? 'Rellena el formulario para recibir presupuestos competitivos de certificadores acreditados en tu zona.' : tenant === 'france' ? `Remplissez le formulaire ci-dessous pour recevoir des devis compétitifs de ${assessorDesc} dans votre région.` : tenant === 'portugal' ? `Preencha o formulário abaixo para receber orçamentos competitivos de ${assessorDesc} na sua zona.` : `Complete the form below to receive competitive quotes from ${assessorDesc} in your area.`}
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
