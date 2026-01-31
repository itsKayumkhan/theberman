import { X } from 'lucide-react';
import QuoteFormModule from './QuoteFormModule';

interface QuoteModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const QuoteModal = ({ isOpen, onClose }: QuoteModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div className="relative min-h-screen flex items-center justify-center p-4 md:p-6 lg:p-8">
                <div className="relative w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 overflow-hidden">

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-all z-50"
                    >
                        <X size={24} />
                    </button>

                    {/* Form Module */}
                    <div className="max-h-[85vh] overflow-y-auto custom-scrollbar">
                        <QuoteFormModule onClose={onClose} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuoteModal;
