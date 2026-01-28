
import { useAuth } from '../hooks/useAuth';
import { LogOut, FileText, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UserDashboard = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#007F00] rounded-lg flex items-center justify-center text-white font-bold">
                            BM
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">My Dashboard</h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-gray-600 hidden md:block">
                            {user?.email}
                        </span>
                        <button
                            onClick={handleSignOut}
                            className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 transition-colors border px-3 py-1.5 rounded-lg hover:bg-gray-50"
                        >
                            <LogOut size={16} />
                            Sign Out
                        </button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center max-w-2xl mx-auto">
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 text-[#007F00]">
                        <User size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back!</h2>
                    <p className="text-gray-500 mb-8">This is your personal dashboard. Tracking of your BER assessments will appear here soon.</p>

                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-left flex gap-4">
                        <div className="bg-white p-2 rounded-md h-fit shadow-sm text-blue-500">
                            <FileText size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 text-sm">No Active Assessments</h4>
                            <p className="text-xs text-gray-500 mt-1">You don't have any pending BER assessments. Contact us to schedule one.</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default UserDashboard;
