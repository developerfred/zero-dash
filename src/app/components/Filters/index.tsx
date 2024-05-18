import React, { useState } from 'react';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './filters.css';

interface FiltersProps {
    setFilter: (filter: string) => void;
}

const Filters: React.FC<FiltersProps> = ({ setFilter }) => {
    const [customDateRange, setCustomDateRange] = useState<[Date | null, Date | null]>([null, null]);
    const [startDate, endDate] = customDateRange;

    const options = [
        { label: 'Last 24 hours', value: '24h' },
        { label: 'Last 7 days', value: '7d' },
        { label: 'Last 30 days', value: '30d' },
        { label: 'Last 90 days', value: '90d' },
        { label: 'Last 365 days', value: '365d' },
        { label: 'Today', value: 'today' },
        { label: 'Yesterday', value: 'yesterday' },
        { label: 'Last Week', value: 'last_week' },
        { label: 'Last Month', value: 'last_month' },
        { label: 'Last Year', value: 'last_year' },
        { label: 'Custom date range', value: 'custom' },
    ];

    const handleButtonClick = (value: string) => {
        setFilter(value);
        if (value !== 'custom') {
            setCustomDateRange([null, null]);
        }
    };

    return (
        <div className="filters">
            <div className="filter-buttons">
                {options.map((option) => (
                    <button
                        key={option.value}
                        onClick={() => handleButtonClick(option.value)}
                        className="filter-button"
                    >
                        {option.label}
                    </button>
                ))}
            </div>
            {startDate && endDate && (
                <div className="date-range">
                    <DatePicker
                        selected={startDate}
                        onChange={(date: [Date, Date]) => setCustomDateRange(date)}
                        startDate={startDate}
                        endDate={endDate}
                        selectsRange
                        inline
                    />
                </div>
            )}
        </div>
    );
};

export default Filters;
