
import React from 'react';
import { Star } from 'lucide-react';

interface TestimonialCardProps {
    quote: string;
    author: string;
    location: string;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ quote, author, location }) => {
    return (
        <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 relative">
            <div className="text-[#9ACD32] mb-4">
                {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={20} className="inline fill-current" />
                ))}
            </div>
            <p className="text-gray-700 italic mb-6">"{quote}"</p>
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-500">
                    {author[0]}
                </div>
                <div>
                    <p className="font-bold text-sm text-gray-900">{author}</p>
                    <p className="text-xs text-gray-500">{location}</p>
                </div>
            </div>
        </div>
    );
};

export default TestimonialCard;
