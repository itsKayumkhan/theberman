import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { getTenantFromDomain } from '../lib/tenant';
import toast from 'react-hot-toast';

const CONTENT: Record<string, { title: string; description: string; placeholder: string; button: string; sending: string; success: string; error: string }> = {
    spain: {
        title: 'Mantente Informado',
        description: 'Suscríbete para recibir las últimas novedades sobre certificados energéticos, subvenciones, consejos y guías técnicas.',
        placeholder: 'CORREO ELECTRÓNICO',
        button: 'Suscribirse',
        sending: 'ENVIANDO...',
        success: 'Suscripción confirmada.',
        error: 'Algo salió mal. Inténtalo de nuevo.',
    },
    portugal: {
        title: 'MANTENHA-SE INFORMADO',
        description: 'Subscreva para receber novidades sobre certificação energética, eficiência energética, apoios, legislação e guias técnicos.',
        placeholder: 'ENDEREÇO DE E-MAIL',
        button: 'Subscrever',
        sending: 'A ENVIAR...',
        success: 'Subscrição confirmada.',
        error: 'Algo correu mal. Tente novamente.',
    },
    france: {
        title: 'Restez Informé',
        description: 'Abonnez-vous pour recevoir les dernières actualités sur le DPE, les aides, la réglementation et les guides techniques.',
        placeholder: 'ADRESSE E-MAIL',
        button: 'S\'abonner',
        sending: 'ENVOI EN COURS...',
        success: 'Abonnement confirmé.',
        error: 'Une erreur est survenue. Veuillez réessayer.',
    },
    england: {
        title: 'Stay Informed',
        description: 'Subscribe for updates on EPCs, energy efficiency, grants, regulations and technical guides.',
        placeholder: 'EMAIL ADDRESS',
        button: 'Subscribe to news',
        sending: 'SENDING...',
        success: 'Subscription confirmed.',
        error: 'Something went wrong. Please try again.',
    },
};

const ArticleNewsletter = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const tenant = getTenantFromDomain();
    const content = CONTENT[tenant] || CONTENT.england;

    return (
        <section className="py-20 bg-[#1a1a1a] text-white">
            <div className="container mx-auto px-6 max-w-4xl text-center">
                <h2 className="text-3xl md:text-4xl font-black mb-6 uppercase tracking-tight">{content.title}</h2>
                <p className="text-gray-400 mb-12 text-lg">
                    {content.description}
                </p>
                <form
                    className="flex flex-col sm:flex-row gap-0 border border-white/20"
                    onSubmit={async (e) => {
                        e.preventDefault();
                        const emailInput = (e.target as HTMLFormElement).querySelector('input[type="email"]') as HTMLInputElement;
                        const email = emailInput?.value;
                        if (!email) return;

                        setIsSubmitting(true);
                        try {
                            const { error } = await supabase
                                .from('leads')
                                .insert([{
                                    tenant,
                                    name: 'Blog Subscriber',
                                    email: email,
                                    message: 'Subscribed via article page newsletter',
                                    status: 'new',
                                    purpose: 'Blog Subscription'
                                }]);
                            if (error) throw error;
                            toast.success(content.success);
                            (e.target as HTMLFormElement).reset();
                        } catch {
                            toast.error(content.error);
                        } finally {
                            setIsSubmitting(false);
                        }
                    }}
                >
                    <input
                        type="email"
                        placeholder={content.placeholder}
                        className="flex-grow bg-transparent px-6 py-4 text-white placeholder:text-gray-500 outline-none font-bold text-xs tracking-widest"
                        required
                        disabled={isSubmitting}
                    />
                    <button
                        disabled={isSubmitting}
                        className="bg-[#007F00] text-white font-black px-12 py-4 hover:bg-[#006400] transition-colors uppercase tracking-widest text-[10px] cursor-pointer disabled:opacity-70 whitespace-nowrap"
                    >
                        {isSubmitting ? content.sending : content.button}
                    </button>
                </form>
            </div>
        </section>
    );
};

export default ArticleNewsletter;
