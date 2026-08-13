import { Check, Mail, Clock, Home, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getTenantFromDomain } from '../lib/tenant';

interface JobConfirmationProps {
    customerName: string;
    county: string;
    email: string;
    emailError?: string | null;
    hideNavigation?: boolean;
    jobType?: 'BER' | 'Solar';
}

const JobConfirmation = ({ customerName, county, email, emailError, hideNavigation, jobType = 'BER' }: JobConfirmationProps) => {
    const tenant = getTenantFromDomain();
    const isEngland = tenant === 'england';
    const isSpanish = tenant === 'spain';
    const isFrench = tenant === 'france';
    const isPortuguese = tenant === 'portugal';
    const brandDomain = isEngland ? 'epccert.com' : isSpanish ? 'certificadoenergético.eu' : isFrench ? 'dpecert.fr' : isPortuguese ? 'certificadoenergia.com' : 'theberman.eu';
    const ratingName = isEngland ? 'EPC' : isSpanish ? 'CEE' : isFrench ? 'DPE' : isPortuguese ? 'CE' : 'BER';
    const country = isEngland ? 'England' : isSpanish ? 'Spain' : isFrench ? 'France' : isPortuguese ? 'Portugal' : 'Ireland';
    const countryLocalized = isEngland ? 'England' : isSpanish ? 'España' : isFrench ? 'France' : isPortuguese ? 'Portugal' : 'Ireland';
    const isSolar = jobType === 'Solar';
    const professionalTitle = isSolar ? (isSpanish ? 'Instaladores Solares' : isFrench ? 'Installateurs Solaires' : isPortuguese ? 'Instaladores Solares' : 'Solar Installers') : (isEngland ? 'EPC Assessors' : (isSpanish ? 'Certificadores' : isFrench ? 'Diagnostiqueurs' : isPortuguese ? 'Peritos' : 'BER Assessors'));
    const professionalSingular = isSolar ? (isSpanish ? 'Instalador' : isFrench ? 'Installateur' : isPortuguese ? 'Instalador' : 'Installer') : (isEngland ? 'EPC Assessor' : (isSpanish ? 'Certificador' : isFrench ? 'Diagnostiqueur' : isPortuguese ? 'Perito' : 'Assessor'));
    const jobTitle = isSolar ? (isSpanish ? 'Solicitud de presupuesto solar' : isFrench ? 'Demande de devis solaire' : isPortuguese ? 'Pedido de orçamento solar' : 'Solar quote request') : (isSpanish ? `Solicitud de ${ratingName}` : isFrench ? `Demande de ${ratingName}` : isPortuguese ? `Pedido de ${ratingName}` : `${ratingName} assessment request`);

    return (
        <div className="space-y-8 text-center">
            {/* Success Icon */}
            <div className="flex justify-center">
                <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center animate-pulse">
                    <Check size={48} className="text-green-600" />
                </div>
            </div>

            {/* Main Heading */}
            <div>
                <h1 className="text-4xl md:text-5xl font-light text-gray-800 mb-4">
                    {isSpanish ? '¡Tu Trabajo está Publicado!' : isFrench ? 'Votre Mission est en Ligne !' : isPortuguese ? 'O seu Trabalho está Publicado!' : 'Your Job is Live!'}
                </h1>
                <p className="text-xl text-gray-600 max-w-lg mx-auto">
                    {isSpanish ? `Hola ${customerName}, tu ${jobTitle} ya está publicado en ${brandDomain}` : isFrench ? `Bonjour ${customerName}, votre ${jobTitle} est maintenant en ligne sur ${brandDomain}` : isPortuguese ? `Olá ${customerName}, o seu ${jobTitle} está agora publicado em ${brandDomain}` : `Hi ${customerName}, your ${jobTitle} is now live on ${brandDomain}`}
                </p>
            </div>

            {/* Email Error Alert (if failed) */}
            {emailError && (
                <div className="max-w-2xl mx-auto bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-4 text-left">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                        <AlertCircle size={20} className="text-amber-600" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-amber-800">{isSpanish ? 'Notificación por Correo Pendiente' : isFrench ? 'Notification par Email en Attente' : isPortuguese ? 'Notificação por Email Pendente' : 'Email Notification Pending'}</h4>
                        <p className="text-amber-700 text-sm">
                            {isSpanish ? `No hemos podido enviar el correo de confirmación ahora: ${emailError}. No te preocupes, tu trabajo está activo y los ${professionalTitle.toLowerCase()} aún pueden verlo.` : isFrench ? `Nous n'avons pas pu envoyer l'email de confirmation : ${emailError}. Ne vous inquiétez pas, votre mission est active et les ${professionalTitle.toLowerCase()} peuvent toujours la voir.` : isPortuguese ? `Não conseguimos enviar o email de confirmação: ${emailError}. Não se preocupe, o seu trabalho está ativo e os ${professionalTitle.toLowerCase()} ainda podem vê-lo.` : `We couldn't send the confirmation email right now: ${emailError}. Don't worry, your job is active and ${professionalTitle.toLowerCase()} can still see it.`}
                        </p>
                    </div>
                </div>
            )}

            {/* Info Cards */}
            <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto pt-4">
                {/* Professionals Notified */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                        <Mail size={24} className="text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-2">{isSolar ? (isSpanish ? 'Instaladores Notificados' : isFrench ? 'Installateurs Notifiés' : isPortuguese ? 'Instaladores Notificados' : 'Installers Notified') : (isSpanish ? 'Certificadores Notificados' : isFrench ? 'Diagnostiqueurs Notifiés' : isPortuguese ? 'Peritos Notificados' : 'Assessors Notified')}</h3>
                    <p className="text-gray-500 text-sm">
                        {isSpanish ? `Hemos notificado a todos los ${professionalTitle} registrados en ${county}` : isFrench ? `Nous avons notifié tous les ${professionalTitle} inscrits dans ${county}` : isPortuguese ? `Notificámos todos os ${professionalTitle} registados em ${county}` : `We've notified all registered ${professionalTitle} in ${county}`}
                    </p>
                </div>

                {/* Quotes Coming */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                        <Clock size={24} className="text-green-600" />
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-2">{isSpanish ? 'Presupuestos en Camino' : isFrench ? 'Devis à Venir' : isPortuguese ? 'Orçamentos a Chegar' : 'Quotes Incoming'}</h3>
                    <p className="text-gray-500 text-sm">
                        {isSpanish ? `Los ${professionalTitle} ya pueden enviar presupuestos. Te avisaremos por correo cuando lleguen.` : isFrench ? `Les ${professionalTitle} peuvent maintenant envoyer des devis. Nous vous informerons par email quand les devis arriveront.` : isPortuguese ? `Os ${professionalTitle} já podem enviar orçamentos. Avisá-lo-emos por email quando chegarem.` : `${professionalTitle} can now submit quotes. We'll email you when quotes arrive.`}
                    </p>
                </div>

                {/* Check Email */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className={`w-12 h-12 rounded-full ${emailError ? 'bg-amber-100' : 'bg-purple-100'} flex items-center justify-center mx-auto mb-4`}>
                        <Mail size={24} className={emailError ? 'text-amber-600' : 'text-purple-600'} />
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-2">
                        {emailError ? (isSpanish ? 'Problemas con el Correo' : isFrench ? 'Problèmes d\'Email' : isPortuguese ? 'Problemas com o Email' : 'Email Issues') : (isSpanish ? 'Revisa tu Correo' : isFrench ? 'Vérifiez vos Emails' : isPortuguese ? 'Verifique o seu Email' : 'Check Your Email')}
                    </h3>
                    <p className="text-gray-500 text-sm">
                        {emailError ? (
                            isSpanish ? `No se pudo enviar a ${email}` : isFrench ? `Échec d\'envoi à ${email}` : isPortuguese ? `Falha ao enviar para ${email}` : `Failed to send to ${email}`
                        ) : (
                            <>{isSpanish ? 'Confirmación enviada a' : isFrench ? 'Confirmation envoyée à' : isPortuguese ? 'Confirmação enviada para' : 'Confirmation sent to'} <span className="font-semibold text-gray-700">{email}</span></>
                        )}
                    </p>
                </div>
            </div>

            {/* What Happens Next */}
            <div className="bg-green-50 rounded-xl p-8 max-w-2xl mx-auto">
                <h3 className="font-semibold text-green-800 text-lg mb-4">{isSpanish ? '¿Qué Sigue?' : isFrench ? 'Qu\'est-ce qui se Passe Ensuite ?' : isPortuguese ? 'O que se Segue?' : 'What Happens Next?'}</h3>
                <ol className="text-left text-green-700 space-y-3">
                    <li className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-200 text-green-800 flex items-center justify-center text-sm font-bold">1</span>
                        <span>{isSpanish ? `Los ${professionalTitle} de tu zona revisarán tu trabajo y enviarán presupuestos` : isFrench ? `Les ${professionalTitle} de votre région examinereront votre mission et enverront des devis` : isPortuguese ? `Os ${professionalTitle} da sua zona vão rever o seu trabalho e enviar orçamentos` : `${professionalTitle} in your area will review your job and submit quotes`}</span>
                    </li>
                    <li className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-200 text-green-800 flex items-center justify-center text-sm font-bold">2</span>
                        <span>{isSpanish ? 'Recibirás un correo cuando llegue cada presupuesto' : isFrench ? 'Vous recevrez un email à chaque devis reçu' : isPortuguese ? 'Receberá um email quando cada orçamento chegar' : 'You\'ll receive an email when each quote arrives'}</span>
                    </li>
                    <li className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-200 text-green-800 flex items-center justify-center text-sm font-bold">3</span>
                        <span>{isSpanish ? `Compara los presupuestos y elige el mejor ${professionalSingular.toLowerCase()} para ti. Los presupuestos permanecen activos mientras el trabajo esté activo.` : isFrench ? `Comparez les devis et choisissez le meilleur ${professionalSingular.toLowerCase()} pour vous. Les devis restent actifs tant que la mission est active.` : isPortuguese ? `Compare os orçamentos e escolha o melhor ${professionalSingular.toLowerCase()} para si. Os orçamentos permanecem ativos enquanto o trabalho estiver ativo.` : `Compare quotes and choose the best ${professionalSingular.toLowerCase()} for you. Quotes stay active as long as the job is active.`}</span>
                    </li>
                </ol>
            </div>

            {/* Return Home Button */}
            {!hideNavigation && (
                <>
                    <div className="pt-4">
                        <Link to="/dashboard/user">
                            <button className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-4 rounded-lg transition-all shadow-lg hover:shadow-xl">
                                <Home size={20} />
                                {isSpanish ? 'Volver al Panel' : isFrench ? 'Retour au Tableau de Bord' : isPortuguese ? 'Voltar ao Painel' : 'Return to Dashboard'}
                            </button>
                        </Link>
                    </div>

                    {/* Footer Note */}
                    <p className="text-gray-400 text-sm">
                        {isSpanish ? `Gracias por usar ${brandDomain} — el mayor portal de ${ratingName} de ${countryLocalized}` : isFrench ? `Merci d\'utiliser ${brandDomain} — le plus grand portail ${ratingName} de ${countryLocalized}` : isPortuguese ? `Obrigado por usar ${brandDomain} — o maior portal de ${ratingName} de ${countryLocalized}` : `Thanks for using ${brandDomain} — ${country}'s largest ${ratingName} website`}
                    </p>
                </>
            )}
        </div>
    );
};

export default JobConfirmation;
