import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';
import Modal from 'react-modal';
import 'react-datepicker/dist/react-datepicker.css';
import './custom-datapicker.css';
import './filters.css';

interface FiltersProps {
    setFilter: (filter: string) => void;
}

Modal.setAppElement('body'); 

const Filters: React.FC<FiltersProps> = ({ setFilter }) => {
    const [customDateRange, setCustomDateRange] = useState<[Date | null, Date | null]>([null, null]);
    const [startDate, endDate] = customDateRange;
    const [selectedOption, setSelectedOption] = useState<string>();
    const [modalIsOpen, setModalIsOpen] = useState(false);

    const options = [
        { label: 'Last day', value: '24h' },
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
        setSelectedOption(value);
        localStorage.setItem('selectedOption', value);
        if (value !== 'custom') {
            setFilter(value);
            setCustomDateRange([null, null]);
        } else {
            setModalIsOpen(true);
        }
    };

    useEffect(() => {
        if (selectedOption && selectedOption !== 'custom') {
            setFilter(selectedOption);
        }
    }, [selectedOption, setFilter]);

    useEffect(() => {
        if (selectedOption === 'custom' && startDate && endDate) {
            const formattedStartDate = format(startDate, 'yyyy-MM-dd');
            const formattedEndDate = format(endDate, 'yyyy-MM-dd');
            setFilter(`custom_${formattedStartDate}_${formattedEndDate}`);
            setModalIsOpen(false);
        }
    }, [startDate, endDate, selectedOption, setFilter]);

    const closeModal = () => {
        setModalIsOpen(false);
    };

    const handleDateChange = (dates: [Date | null, Date | null]) => {
        setCustomDateRange(dates);
    };

    return (
        <div className="filters">
            <div className="filter-buttons">
                {options.map((option) => (
                    <button
                        key={option.value}
                        onClick={() => handleButtonClick(option.value)}
                        className={`filter-button ${selectedOption === option.value ? 'active' : ''}`}
                    >
                        {option.label}
                    </button>
                ))}
            </div>
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                contentLabel="Select Custom Date Range"
                className="modal"
                overlayClassName="overlay"
            >
                <div className="modal-content">
                    <h2>Select Custom Date Range</h2>
                    <div className="datepicker-container">
                        <DatePicker
                            selected={startDate}
                            onChange={handleDateChange}
                            startDate={startDate}
                            endDate={endDate}
                            selectsRange
                            inline
                        />
                    </div>
                    <button onClick={closeModal} className="modal-close-button">Apply</button>
                </div>
            </Modal>
        </div>
    );
};

export default Filters;
