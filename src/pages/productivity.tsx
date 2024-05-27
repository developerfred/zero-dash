'use client';

import React from 'react';
import Dashboard from '@/components/Dashboard';
import Navbar from '@/components/Navbar';
import "./../app/globals.css";

const ProductivityPage: React.FC = () => {
    return (
        <>
            <Navbar />
            <Dashboard dashboardType="Productivity" />
        </>
    );
};

export default ProductivityPage;
