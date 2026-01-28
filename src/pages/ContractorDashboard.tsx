
import { useAuth } from '../hooks/useAuth';
import { LogOut, HardHat } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ContractorDashboard = () => {
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
                        <div className="w-10 h-10 bg-[#007EA7] rounded-lg flex items-center justify-center text-white font-bold">
                            BM
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Partner Portal</h1>
                            <span className="text-xs text-[#007EA7] font-bold uppercase tracking-wide">Contractor Access</span>
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
                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 text-[#007EA7]">
                        <HardHat size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Contractor Dashboard</h2>
                    <p className="text-gray-500 mb-8">Access assigned jobs and submit reports here.</p>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 text-center hover:bg-gray-100 transition-colors cursor-pointer">
                            <h3 className="font-bold text-2xl text-gray-900">0</h3>
                            <p className="text-xs text-gray-500 uppercase tracking-wide mt-1">Pending Jobs</p>
                        </div>
                        <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 text-center hover:bg-gray-100 transition-colors cursor-pointer">
                            <h3 className="font-bold text-2xl text-gray-900">0</h3>
                            <p className="text-xs text-gray-500 uppercase tracking-wide mt-1">Completed</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ContractorDashboard;
