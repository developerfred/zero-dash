import React from 'react';
import Loading from '@/components/Loading';
import './Card.css'; // Supondo que estamos adicionando estilos CSS em um arquivo separado

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
            <div className="card-content">
                <div className={`card-value-wrapper ${isLoading ? 'loading' : ''}`}>
                    {isLoading ? (
                        <Loading />
                    ) : (
                        <p className="card-value">{formattedValue}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Card;
