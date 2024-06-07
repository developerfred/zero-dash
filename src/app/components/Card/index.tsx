import React from 'react';
import Loading from '@/components/Loading';

interface CardProps {
    title: string;
    value: string | number;
    isLoading?: boolean;
}

const formatNumberWithCommas = (number: number): string => {
    return new Intl.NumberFormat('en-US').format(number);
};

const Card: React.FC<CardProps> = ({ title, value, isLoading }) => {
    const formattedValue = typeof value === 'number' ? formatNumberWithCommas(value) : value;

    return (
        <div className="card">
            <h3>{title}</h3>
            {isLoading ? (
                <Loading />
            ) : (
                <p>{formattedValue}</p>
            )}
        </div>
    );
};

export default Card;
