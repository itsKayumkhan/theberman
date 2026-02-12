import { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface DatePickerProps {
    value: string; // YYYY-MM-DD
    onChange: (date: string) => void;
    min?: string; // YYYY-MM-DD
    max?: string; // YYYY-MM-DD
    label?: string;
    placeholder?: string;
    className?: string;
}

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

export const DatePicker = ({ value, onChange, min, max, label, placeholder = 'Select date', className = '' }: DatePickerProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Parse initial value or default to today for calendar view
    const initialDate = value ? new Date(value) : new Date();
    const [viewDate, setViewDate] = useState(initialDate); // Controls the month being viewed

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Sync view date if value changes externally
    useEffect(() => {
        if (value) {
            setViewDate(new Date(value));
        }
    }, [value]);

    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const handlePrevMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    };

    const handleDateSelect = (day: number) => {
        const selectedDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        // Avoid timezone issues by using local date components
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const dayStr = String(selectedDate.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${dayStr}`;

        onChange(dateString);
        setIsOpen(false);
    };

    const isDateDisabled = (day: number) => {
        const currentCheckDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        const checkDateStr = currentCheckDate.toISOString().split('T')[0];

        if (min && checkDateStr < min) return true;
        if (max && checkDateStr > max) return true;
        return false;
    };

    const isSelected = (day: number) => {
        if (!value) return false;
        const selected = new Date(value);
        return (
            selected.getDate() === day &&
            selected.getMonth() === viewDate.getMonth() &&
            selected.getFullYear() === viewDate.getFullYear()
        );
    };

    const isToday = (day: number) => {
        const today = new Date();
        return (
            today.getDate() === day &&
            today.getMonth() === viewDate.getMonth() &&
            today.getFullYear() === viewDate.getFullYear()
        );
    };

    const renderDays = () => {
        const daysInMonth = getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth());
        const firstDay = getFirstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth());
        const days = [];

        // Empty slots for previous month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-9 w-9" />);
        }

        // Days of current month
        for (let day = 1; day <= daysInMonth; day++) {
            const disabled = isDateDisabled(day);
            const selected = isSelected(day);
            const today = isToday(day);

            days.push(
                <button
                    key={day}
                    onClick={(e) => {
                        e.preventDefault();
                        if (!disabled) handleDateSelect(day);
                    }}
                    disabled={disabled}
                    className={`
                        h-9 w-9 rounded-full flex items-center justify-center text-sm transition-all
                        ${selected
                            ? 'bg-[#007EA7] text-white font-bold shadow-md shadow-blue-200'
                            : disabled
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'text-gray-700 hover:bg-gray-100 font-medium'
                        }
                        ${!selected && today ? 'border border-[#007EA7] text-[#007EA7] font-bold' : ''}
                    `}
                >
                    {day}
                </button>
            );
        }

        return days;
    };

    // Format display value (MM/DD/YYYY to match user request image)
    const displayValue = value ? new Date(value).toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
    }) : '';

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            {label && (
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                    {label}
                </label>
            )}

            <div className="relative">
                <input
                    type="text"
                    readOnly
                    value={displayValue || ''}
                    placeholder={placeholder}
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full border-2 border-gray-100 rounded-2xl pl-4 pr-10 py-3 focus:outline-none focus:border-[#007EA7] transition-colors font-bold text-gray-900 cursor-pointer caret-transparent bg-white"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <Calendar size={20} />
                </div>
            </div>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 p-4 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 w-[300px] animate-in fade-in zoom-in-95 duration-200">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <span className="font-bold text-gray-900 text-sm">
                            {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
                        </span>
                        <div className="flex gap-1">
                            <button
                                onClick={(e) => { e.preventDefault(); handlePrevMonth(); }}
                                className="p-1 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <button
                                onClick={(e) => { e.preventDefault(); handleNextMonth(); }}
                                className="p-1 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Days of Week */}
                    <div className="grid grid-cols-7 mb-2">
                        {DAYS_OF_WEEK.map(day => (
                            <div key={day} className="h-8 flex items-center justify-center text-xs font-medium text-gray-400">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Days Grid */}
                    <div className="grid grid-cols-7 gap-y-1 justify-items-center">
                        {renderDays()}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-between mt-4 pt-3 border-t border-gray-100">
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                onChange('');
                                setIsOpen(false);
                            }}
                            className="text-xs font-medium text-gray-500 hover:text-gray-700"
                        >
                            Clear
                        </button>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                const today = new Date();
                                const year = today.getFullYear();
                                const month = String(today.getMonth() + 1).padStart(2, '0');
                                const day = String(today.getDate()).padStart(2, '0');
                                const dateString = `${year}-${month}-${day}`;

                                // Only set if not disabled
                                if (!min || dateString >= min) {
                                    onChange(dateString);
                                    setViewDate(today);
                                    setIsOpen(false);
                                }
                            }}
                            className="text-xs font-bold text-[#007EA7] hover:text-[#005F7E]"
                        >
                            Today
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
