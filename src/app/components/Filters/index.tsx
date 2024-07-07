import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';
import Modal from 'react-modal';
import 'react-datepicker/dist/react-datepicker.css';
import './custom-datapicker.css';
import './filters.css';
import { FaChevronDown } from 'react-icons/fa';
import { HiAdjustmentsHorizontal } from "react-icons/hi2";
import useDashboardStore from '@/store/useDashboardStore';

interface FiltersProps {
    setFilter: (filter: string) => void;
    show15MinFilter: boolean; 
}

Modal.setAppElement('body');

type Option = {
    label: string;
    value: string;
};

const createOption = (label: string, value: string): Option => ({ label, value });

const options: Option[] = [
    createOption('Last 15 minutes', '15m'),
    createOption('Today', 'today'),
    createOption('Yesterday', 'yesterday'),
    createOption('Last 7 days', '7d'),
    createOption('Last 30 days', '30d'),
    createOption('Last 90 days', '90d'),
    createOption('Last Year', '365d'),
    createOption('Last Week', 'last_week'),
    createOption('Custom date range', 'custom')
];

const Filters: React.FC<FiltersProps> = ({ setFilter, show15MinFilter }) => {
    const { filter } = useDashboardStore();
    const [customDateRange, setCustomDateRange] = useState<[Date | null, Date | null]>([null, null]);
    const [startDate, endDate] = customDateRange;
    const [selectedOption, setSelectedOption] = useState<string>(filter);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const handleButtonClick = (value: string) => {
        setSelectedOption(value);
        localStorage.setItem('selectedOption', value);
        if (value !== 'custom') {
            setFilter(value);
            setCustomDateRange([null, null]);
        } else {
            setModalIsOpen(true);
        }
        setDropdownOpen(false);
    };

    useEffect(() => {
        if (selectedOption && selectedOption !== 'custom' && selectedOption !== filter) {
            setFilter(selectedOption);
        }
    }, [selectedOption, setFilter, filter]);

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

    // Use a prop to determine if the 15m filter should be included
    const availableOptions = show15MinFilter ? options : options.filter(option => option.value !== '15m');

    return (
        <div className="filters">
            <div className="filter-container">
                <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="filter-button"
                >
                    {availableOptions.find(option => option.value === selectedOption)?.label || 'Select Filter'}
                    <div className="filter-icon">
                        <FaChevronDown />
                    </div>
                </button>
                <div className={`filter-dropdown ${dropdownOpen ? 'open' : ''}`}>
                    {availableOptions.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => handleButtonClick(option.value)}
                            className={`filter-button ${selectedOption === option.value ? 'active' : ''}`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>
            <HiAdjustmentsHorizontal />
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
