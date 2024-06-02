import React from 'react';

interface CardProps {
    title: string;
    value: string | number;
}

const formatNumberWithCommas = (number: number): string => {
    return new Intl.NumberFormat('en-US').format(number);
};

const Card: React.FC<CardProps> = ({ title, value }) => {
    const formattedValue = typeof value === 'number' ? formatNumberWithCommas(value) : value;

    return (
        <div className="card">
            <h3>{title}</h3>
            <p>{formattedValue}</p>
        </div>
    );
};

export default Card;
