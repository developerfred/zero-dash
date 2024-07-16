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
    createOption('Last 24 hours', '24h'),
    createOption('Last 48 hours', '48h'),
    createOption('Last 7 days', '7d'),
    createOption('Last 30 days', '30d'),
    createOption('Last 90 days', '90d'),
    createOption('Last 365 days', '365d'), 
    createOption('Custom date range', 'custom')
];

const Filters: React.FC<FiltersProps> = ({ setFilter, show15MinFilter }) => {
    const { filter } = useDashboardStore();
    const [customDateRange, setCustomDateRange] = useState<[Date | null, Date | null]>([null, null]);
    const [startDate, endDate] = customDateRange;
    const [selectedOption, setSelectedOption] = useState<string>('7d'); 
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const handleButtonClick = (value: string) => {
        if (value === '15m' && !show15MinFilter) {
            setFilter('7d');
            setSelectedOption('7d');
            localStorage.setItem('selectedOption', '7d');
        } else {
            setSelectedOption(value);
            if (value !== 'custom') {
                setFilter(value);
                localStorage.setItem('selectedOption', value);
            } else {
                setModalIsOpen(true);
            }
            setCustomDateRange([null, null]);
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
