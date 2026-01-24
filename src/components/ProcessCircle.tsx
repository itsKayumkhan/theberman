
import React from 'react';

interface ProcessCircleProps {
    icon: React.ReactNode;
    title: string;
    step: string;
}

const ProcessCircle: React.FC<ProcessCircleProps> = ({ icon, title, step }) => {
    return (
        <div className="flex flex-col items-center relative z-10">
            <div className="w-28 h-28 rounded-full bg-[#9ACD32] border-8 border-green-100 flex items-center justify-center text-green-900 shadow-xl mb-6 hover:scale-110 transition duration-300">
                {icon}
            </div>
            <div className="w-8 h-8 rounded-full bg-[#007F00] text-white flex items-center justify-center font-bold text-sm absolute top-0 right-1/4 border-4 border-white">
                {step}
            </div>
            <h3 className="font-bold text-xl text-gray-900 mb-2">{title}</h3>
        </div>
    );
};

export default ProcessCircle;
