import React, { memo, useState, useEffect } from 'react';
import Loading from '@/components/Loading';
import './Card.css';

interface CardProps {
    title: string;
    value: string | number;
    isLoading?: boolean;
}

const formatNumberWithCommas = (number: number): string => {
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

    const formattedValue = typeof value === 'number' ? formatNumberWithCommas(value) : value;

    return (
        <div className="card">
            <h3>{title}</h3>
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
