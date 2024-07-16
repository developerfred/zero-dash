import React, { useState, useEffect, useRef, useCallback } from 'react';
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
    const [selectedOption, setSelectedOption] = useState<string>('7d');
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    const closeModal = useCallback(() => setModalIsOpen(false), []);

    const handleDateChange = useCallback((dates: [Date | null, Date | null]) => {
        setCustomDateRange(dates);
    }, []);

    const handleButtonClick = useCallback((value: string) => {
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
    }, [setFilter, show15MinFilter]);

    useEffect(() => {
        if (selectedOption && selectedOption !== 'custom' && selectedOption !== filter) {
            setFilter(selectedOption);
        }
    }, [selectedOption, setFilter, filter]);

    useEffect(() => {
        if (selectedOption === 'custom' && customDateRange[0] && customDateRange[1]) {
            const formattedStartDate = format(customDateRange[0], 'yyyy-MM-dd');
            const formattedEndDate = format(customDateRange[1], 'yyyy-MM-dd');
            setFilter(`custom_${formattedStartDate}_${formattedEndDate}`);
            setModalIsOpen(false);
        }
    }, [customDateRange, selectedOption, setFilter]);

    const availableOptions = show15MinFilter ? options : options.filter(option => option.value !== '15m');

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="filters">
            <div className="filter-container" ref={dropdownRef}>
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
                            selected={customDateRange[0]}
                            onChange={handleDateChange}
                            startDate={customDateRange[0]}
                            endDate={customDateRange[1]}
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
