
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ServiceCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    linkTo?: string;
    compact?: boolean;
    showLink?: boolean;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ icon, title, description, linkTo = "/services", compact = false, showLink = true }) => {
    if (compact) {
        // Simpler design for "Other Services" grid
        return (
            <div className="group p-8 rounded-2xl bg-white border border-gray-100 hover:border-[#9ACD32] hover:shadow-xl transition duration-300">
                <div className="h-14 w-14 bg-green-50 rounded-xl flex items-center justify-center text-[#007F00] mb-6 group-hover:scale-110 transition">
                    {icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">{title}</h3>
                <p className="text-gray-600 leading-relaxed group-hover:text-gray-700">
                    {description}
                </p>
                {showLink && (
                    <div className="mt-6 flex items-center text-[#007F00] font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
                        View Details <ArrowRight size={16} className="ml-1" />
                    </div>
                )}
            </div>
        )
    }

    // Premium design from Home page
    return (
        <div className="group bg-white p-10 rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 border-t-4 border-transparent hover:border-[#9ACD32] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                {React.cloneElement(icon as React.ReactElement<any>, { size: 64, className: 'text-[#007F00]' })}
            </div>

            <div className="w-16 h-16 bg-green-50 rounded-xl flex items-center justify-center text-[#007F00] mb-6 group-hover:scale-110 transition duration-300 relative z-10">
                {icon}
            </div>
            <h3 className="text-2xl font-bold mb-3 font-serif relative z-10">{title}</h3>
            <p className="text-gray-600 leading-relaxed mb-6 relative z-10">{description}</p>
            {showLink && (
                <Link to={linkTo} className="inline-flex items-center text-[#007F00] font-bold text-sm group-hover:translate-x-2 transition-transform relative z-10">
                    View Details <ArrowRight size={16} className="ml-2" />
                </Link>
            )}
        </div>
    );
};

export default ServiceCard;
