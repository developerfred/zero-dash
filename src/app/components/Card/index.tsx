import React from 'react';

interface CardProps {
    title: string;
    value: number;
}

const formatNumberWithCommas = (number: number): string => {
    return new Intl.NumberFormat('en-US').format(number);
};

const Card: React.FC<CardProps> = ({ title, value }) => {
    return (
        <div className="card">
            <h3>{title}</h3>
            <p>{formatNumberWithCommas(value)}</p>
        </div>
    );
};

export default Card;
