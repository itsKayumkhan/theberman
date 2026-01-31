
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Loader2, ArrowLeft, Eye, EyeOff, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState } from 'react';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const { signIn } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Default redirect to /admin if no previous path
    const from = location.state?.from?.pathname || '/admin';

    const {
        register,
        handleSubmit,
        setValue,
        formState: { isSubmitting, errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        try {
            const email = data.email.trim();
            const { data: authData, error } = await signIn(email, data.password);

            if (error) {
                const errorMessage = error.message.toLowerCase();
                if (errorMessage.includes('email not confirmed')) {
                    throw new Error('Please confirm your email address before logging in.');
                }
                if (error.status === 400 || errorMessage.includes('invalid credentials')) {
                    throw new Error('Invalid email or password. Please try again or use "Forgot password".');
                }
                throw error;
            }

            // Redirection logic
            if (authData.user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', authData.user.id)
                    .maybeSingle();

                const role = profile?.role || 'user';

                // Check if we came from a specific page, otherwise redirect based on role
                if (location.state?.from) {
                    navigate(from, { replace: true });
                } else {
                    if (role === 'admin') navigate('/admin', { replace: true });
                    else if (role === 'contractor') navigate('/dashboard/contractor', { replace: true });
                    else navigate('/dashboard/user', { replace: true });
                }
            }
        } catch (err: any) {
            console.error('Login error:', err);
            toast.error(err.message || 'Failed to login');
        }
    };

    const handleQuickLogin = (email: string) => {
        setValue('email', email);
        setValue('password', 'password123'); // Assuming demo users have this password
        // In reality, we shouldn't hardcode passwords, but for a dev "Quick login" button...
        // If the user wants to login with one click, we submit the form immediately.
        handleSubmit(onSubmit)();
    };

    return (
        <div className="min-h-screen flex font-sans bg-white">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex w-1/2 bg-[#007F00] flex-col justify-between p-12 relative overflow-hidden">
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
                            Building a More <br />
                            <span className="text-[#9ACD32]">Sustainable Future.</span>
                        </h1>
                        <p className="text-green-100 text-lg max-w-md leading-relaxed">
                            Access your dashboard to manage BER assessments, view reports, and track energy improvements all in one place.
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
                <div className="absolute top-8 left-8 lg:hidden">
                    <Link to="/" className="flex items-center gap-2">
                        <img src="/logo.svg" alt="Logo" className="h-10" />
                    </Link>
                </div>

                <div className="max-w-md w-full">
                    <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#007F00] transition-colors mb-8 font-medium">
                        <ArrowLeft size={16} /> Back to Home
                    </Link>

                    <div className="mb-10">
                        <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">Welcome back</h2>
                        <p className="text-gray-500">Sign in to manage your sustainable projects.</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-gray-700">Email</label>
                            <input
                                {...register('email')}
                                type="email"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#007F00] focus:border-transparent outline-none transition-all"
                                placeholder="name@company.com"
                            />
                            {errors.email && <p className="text-red-500 text-xs mt-1 font-medium">{errors.email.message}</p>}
                        </div>

                        <div className="space-y-1">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-bold text-gray-700">Password</label>
                                <Link to="/forgot-password" className="text-xs font-bold text-[#007F00] hover:underline">Forgot password?</Link>
                            </div>
                            <div className="relative">
                                <input
                                    {...register('password')}
                                    type={showPassword ? 'text' : 'password'}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#007F00] focus:border-transparent outline-none transition-all"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.password && <p className="text-red-500 text-xs mt-1 font-medium">{errors.password.message}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-[#007F00] text-white font-bold py-3.5 rounded-xl hover:bg-green-800 transition-all shadow-lg hover:shadow-green-900/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Sign In
                                    <LogIn size={18} />
                                </>
                            )}
                        </button>

                        <div className="text-center mt-8">
                            <p className="text-gray-500">
                                Don't have an account?{' '}
                                <Link to="/signup" className="text-[#007F00] font-bold hover:underline">
                                    Sign up for free
                                </Link>
                            </p>
                        </div>

                        {/* Quick Login for development */}
                        <div className="mt-12 pt-8 border-t border-gray-100">
                            <p className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Development shortcuts</p>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => handleQuickLogin('admin@theberman.eu')}
                                    className="px-3 py-2 text-[10px] font-bold border border-gray-200 rounded-lg hover:border-green-200 hover:bg-green-50 text-gray-500 hover:text-[#007F00] transition-all"
                                >
                                    Login as Admin
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleQuickLogin('asmitgawandedigitalheroes@gmail.com')}
                                    className="px-3 py-2 text-[10px] font-bold border border-gray-200 rounded-lg hover:border-blue-200 hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all"
                                >
                                    Login as Contractor
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
