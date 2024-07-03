import React, { memo, useState, useEffect } from 'react';
import Loading from '@/components/Loading';
import './Card.css';
import { getIconForTitle } from '@/app/config/icons';

interface CardProps {
    title: string;
    value: string | number;
    isLoading?: boolean;
}

const formatNumberWithCommas = (value: string | number): string => {
    const number = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(number)) return value.toString();
    return new Intl.NumberFormat('en-US').format(number);
};


const Card: React.FC<CardProps> = ({ title, value, isLoading }) => {
    const [showLoading, setShowLoading] = useState(false);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isLoading) {
            timer = setTimeout(() => {
                setShowLoading(true);
            }, 500);
        } else {
            setShowLoading(false);
        }
        return () => clearTimeout(timer);
    }, [isLoading]);

    const formattedValue = (typeof value === 'number' || (typeof value === 'string' && !isNaN(parseFloat(value)))) ? formatNumberWithCommas(value) : value;

    return (
        <div className="card">
            <div className='card-title-wrapper'>
            {getIconForTitle(title)}
            <h3>{title}</h3>
            </div>
            <div className="card-content">
                <div className={`card-value-wrapper ${showLoading ? 'loading' : ''}`}>
                    {showLoading || value === null || value === undefined || value === '' ? (
                        <Loading />
                    ) : (
                        <p className="card-value">{formattedValue}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default memo(Card);
