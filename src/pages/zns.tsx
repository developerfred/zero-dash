'use client';
import React from 'react';
import Dashboard from '@/components/Dashboard';
import Navbar from '@/components/Navbar';
import "./../app/globals.css";

const ZnsPage: React.FC = () => {
    return (
        <>
            <Navbar />
            <Dashboard dashboardType="ZNS" />
        </>
    );
};

export default ZnsPage;
