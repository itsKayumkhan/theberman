
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const updatePasswordSchema = z.object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type UpdatePasswordFormData = z.infer<typeof updatePasswordSchema>;

const UpdatePassword = () => {
    const { updateUserPassword } = useAuth();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { isSubmitting, errors },
    } = useForm<UpdatePasswordFormData>({
        resolver: zodResolver(updatePasswordSchema),
    });

    const onSubmit = async (data: UpdatePasswordFormData) => {
        try {
            const { error } = await updateUserPassword(data.password);
            if (error) throw error;
            toast.success('Password updated successfully! Please log in with your new password.');
            navigate('/login');
        } catch (err: any) {
            toast.error(err.message || 'Failed to update password');
        }
    };

    return (
        <div className="min-h-screen flex font-sans bg-white">
            {/* Left Side - Branding (Hidden on mobile) */}
            <div className="hidden lg:flex w-1/2 bg-[#007F00] flex-col justify-between p-12 relative overflow-hidden">
                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-white/10 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-white/10 blur-3xl"></div>

                <div className="relative z-10">
                    <Link to="/" className="flex items-center gap-3 group w-fit">
                        <div className="relative">
                            <img src="/logo.svg" alt="The Berman Logo" className="h-12 w-auto brightness-0 invert" />
                        </div>
                        <span className="text-2xl font-serif font-bold text-white">The Berman</span>
                    </Link>

                    <div className="mt-20">
                        <h1 className="text-5xl font-serif font-bold text-white leading-tight mb-6">
                            New Password, <br />
                            <span className="text-[#9ACD32]">New Start.</span>
                        </h1>
                        <p className="text-green-100 text-lg max-w-md leading-relaxed">
                            Create a strong password to keep your account secure.
                        </p>
                    </div>
                </div>

                <div className="relative z-10 flex gap-6 text-green-200 text-sm font-medium">
                    <span>Privacy Policy</span>
                    <span>Terms of Service</span>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12 relative">
                <div className="max-w-md w-full">
                    <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#007F00] transition-colors mb-8 font-medium">
                        <ArrowLeft size={16} /> Back to Home
                    </Link>

                    <div className="mb-10">
                        <h2 className="text-3xl font-serif font-bold text-gray-900 mb-3">Update Password</h2>
                        <p className="text-gray-500">Please enter your new password.</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-gray-700">New Password</label>
                            <input
                                {...register('password')}
                                type="password"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#007F00] focus:border-transparent outline-none transition-all"
                                placeholder="••••••••"
                            />
                            {errors.password && <p className="text-red-500 text-xs mt-1 font-medium">{errors.password.message}</p>}
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-bold text-gray-700">Confirm Password</label>
                            <input
                                {...register('confirmPassword')}
                                type="password"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#007F00] focus:border-transparent outline-none transition-all"
                                placeholder="••••••••"
                            />
                            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 font-medium">{errors.confirmPassword.message}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-[#007F00] text-white font-bold py-3.5 rounded-xl hover:bg-green-800 transition-all shadow-lg hover:shadow-green-900/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    Updating...
                                </>
                            ) : (
                                'Update Password'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UpdatePassword;
