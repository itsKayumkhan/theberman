
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, User, HardHat, Check, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const signupSchema = z.object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
    role: z.enum(['user', 'contractor']),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type SignUpFormData = z.infer<typeof signupSchema>;

const SignUp = () => {
    const { signUp } = useAuth();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { isSubmitting, errors },
    } = useForm<SignUpFormData>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            role: 'user', // Default to user
        }
    });

    const selectedRole = watch('role');

    const onSubmit = async (data: SignUpFormData) => {
        try {
            const { error, data: authData } = await signUp(data.email, data.password, data.fullName, data.role);
            if (error) throw error;

            if (authData?.user) {
                toast.success('Account created successfully! Please log in.');
                navigate('/login');
            }
        } catch (err: any) {
            toast.error(err.message || 'Failed to create account');
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
                            Join the <br />
                            <span className="text-[#9ACD32]">Green Revolution.</span>
                        </h1>
                        <p className="text-green-100 text-lg max-w-md leading-relaxed">
                            Create your account to start managing your energy ratings efficiently. Whether you're a homeowner or a contractor, we have the tools you need.
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
                {/* Mobile Logo (Visible only on mobile) */}
                <div className="absolute top-8 left-8 lg:hidden">
                    <Link to="/" className="flex items-center gap-2">
                        <img src="/logo.svg" alt="Logo" className="h-10" />
                    </Link>
                </div>

                <div className="max-w-md w-full">
                    <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#007F00] transition-colors mb-8 font-medium">
                        <ArrowLeft size={16} /> Back to Home
                    </Link>

                    <div className="mb-6">
                        <h2 className="text-3xl font-serif font-bold text-gray-900 mb-3">Create Account</h2>
                        <p className="text-gray-500">Sign up to get started.</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                        {/* Role Selection */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div
                                onClick={() => setValue('role', 'user')}
                                className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center justify-center gap-2 transition-all ${selectedRole === 'user'
                                    ? 'border-[#007F00] bg-green-50 text-[#007F00]'
                                    : 'border-gray-200 hover:border-green-200 text-gray-500'
                                    }`}
                            >
                                <div className={`p-2 rounded-full ${selectedRole === 'user' ? 'bg-[#007F00] text-white' : 'bg-gray-100'}`}>
                                    <User size={20} />
                                </div>
                                <span className="font-bold text-sm">Homeowner</span>
                                {selectedRole === 'user' && <div className="absolute top-2 right-2"><Check size={16} /></div>}
                            </div>

                            <div
                                onClick={() => setValue('role', 'contractor')}
                                className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center justify-center gap-2 transition-all ${selectedRole === 'contractor'
                                    ? 'border-[#007F00] bg-green-50 text-[#007F00]'
                                    : 'border-gray-200 hover:border-green-200 text-gray-500'
                                    }`}
                            >
                                <div className={`p-2 rounded-full ${selectedRole === 'contractor' ? 'bg-[#007F00] text-white' : 'bg-gray-100'}`}>
                                    <HardHat size={20} />
                                </div>
                                <span className="font-bold text-sm">Contractor</span>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-bold text-gray-700">Full Name</label>
                            <input
                                {...register('fullName')}
                                type="text"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#007F00] focus:border-transparent outline-none transition-all"
                                placeholder="John Doe"
                            />
                            {errors.fullName && <p className="text-red-500 text-xs mt-1 font-medium">{errors.fullName.message}</p>}
                        </div>

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

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-bold text-gray-700">Password</label>
                                <input
                                    {...register('password')}
                                    type="password"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#007F00] focus:border-transparent outline-none transition-all"
                                    placeholder="••••••••"
                                />
                                {errors.password && <p className="text-red-500 text-xs mt-1 font-medium">{errors.password.message}</p>}
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-bold text-gray-700">Confirm</label>
                                <input
                                    {...register('confirmPassword')}
                                    type="password"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#007F00] focus:border-transparent outline-none transition-all"
                                    placeholder="••••••••"
                                />
                                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 font-medium">{errors.confirmPassword.message}</p>}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-[#007F00] text-white font-bold py-3.5 rounded-xl hover:bg-green-800 transition-all shadow-lg hover:shadow-green-900/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-6"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    Creating Account...
                                </>
                            ) : (
                                'Sign Up'
                            )}
                        </button>

                        <div className="text-center mt-6">
                            <p className="text-gray-500">
                                Already have an account?{' '}
                                <Link to="/login" className="text-[#007F00] font-bold hover:underline">
                                    Log in
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
