
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '../lib/supabase';
import { Loader2, Send, Phone, Mail, MapPin, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const contactSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    phone: z.string().regex(/^\+?[0-9\s-]{9,15}$/, 'Please enter a valid phone number (e.g. 087 123 4567)'),
    county: z.string().min(1, 'Please select a county'),
    town: z.string().min(2, 'Town/City is required'),
    property_type: z.string().min(1, 'Please select a property type'),
    purpose: z.string().min(1, 'Please select a purpose'),
    message: z.string().min(10, 'Message is too short (min 10 chars)'),
    bot_check: z.string().optional(), // Honeypot field
});

type ContactFormData = z.infer<typeof contactSchema>;

const Contact = () => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<ContactFormData>({
        resolver: zodResolver(contactSchema),
    });

    const onSubmit = async (data: ContactFormData) => {
        // Honeypot Check: If the hidden field has a value, it's a bot.
        // Return success instantly to trick the bot, but do nothing.
        if (data.bot_check) {
            toast.success('Message sent successfully!');
            reset();
            return;
        }

        try {
            const { error } = await supabase
                .from('leads')
                .insert([{
                    name: data.name,
                    email: data.email,
                    phone: data.phone,
                    county: data.county,
                    town: data.town,
                    property_type: data.property_type,
                    purpose: data.purpose,
                    message: data.message,
                }]);

            if (error) throw error;

            // Trigger Supabase Edge Function for Email Notification
            const { error: functionError } = await supabase.functions.invoke('send-email', {
                body: { record: data }
            });

            if (functionError) {
                console.error('Email notification failed:', functionError);
                // We don't block the UI success state even if email fails,
                // but we should log it.
            }

            toast.success('Message sent successfully! We will be in touch shortly.');
            reset();
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to send message. Please try again.');
        }
    };

    return (
        <div className="font-sans text-gray-900 bg-white">
            <title>Contact Us | Get a Quote for Your BER</title>
            <meta name="description" content="Contact The Berman for a quick quote or to schedule your BER assessment. Serving Dublin, Meath, Kildare, and Wicklow." />
            {/* 1. HERO SECTION */}
            <section className="pt-32 pb-20 bg-gradient-to-b from-green-50 to-white">
                <div className="container mx-auto px-6 text-center max-w-4xl">
                    <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-green-100 text-[#007F00] text-xs font-bold tracking-wide uppercase">
                        Contact Us
                    </div>
                    <h1 className="text-5xl md:text-6xl font-serif font-bold text-gray-900 mb-6 leading-tight">
                        Get in <span className="text-[#007F00]">Touch.</span>
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                        Have a question or need a quote? We're here to help you Mon-Fri, 9am - 5pm.
                    </p>
                </div>
            </section>

            {/* 2. CONTACT CONTENT */}
            <section className="pb-24">
                <div className="container mx-auto px-6 max-w-6xl">
                    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden grid md:grid-cols-2">

                        {/* INFO COLUMN */}
                        <div className="bg-[#007F00] p-12 text-white flex flex-col justify-between relative overflow-hidden">
                            {/* Background Pattern */}
                            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/5 blur-3xl"></div>
                            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-white/5 blur-3xl"></div>

                            <div className="relative z-10">
                                <h3 className="text-2xl font-serif font-bold mb-6">Contact Information</h3>
                                <div className="space-y-8">
                                    <ContactItem
                                        icon={<Phone className="text-[#9ACD32]" />}
                                        label="Phone"
                                        value="087 442 1653"
                                    />
                                    <ContactItem
                                        icon={<Mail className="text-[#9ACD32]" />}
                                        label="Email"
                                        value="info@theberman.eu"
                                    />
                                    <ContactItem
                                        icon={<MapPin className="text-[#9ACD32]" />}
                                        label="Office"
                                        value="Dublin 4, Ireland"
                                    />
                                    <ContactItem
                                        icon={<Clock className="text-[#9ACD32]" />}
                                        label="Hours"
                                        value="Mon-Fri: 9am - 6pm"
                                    />
                                </div>
                            </div>

                            <div className="mt-12 relative z-10">
                                <div className="w-16 h-1 bg-[#9ACD32] mb-6"></div>
                                <p className="text-green-100 font-serif italic text-lg">
                                    "Quick, professional, and very helpful. Highly recommend for any BER needs."
                                </p>
                                <p className="text-[#9ACD32] font-bold text-sm mt-4 uppercase tracking-wide">
                                    - Sarah O'Connor, Homeowner
                                </p>
                            </div>
                        </div>

                        {/* FORM COLUMN */}
                        <div className="p-12 relative">
                            <h3 className="text-2xl font-serif font-bold text-gray-900 mb-6">Send us a Message</h3>

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                <div className="grid md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">Name</label>
                                        <input
                                            {...register('name')}
                                            className={`w-full bg-gray-50 border rounded-lg p-3 outline-none focus:border-[#007F00] transition ${errors.name ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                                            placeholder="Your Name"
                                        />
                                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">Phone</label>
                                        <input
                                            {...register('phone')}
                                            className={`w-full bg-gray-50 border rounded-lg p-3 outline-none focus:border-[#007F00] transition ${errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                                            placeholder="087..."
                                        />
                                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">County</label>
                                        <select
                                            {...register('county')}
                                            className={`w-full bg-gray-50 border rounded-lg p-3 outline-none focus:border-[#007F00] transition ${errors.county ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                                        >
                                            <option value="">Select County</option>
                                            <option value="Dublin">Dublin</option>
                                            <option value="Meath">Meath</option>
                                            <option value="Kildare">Kildare</option>
                                            <option value="Wicklow">Wicklow</option>
                                            <option value="Louth">Louth</option>
                                            <option value="Other">Other</option>
                                        </select>
                                        {errors.county && <p className="text-red-500 text-xs mt-1">{errors.county.message}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">Town</label>
                                        <input
                                            {...register('town')}
                                            className={`w-full bg-gray-50 border rounded-lg p-3 outline-none focus:border-[#007F00] transition ${errors.town ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                                            placeholder="e.g. Rathgar"
                                        />
                                        {errors.town && <p className="text-red-500 text-xs mt-1">{errors.town.message}</p>}
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">Property Type</label>
                                        <select
                                            {...register('property_type')}
                                            className={`w-full bg-gray-50 border rounded-lg p-3 outline-none focus:border-[#007F00] transition ${errors.property_type ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                                        >
                                            <option value="">Select Type</option>
                                            <option value="Apartment">Apartment</option>
                                            <option value="Mid-Terrace">Mid-Terrace</option>
                                            <option value="End-Terrace">End-Terrace</option>
                                            <option value="Semi-Detached">Semi-Detached</option>
                                            <option value="Detached">Detached</option>
                                            <option value="Bungalow">Bungalow</option>
                                        </select>
                                        {errors.property_type && <p className="text-red-500 text-xs mt-1">{errors.property_type.message}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">Purpose</label>
                                        <select
                                            {...register('purpose')}
                                            className={`w-full bg-gray-50 border rounded-lg p-3 outline-none focus:border-[#007F00] transition ${errors.purpose ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                                        >
                                            <option value="">Select Purpose</option>
                                            <option value="Mortgage/Bank">Mortgage/Bank</option>
                                            <option value="Selling">Selling</option>
                                            <option value="Renting">Renting</option>
                                            <option value="Govt Grant">Govt Grant</option>
                                            <option value="Other">Other</option>
                                        </select>
                                        {errors.purpose && <p className="text-red-500 text-xs mt-1">{errors.purpose.message}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">Email</label>
                                    <input
                                        {...register('email')}
                                        className={`w-full bg-gray-50 border rounded-lg p-3 outline-none focus:border-[#007F00] transition ${errors.email ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                                        placeholder="your@email.com"
                                    />
                                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">Message</label>
                                    <textarea
                                        {...register('message')}
                                        rows={4}
                                        className={`w-full bg-gray-50 border rounded-lg p-3 outline-none focus:border-[#007F00] transition ${errors.message ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                                        placeholder="How can we help?"
                                    ></textarea>
                                    {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>}
                                </div>

                                {/* Honeypot Field for Spam Protection */}
                                <div className="hidden">
                                    <input
                                        type="text"
                                        tabIndex={-1}
                                        autoComplete="off"
                                        {...register('bot_check')}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-[#9ACD32] hover:bg-lime-400 text-green-900 font-bold py-4 rounded-lg transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-70"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin" /> : <Send size={20} />}
                                    Send Message
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

const ContactItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
    <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
            {icon}
        </div>
        <div>
            <p className="text-xs text-green-200 uppercase tracking-wider mb-0.5">{label}</p>
            <p className="font-bold text-lg">{value}</p>
        </div>
    </div>
);

export default Contact;
