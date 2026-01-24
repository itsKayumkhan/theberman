
import React from 'react';

interface StatItemProps {
    number: string;
    label: string;
    icon: React.ReactNode;
}

const StatItem: React.FC<StatItemProps> = ({ number, label, icon }) => {
    return (
        <div className="flex flex-col items-center group">
            <div className="w-14 h-14 bg-[#9ACD32] rounded-full flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition duration-300">
                {icon}
            </div>
            <div className="text-4xl font-bold font-serif mb-1">{number}</div>
            <div className="text-sm text-green-100 font-bold uppercase tracking-wider opacity-80">{label}</div>
        </div>
    );
};

export default StatItem;
