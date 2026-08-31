
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '../lib/supabase';
import {
    Loader2, Send, Mail, Globe, Phone, MapPin, Clock
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getTownsForTenant } from '../lib/tenantData';
import SEOHead from '../components/SEOHead';
import InternalLinks from '../components/InternalLinks';
import { getTenantFromDomain, getTenantEmail, getTenantDomain } from '../lib/tenant';
import { getPhonePlaceholder } from '../lib/phoneFormats';
import { usePageContent, cmsValue } from '../hooks/usePageContent';

const getContactSchema = (isSpanish: boolean, isPortuguese: boolean, isFrench: boolean) => z.object({
    name: z.string().min(2, isSpanish ? 'El nombre debe tener al menos 2 caracteres' : isPortuguese ? 'O nome deve ter pelo menos 2 caracteres' : isFrench ? 'Le nom doit comporter au moins 2 caractères' : 'Name must be at least 2 characters'),
    email: z.string().email(isSpanish ? 'Por favor, introduce una dirección de correo válida' : isPortuguese ? 'Por favor, introduza um email válido' : isFrench ? 'Veuillez saisir une adresse e-mail valide' : 'Please enter a valid email address'),
    phone: z.string().regex(/^\+?[0-9\s-]{9,15}$/, isSpanish ? 'Por favor, introduce un número de teléfono válido' : isPortuguese ? 'Por favor, introduza um número de telefone válido' : isFrench ? 'Veuillez saisir un numéro de téléphone valide' : 'Please enter a valid phone number'),
    county: z.string().min(1, isSpanish ? 'Por favor, selecciona una comunidad autónoma' : isPortuguese ? 'Por favor, selecione uma região' : isFrench ? 'Veuillez sélectionner une région' : 'Please select a county'),
    town: z.string().min(2, isSpanish ? 'La ciudad es obligatoria' : isPortuguese ? 'A cidade é obrigatória' : isFrench ? 'La ville est obligatoire' : 'Town/City is required'),
    property_type: z.string().min(1, isSpanish ? 'Por favor, selecciona un tipo de propiedad' : isPortuguese ? 'Por favor, selecione um tipo de imóvel' : isFrench ? 'Veuillez sélectionner un type de bien' : 'Please select a property type'),
    purpose: z.string().min(1, isSpanish ? 'Por favor, selecciona un propósito' : isPortuguese ? 'Por favor, selecione uma finalidade' : isFrench ? 'Veuillez sélectionner un objectif' : 'Please select a purpose'),
    preferred_date: z.string().optional(),
    preferred_time: z.string().optional(),
    property_size: z.string().optional(),
    bedrooms: z.string().optional(),
    additional_features: z.string().optional(),
    heat_pump: z.string().optional(),
    eircode: z.string().optional(),
    message: z.string().min(10, isSpanish ? 'El mensaje es demasiado corto (mínimo 10 caracteres)' : isPortuguese ? 'A mensagem é demasiado curta (mínimo 10 caracteres)' : isFrench ? 'Le message est trop court (minimum 10 caractères)' : 'Message is too short (min 10 chars)'),
    bot_check: z.string().optional(), // Honeypot field
});

type ContactFormData = z.infer<ReturnType<typeof getContactSchema>>;

const Contact = () => {
    const navigate = useNavigate();
    const tenant = getTenantFromDomain();
    const isSpanish = tenant === 'spain';
    const isEngland = tenant === 'england';
    const isPortuguese = tenant === 'portugal';
    const isFrench = tenant === 'france';

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<ContactFormData>({
        resolver: zodResolver(getContactSchema(isSpanish, isPortuguese, isFrench)),
    });
    const selectedCounty = watch('county');
    const townsByCounty = getTownsForTenant(tenant);
    const tenantEmail = getTenantEmail(tenant);
    const tenantDomain = getTenantDomain(tenant);
    const { content: cms, loading: cmsLoading } = usePageContent('contact');
    const c = (section: string, key: string, fallback: string) => cmsValue(cms, section, key, fallback);
    const tr = {
        seoTitle: isSpanish ? 'Contacto' : isEngland ? 'Contact EPCCert | Book an EPC Assessment in England' : isPortuguese ? 'Contacto | Certificado Energia Portugal' : isFrench ? 'Contact | DPE Cert France' : 'Book a BER Assessment in Ireland | Contact The BER Man',
        seoDesc: isSpanish
            ? 'Contacta con Certificado Energético para tus certificados energéticos, calificaciones y mejoras en toda España.'
            : isEngland
                ? 'Get in touch with EPC Cert for fast, reliable EPC Certificate services across England. Contact our expert team to book or request a quote!'
                : isPortuguese
                    ? 'Contacte a Certificado Energia para certificação energética em Portugal. Peritos qualificados e orçamentos competitivos.'
                    : isFrench
                        ? 'Contactez DPE Cert France pour vos diagnostics de performance énergétique. Diagnostiqueurs qualifiés et devis compétitifs.'
                        : 'Book a BER Assessment in Ireland or Contact the BER Man for Support. Connect with Qualified BER Assessors and Get Assistance with Your Enquiry',
        ogTitle: isEngland ? 'Get in Touch with EPCCert | EPC Certificates England' : undefined,
        ogDescription: isEngland ? 'Contact EPC Cert for reliable domestic and commercial EPC Certificate services across England. Get expert advice and fast booking!' : undefined,
        twitterTitle: isEngland ? 'Contact EPCCert | Fast EPC Quotes & Support in England' : undefined,
        twitterDescription: isEngland ? 'How much does an EPC certificate cost in England? Compare prices from accredited assessors. Get the best EPC quote with EPC Cert.' : undefined,
        badge: isSpanish ? 'Ponte en Contacto' : isPortuguese ? 'Contacto' : isFrench ? 'Contactez-nous' : 'Get In Touch',
        title1: isSpanish ? '¿En qué podemos' : isEngland ? 'Book an EPC Assessment' : isPortuguese ? 'Como podemos' : isFrench ? 'Planifier un' : 'Book a BER',
        title2: isSpanish ? 'ayudarte?' : isEngland ? 'in England' : isPortuguese ? 'ajudar?' : isFrench ? 'Diagnostic DPE' : 'Assessment in Ireland',
        subtitle: isSpanish
            ? '¿Tienes alguna pregunta sobre certificaciones energéticas? Nuestro equipo está aquí para ayudarte.'
            : isEngland
                ? 'Compare quotes from accredited EPC assessors across England and arrange your EPC assessment with confidence.'
                : isPortuguese
                    ? 'Tem alguma dúvida sobre certificados energéticos? A nossa equipa está aqui para o ajudar.'
                    : isFrench
                        ? 'Une question sur les diagnostics de performance énergétique ? Notre équipe est là pour vous aider.'
                        : 'Contact The BER Man to book a BER assessment, connect with qualified BER assessors, or get support with your enquiry.',
        trustStrip: isEngland ? '' : isPortuguese ? '1.000+ Avaliações Concluídas • 100+ Peritos Qualificados • Cobertura Nacional' : isFrench ? '1 000+ Diagnostics Réalisés • 100+ Diagnostiqueurs Qualifiés • Couverture Nationale' : '1,000+ Assessments Completed • 100+ Qualified Assessors • Nationwide Coverage',
        ourDetails: isSpanish ? 'Nuestros Datos' : isEngland ? 'Our details' : isPortuguese ? 'Os Nossos Detalhes' : isFrench ? 'Nos Coordonnées' : 'Contact Information',
        emailUs: isSpanish ? 'Escríbenos' : isPortuguese ? 'Email' : isFrench ? 'E-mail' : 'Email Us',
        website: isSpanish ? 'Sitio Web' : isPortuguese ? 'Website' : isFrench ? 'Site Web' : 'Website',
        sendDetailed: isSpanish ? 'Envíanos un mensaje detallado' : isEngland ? 'Request an EPC Assessment' : isPortuguese ? 'Pedir uma Avaliação Energética' : isFrench ? 'Demander un Diagnostic DPE' : 'Request a BER Assessment',
        fullName: isSpanish ? 'Nombre Completo' : isPortuguese ? 'Nome Completo' : isFrench ? 'Nom Complet' : 'Full Name',
        fullNamePlaceholder: isSpanish ? 'Nombre completo' : isPortuguese ? 'Nome completo' : isFrench ? 'Nom complet' : 'Full name',
        phoneNumber: isSpanish ? 'Número de Teléfono' : isPortuguese ? 'Telefone' : isFrench ? 'Téléphone' : 'Phone Number',
        phonePlaceholder: isSpanish ? 'número de teléfono' : getPhonePlaceholder(tenant),
        emailAddress: isSpanish ? 'Correo Electrónico' : isPortuguese ? 'Email' : isFrench ? 'Adresse E-mail' : 'Email Address',
        emailPlaceholder: isSpanish ? 'correo electrónico' : isPortuguese ? 'email' : isFrench ? 'e-mail' : 'email',
        county: isSpanish ? 'Comunidad Autónoma' : isPortuguese ? 'Região' : isFrench ? 'Région' : 'County',
        selectCounty: isSpanish ? 'Seleccionar Comunidad Autónoma' : isPortuguese ? 'Selecionar Região' : isFrench ? 'Sélectionner une Région' : 'Select County',
        town: isSpanish ? 'Ciudad / Localidad' : isPortuguese ? 'Cidade / Localidade' : isFrench ? 'Ville / Localité' : 'Town / City',
        selectTown: isSpanish ? 'Seleccionar Ciudad' : isPortuguese ? 'Selecionar Cidade' : isFrench ? 'Sélectionner une Ville' : 'Select Town',
        selectCountyFirst: isSpanish ? 'Selecciona Comunidad Autónoma Primero' : isPortuguese ? 'Selecione a Região Primeiro' : isFrench ? 'Sélectionnez d\'abord une Région' : 'Select County First',
        propertyType: isSpanish ? 'Tipo de Propiedad' : isPortuguese ? 'Tipo de Imóvel' : isFrench ? 'Type de Bien' : 'Property Type',
        selectType: isSpanish ? 'Seleccionar Tipo' : isPortuguese ? 'Selecionar Tipo' : isFrench ? 'Sélectionner un Type' : 'Select Type',
        apartment: isSpanish ? 'Apartamento' : isPortuguese ? 'Apartamento' : isFrench ? 'Appartement' : 'Apartment',
        midTerrace: isSpanish ? 'Casa Adosada (Interior)' : isPortuguese ? 'Moradia em Banda (Meio)' : isFrench ? 'Maison Mitoyenne (Centre)' : 'Mid-Terrace',
        endTerrace: isSpanish ? 'Casa Adosada (Esquina)' : isPortuguese ? 'Moradia em Banda (Extremo)' : isFrench ? 'Maison Mitoyenne (Extrémité)' : 'End-Terrace',
        semiDetached: isSpanish ? 'Casa Pareada' : isPortuguese ? 'Moradia Geminada' : isFrench ? 'Maison Jumelée' : 'Semi-Detached',
        detached: isSpanish ? 'Casa Independiente' : isPortuguese ? 'Moradia Isolada' : isFrench ? 'Maison Individuelle' : 'Detached',
        bungalow: isSpanish ? 'Chalet' : isPortuguese ? 'Bungalow' : isFrench ? 'Bungalow' : 'Bungalow',
        purposeLabel: isSpanish ? 'Propósito del Certificado' : isEngland ? 'Purpose of EPC' : isPortuguese ? 'Finalidade do Certificado' : isFrench ? 'Objetif du Diagnostic' : 'Purpose of BER',
        selectPurpose: isSpanish ? 'Seleccionar Propósito' : isPortuguese ? 'Selecionar Finalidade' : isFrench ? 'Sélectionner un Objectif' : 'Select Purpose',
        mortgage: isSpanish ? 'Hipoteca/Banco' : isPortuguese ? 'Crédito Habitação/Banco' : isFrench ? 'Hypothèque/Banque' : 'Mortgage/Bank',
        selling: isSpanish ? 'Venta' : isPortuguese ? 'Venda' : isFrench ? 'Vente' : 'Selling',
        renting: isSpanish ? 'Alquiler' : isPortuguese ? 'Arrendamento' : isFrench ? 'Location' : 'Renting',
        grant: isSpanish ? 'Subvención' : isPortuguese ? 'Subvenção' : isFrench ? 'Aide Publique' : 'Govt Grant',
        other: isSpanish ? 'Otro' : isPortuguese ? 'Outro' : isFrench ? 'Autre' : 'Other',
        preferredDate: isSpanish ? 'Fecha Preferida' : isPortuguese ? 'Data Preferida' : isFrench ? 'Date Souhaitée' : 'Preferred Date',
        preferredTime: isSpanish ? 'Hora Preferida' : isPortuguese ? 'Hora Preferida' : isFrench ? 'Heure Souhaitée' : 'Preferred Time',
        propertySize: isSpanish ? 'Tamaño de la Propiedad' : isPortuguese ? 'Tamanho do Imóvel' : isFrench ? 'Surface du Bien' : 'Property Size',
        bedrooms: isSpanish ? 'Número de Dormitorios' : isPortuguese ? 'N.º de Quartos' : isFrench ? 'Nombre de Chambres' : 'Number of Bedrooms',
        additionalFeatures: isSpanish ? 'Características Adicionales' : isPortuguese ? 'Características Adicionais' : isFrench ? 'Caractéristiques Supplémentaires' : 'Any Additional Features',
        heatPump: isSpanish ? 'Bomba de Calor Instalada' : isPortuguese ? 'Bomba de Calor Instalada' : isFrench ? 'Pompe à Chaleur Installée' : 'Heat Pump Installed',
        eircodeLabel: isSpanish ? 'Código Postal' : isPortuguese ? 'Código Postal' : isEngland ? 'Postcode' : isFrench ? 'Code Postal' : 'Eircode',
        eircodePlaceholder: isSpanish ? '28001' : isPortuguese ? '1000-001' : isEngland ? 'SW1A 1AA' : isFrench ? '75001' : 'A65 F123',
        selectOption: isSpanish ? 'Seleccionar' : isPortuguese ? 'Selecionar' : isFrench ? 'Sélectionner...' : 'Select...',
        morning: isSpanish ? 'Mañana' : isPortuguese ? 'Manhã' : isFrench ? 'Matin' : 'Morning',
        afternoon: isSpanish ? 'Tarde' : isPortuguese ? 'Tarde' : isFrench ? 'Après-midi' : 'Afternoon',
        evening: isSpanish ? 'Noche' : isPortuguese ? 'Fim de Tarde' : isFrench ? 'Soir' : 'Evening',
        yes: isSpanish ? 'Sí' : isPortuguese ? 'Sim' : isFrench ? 'Oui' : 'Yes',
        no: isSpanish ? 'No' : isPortuguese ? 'Não' : isFrench ? 'Non' : 'No',
        message: isSpanish ? 'Mensaje' : isEngland ? 'Message' : isPortuguese ? 'Mensagem' : isFrench ? 'Message' : 'Message',
        messagePlaceholder: isSpanish ? 'Cuéntanos más sobre tu solicitud...' : isEngland ? 'Tell us about your property or EPC assessment requirements.' : isPortuguese ? 'Fale-nos sobre o seu imóvel ou necessidade de certificação energética.' : isFrench ? 'Parlez-nous de votre bien ou de vos besoins en diagnostic de performance énergétique.' : 'Tell us about your property or BER assessment requirements.',
        sending: isSpanish ? 'Enviando...' : isEngland ? 'Sending...' : isPortuguese ? 'A enviar...' : isFrench ? 'Envoi en cours...' : 'Submitting...',
        sendMessage: isSpanish ? 'Enviar Mensaje' : isEngland ? 'Submit Enquiry' : isPortuguese ? 'Enviar Mensagem' : isFrench ? 'Envoyer la Demande' : 'Submit Enquiry',
        toastSuccess: isSpanish ? '¡Mensaje enviado correctamente! Nos pondremos en contacto en breve.' : isPortuguese ? 'Mensagem enviada com sucesso! Entraremos em contacto em breve.' : isFrench ? 'Message envoyé avec succès ! Nous vous contacterons prochainement.' : 'Message sent successfully! We will be in touch shortly.',
        toastError: isSpanish ? 'Error al enviar el mensaje. Por favor, inténtalo de nuevo.' : isPortuguese ? 'Erro ao enviar a mensagem. Por favor, tente novamente.' : isFrench ? 'Échec de l\'envoi du message. Veuillez réessayer.' : 'Failed to send message. Please try again.',
    };

    const onSubmit = async (data: ContactFormData) => {
        if (data.bot_check) {
            toast.success('Message sent successfully!');
            reset();
            return;
        }

        try {
            const { error } = await supabase
                .from('leads')
                .insert([{
                    tenant,
                    name: data.name,
                    email: data.email,
                    phone: data.phone,
                    county: data.county,
                    town: data.town,
                    property_type: data.property_type,
                    purpose: data.purpose,
                    preferred_date: data.preferred_date || null,
                    preferred_time: data.preferred_time || null,
                    property_size: data.property_size || null,
                    bedrooms: data.bedrooms ? parseInt(data.bedrooms) : null,
                    additional_features: data.additional_features || null,
                    heat_pump: data.heat_pump || null,
                    eircode: data.eircode || null,
                    message: data.message,
                }]);

            if (error) throw error;

            // Trigger Supabase Edge Function for Email Notification
            await supabase.functions.invoke('send-email', {
                body: { record: data, tenant }
            });

            toast.success(tr.toastSuccess);
            reset();
            navigate('/thank-you');
        } catch (error) {
            console.error('Error:', error);
            toast.error(tr.toastError);
        }
    };

    return (
        <div className="font-sans text-gray-900 bg-white min-h-screen">
            <SEOHead
                title={tr.seoTitle}
                description={tr.seoDesc}
                canonical={isSpanish ? '/contacto' : '/contact-us'}
                ogTitle={tr.ogTitle}
                ogDescription={tr.ogDescription}
                twitterTitle={tr.twitterTitle}
                twitterDescription={tr.twitterDescription}
                skipSiteNameSuffix={isEngland || (!isSpanish && !isFrench && !isPortuguese)}
                jsonLd={[
                    {
                        '@context': 'https://schema.org',
                        '@type': 'BreadcrumbList',
                        itemListElement: [
                            { '@type': 'ListItem', position: 1, name: isPortuguese ? 'Início' : 'Home', item: `${tenantDomain}/` },
                            { '@type': 'ListItem', position: 2, name: isPortuguese ? 'Contacto' : 'Contact Us', item: `${tenantDomain}/contact-us` },
                        ],
                    },
                    {
                        '@context': 'https://schema.org',
                        '@type': 'Organization',
                        name: tenant === 'england' ? 'EPC Cert' : isSpanish ? 'Certificado Energético' : tenant === 'france' ? 'DPE France' : isPortuguese ? 'Certificado Energia' : 'The BER Man',
                        url: tenantDomain,
                        logo: tenant === 'england' ? 'https://www.epccert.com/logo.png' : isSpanish ? `https://${tenantDomain}/logo.png` : tenant === 'france' ? `https://${tenantDomain}/dpecert-logo.png` : isPortuguese ? `https://${tenantDomain}/certificado-energia-logo.png` : 'https://www.theberman.eu/logo.svg',
                        sameAs: tenant === 'england'
                            ? ['https://www.facebook.com/epccert', 'https://www.instagram.com/epccert']
                            : isSpanish
                                ? ['https://www.facebook.com/certificadoenergetico', 'https://www.instagram.com/certificadoenergetico']
                                : tenant === 'france'
                                    ? ['https://www.facebook.com/dpefrance', 'https://www.instagram.com/dpefrance']
                                    : isPortuguese
                                        ? []
                                        : ['https://www.facebook.com/people/The-Berman/61578159843471/', 'https://www.instagram.com/thebermanireland'],
                    },
                ]}
            />

            {cmsLoading ? (
                <div className="min-h-screen bg-white" />
            ) : (
            <>
            {/* 1. COMPACT HERO */}
            <section className="pt-32 pb-8 bg-white">
                <div className="container mx-auto px-6 text-center max-w-4xl">
                    <span className="inline-block mb-4 px-4 py-1.5 rounded-full bg-green-50 text-[#007F00] text-xs font-black tracking-widest uppercase border border-green-100">
                        {c('hero', 'badge', tr.badge)}
                    </span>
                    <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
                        {isEngland ? tr.title1 : c('hero', 'heading_line1', tr.title1)} <br className="md:hidden" /> <span className="text-[#007F00]">{isEngland ? tr.title2 : c('hero', 'heading_line2', tr.title2)}</span>
                    </h1>
                    <p className="text-base md:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
                        {isSpanish ? (
                            <>¿Tienes alguna pregunta sobre <Link to="/services" className="text-[#007F00] font-bold hover:underline">certificaciones energéticas</Link>? Nuestro equipo está aquí para <Link to="/energy-advisor" className="text-[#007F00] font-bold hover:underline">ayudarte</Link>.</>
                        ) : (isEngland ? tr.subtitle : c('hero', 'subtitle', tr.subtitle))}
                    </p>
                    {!isSpanish && !isEngland && tr.trustStrip && (
                        <p className="mt-4 text-sm font-bold text-[#007F00] uppercase tracking-widest">
                            {tr.trustStrip}
                        </p>
                    )}
                </div>
            </section>


            {/* 3. CONTACT CONTENT */}
            <section className="pb-12">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="flex flex-col lg:flex-row gap-8 items-stretch">

                        {/* UNIFIED CONTACT INFO CARD */}
                        <div className="lg:w-1/3 w-full bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 border border-gray-100 shadow-sm group hover:border-green-100 transition-all h-full">
                            <h3 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-tight">{tr.ourDetails}</h3>
                            {!isSpanish && !isEngland && (
                                <p className="text-sm text-gray-500 font-medium mb-6 leading-relaxed">
                                    Supporting property owners across all 26 counties in Ireland.<br />
                                    Typical response within 1 business day.
                                </p>
                            )}

                            <div className="space-y-6">
                                {c('contact_details', 'phone', '') && (
                                    <InfoItem
                                        icon={<Phone size={20} />}
                                        title={isSpanish ? 'Teléfono' : isEngland ? 'Phone' : 'Phone'}
                                        value={c('contact_details', 'phone', '')}
                                        href={`tel:${c('contact_details', 'phone', '')}`}
                                    />
                                )}

                                <InfoItem
                                    icon={<Mail size={20} />}
                                    title={tr.emailUs}
                                    value={c('contact_details', 'email', tenantEmail)}
                                    href={`mailto:${c('contact_details', 'email', tenantEmail)}`}
                                />

                                {c('contact_details', 'address', '') && (
                                    <div className="space-y-3">
                                        <InfoItem
                                            icon={<MapPin size={20} />}
                                            title={isSpanish ? 'Dirección' : isEngland ? 'Address' : 'Address'}
                                            value={c('contact_details', 'address', '')}
                                        />
                                        {c('contact_details', 'map_url', '') && (
                                            <button
                                                onClick={() => window.open(c('contact_details', 'map_url', ''), '_blank')}
                                                className="ml-0 md:ml-15 px-4 py-1.5 bg-green-50 text-[#007F00] text-[10px] font-black rounded-lg hover:bg-[#007F00] hover:text-white transition-all flex items-center justify-center md:justify-start gap-2 border border-green-100 cursor-pointer w-full md:w-auto"
                                            >
                                                {isSpanish ? 'Ver en Mapa' : isEngland ? 'View on Map' : 'View on Map'} <MapPin size={10} />
                                            </button>
                                        )}
                                    </div>
                                )}

                                {c('contact_details', 'business_hours', '') && (
                                    <InfoItem
                                        icon={<Clock size={20} />}
                                        title={isSpanish ? 'Horario' : isEngland ? 'Opening Hours' : 'Opening Hours'}
                                        value={c('contact_details', 'business_hours', '')}
                                    />
                                )}

                                <div className="pt-6 border-t border-gray-50">
                                    <InfoItem
                                        icon={<Globe size={20} />}
                                        title={tr.website}
                                        value={isEngland ? 'www.epccert.com' : tenantDomain}
                                        href={isEngland ? 'https://www.epccert.com' : undefined}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* FORM COLUMN */}
                        <div className="lg:w-2/3 w-full bg-gray-50 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 border border-gray-100 shadow-sm transition-all hover:shadow-md">
                            {isEngland && (
                                <h2 className="text-lg md:text-xl font-black text-gray-900 mb-6 text-center uppercase tracking-tight px-4">Get in Touch with EPC Cert</h2>
                            )}
                            {!isEngland && (
                                <h3 className="text-lg md:text-xl font-black text-gray-900 mb-6 text-center uppercase tracking-tight px-4">{tr.sendDetailed}</h3>
                            )}

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <FormInput
                                        label={tr.fullName}
                                        register={register('name')}
                                        error={errors.name}
                                        placeholder={tr.fullNamePlaceholder}
                                    />
                                    <FormInput
                                        label={tr.phoneNumber}
                                        register={register('phone')}
                                        error={errors.phone}
                                        placeholder={tr.phonePlaceholder}
                                    />
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <FormInput
                                        label={tr.emailAddress}
                                        type="email"
                                        register={register('email')}
                                        error={errors.email}
                                        placeholder={tr.emailPlaceholder}
                                    />
                                    <div className="space-y-1">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">{tr.county}</label>
                                        <select
                                            {...register('county', {
                                                onChange: () => setValue('town', '') // Reset town when county changes
                                            })}
                                            className={`w-full bg-white border-2 rounded-2xl px-5 py-3 outline-none transition-all appearance-none cursor-pointer ${errors.county ? 'border-red-500' : 'border-gray-100 focus:border-[#007F00]'}`}
                                        >
                                            <option value="">{tr.selectCounty}</option>
                                            {Object.keys(townsByCounty).sort().map((county) => (
                                                <option key={county} value={county}>{county}</option>
                                            ))}
                                        </select>
                                        {errors.county && <p className="text-red-500 text-xs font-bold mt-1 ml-1">{errors.county.message}</p>}
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">{tr.town}</label>
                                        <select
                                            {...register('town')}
                                            disabled={!selectedCounty}
                                            className={`w-full bg-white border-2 rounded-2xl px-5 py-3 outline-none transition-all appearance-none cursor-pointer ${errors.town ? 'border-red-500' : 'border-gray-100 focus:border-[#007F00]'} ${!selectedCounty ? 'bg-gray-50 opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            <option value="">{selectedCounty ? tr.selectTown : tr.selectCountyFirst}</option>
                                            {selectedCounty && townsByCounty[selectedCounty]?.map((town) => (
                                                <option key={town} value={town}>{town}</option>
                                            ))}
                                        </select>
                                        {errors.town && <p className="text-red-500 text-xs font-bold mt-1 ml-1">{errors.town.message}</p>}
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">{tr.propertyType}</label>
                                        <select
                                            {...register('property_type')}
                                            className={`w-full bg-white border-2 rounded-2xl px-5 py-3 outline-none transition-all appearance-none cursor-pointer ${errors.property_type ? 'border-red-500' : 'border-gray-100 focus:border-[#007F00]'}`}
                                        >
                                            <option value="">{tr.selectType}</option>
                                            <option value="Apartment">{tr.apartment}</option>
                                            <option value="Mid-Terrace">{tr.midTerrace}</option>
                                            <option value="End-Terrace">{tr.endTerrace}</option>
                                            <option value="Semi-Detached">{tr.semiDetached}</option>
                                            <option value="Detached">{tr.detached}</option>
                                            <option value="Bungalow">{tr.bungalow}</option>
                                        </select>
                                        {errors.property_type && <p className="text-red-500 text-xs font-bold mt-1 ml-1">{errors.property_type.message}</p>}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">{tr.purposeLabel}</label>
                                    <select
                                        {...register('purpose')}
                                        className={`w-full bg-white border-2 rounded-2xl px-5 py-3 outline-none transition-all appearance-none cursor-pointer ${errors.purpose ? 'border-red-500' : 'border-gray-100 focus:border-[#007F00]'}`}
                                    >
                                        <option value="">{tr.selectPurpose}</option>
                                        <option value="Mortgage/Bank">{tr.mortgage}</option>
                                        <option value="Selling">{tr.selling}</option>
                                        <option value="Renting">{tr.renting}</option>
                                        <option value="Govt Grant">{tr.grant}</option>
                                        <option value="Other">{tr.other}</option>
                                    </select>
                                    {errors.purpose && <p className="text-red-500 text-xs font-bold mt-1 ml-1">{errors.purpose.message}</p>}
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <FormInput
                                        label={tr.preferredDate}
                                        type="date"
                                        register={register('preferred_date')}
                                        error={errors.preferred_date}
                                        placeholder=""
                                    />
                                    <div className="space-y-1">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">{tr.preferredTime}</label>
                                        <select
                                            {...register('preferred_time')}
                                            className="w-full bg-white border-2 rounded-2xl px-5 py-3 outline-none transition-all appearance-none cursor-pointer border-gray-100 focus:border-[#007F00]"
                                        >
                                            <option value="">{tr.selectOption}</option>
                                            <option value="Morning">{tr.morning}</option>
                                            <option value="Afternoon">{tr.afternoon}</option>
                                            <option value="Evening">{tr.evening}</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <FormInput
                                        label={tr.propertySize}
                                        register={register('property_size')}
                                        error={errors.property_size}
                                        placeholder={isSpanish ? 'ej. 120 m²' : isPortuguese ? 'ex. 120 m²' : isFrench ? 'ex. 120 m²' : 'e.g. 120 sqm'}
                                    />
                                    <div className="space-y-1">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">{tr.bedrooms}</label>
                                        <select
                                            {...register('bedrooms')}
                                            className="w-full bg-white border-2 rounded-2xl px-5 py-3 outline-none transition-all appearance-none cursor-pointer border-gray-100 focus:border-[#007F00]"
                                        >
                                            <option value="">{tr.selectOption}</option>
                                            <option value="1">1</option>
                                            <option value="2">2</option>
                                            <option value="3">3</option>
                                            <option value="4">4</option>
                                            <option value="5">5</option>
                                            <option value="6">6+</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">{tr.heatPump}</label>
                                        <select
                                            {...register('heat_pump')}
                                            className="w-full bg-white border-2 rounded-2xl px-5 py-3 outline-none transition-all appearance-none cursor-pointer border-gray-100 focus:border-[#007F00]"
                                        >
                                            <option value="">{tr.selectOption}</option>
                                            <option value="Yes">{tr.yes}</option>
                                            <option value="No">{tr.no}</option>
                                        </select>
                                    </div>
                                    <FormInput
                                        label={tr.eircodeLabel}
                                        register={register('eircode')}
                                        error={errors.eircode}
                                        placeholder={tr.eircodePlaceholder}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">{tr.message}</label>
                                    <textarea
                                        {...register('message')}
                                        rows={3}
                                        className={`w-full bg-white border-2 rounded-2xl px-5 py-3 outline-none transition-all resize-none ${errors.message ? 'border-red-500' : 'border-gray-100 focus:border-[#007F00]'}`}
                                        placeholder={tr.messagePlaceholder}
                                    ></textarea>
                                    {errors.message && <p className="text-red-500 text-xs font-bold mt-1 ml-1">{errors.message.message}</p>}
                                </div>

                                {/* Honeypot */}
                                <div className="hidden">
                                    <input type="text" tabIndex={-1} autoComplete="off" {...register('bot_check')} />
                                </div>

                                {!isSpanish && !isEngland && (
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest text-center">
                                        1,000+ Assessments Completed • 100+ Qualified Assessors • Nationwide Coverage
                                    </p>
                                )}
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-[#007F00] hover:bg-[#006400] text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-green-100 flex items-center justify-center gap-3 disabled:opacity-70 transform hover:-translate-y-1 active:translate-y-0 cursor-pointer"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="animate-spin" size={20} />
                                            {tr.sending}
                                        </>
                                    ) : (
                                        <>
                                            <Send size={20} />
                                            {tr.sendMessage}
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
            </>
            )}
            <InternalLinks page="contact" />
        </div>
    );
};

const FormInput = ({ label, register, error, placeholder, type = "text" }: { label: string, register: any, error: any, placeholder: string, type?: string }) => (
    <div className="space-y-1 text-left">
        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
        <input
            {...register}
            type={type}
            className={`w-full bg-white border-2 rounded-2xl px-5 py-3 outline-none transition-all ${error ? 'border-red-500' : 'border-gray-100 focus:border-[#007F00]'}`}
            placeholder={placeholder}
        />
        {error && <p className="text-red-500 text-xs font-bold mt-1 ml-1">{error.message}</p>}
    </div>
);

const InfoItem = ({ icon, title, value, href, onClick }: { icon: React.ReactNode, title: string, value: string, href?: string, onClick?: () => void }) => {
    const content = (
        <div className="flex items-center gap-4 group/item cursor-pointer">
            <div className="w-11 h-11 rounded-xl bg-green-50 text-[#007F00] flex items-center justify-center group-hover/item:bg-[#007F00] group-hover/item:text-white transition-all transform group-hover/item:scale-110">
                {icon}
            </div>
            <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{title}</p>
                <p className="text-base font-black text-gray-900 group-hover/item:text-[#007F00] transition-colors">{value}</p>
            </div>
        </div>
    );

    if (href) return <a href={href} className="block">{content}</a>;
    if (onClick) return <div onClick={onClick} className="block">{content}</div>;
    return content;
};

export default Contact;
