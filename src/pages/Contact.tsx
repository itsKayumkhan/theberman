
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '../lib/supabase';
import { Loader2, Send, CheckCircle, AlertCircle, Phone, Mail, MapPin, Clock } from 'lucide-react';

const contactSchema = z.object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(10, 'Valid phone number is required'),
    message: z.string().min(10, 'Message must be at least 10 characters'),
});

type ContactFormData = z.infer<typeof contactSchema>;

const Contact = () => {
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<ContactFormData>({
        resolver: zodResolver(contactSchema),
    });

    const onSubmit = async (data: ContactFormData) => {
        setSubmitStatus('idle');
        try {
            const { error } = await supabase
                .from('leads')
                .insert([{
                    name: data.name,
                    email: data.email,
                    phone: data.phone,
                    message: data.message,
                }]);

            if (error) throw error;
            setSubmitStatus('success');
            reset();
        } catch (error) {
            console.error('Error:', error);
            setSubmitStatus('error');
        }
    };

    return (
        <div className="font-sans text-gray-900 bg-white">
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

                            {submitStatus === 'success' ? (
                                <div className="bg-green-50 rounded-2xl p-8 text-center border border-green-200">
                                    <CheckCircle className="mx-auto h-16 w-16 text-[#007F00] mb-4" />
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Message Sent!</h3>
                                    <p className="text-gray-600 mb-6">We'll be in touch shortly.</p>
                                    <button
                                        onClick={() => setSubmitStatus('idle')}
                                        className="text-[#007F00] font-bold underline hover:text-green-800"
                                    >
                                        Send another
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                    {submitStatus === 'error' && (
                                        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg flex items-center gap-2 text-sm">
                                            <AlertCircle size={16} /> Failed to send message.
                                        </div>
                                    )}

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

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-[#9ACD32] hover:bg-lime-400 text-green-900 font-bold py-4 rounded-lg transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-70"
                                    >
                                        {isSubmitting ? <Loader2 className="animate-spin" /> : <Send size={20} />}
                                        Send Message
                                    </button>
                                </form>
                            )}
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
