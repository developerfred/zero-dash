'use client';

import React, { useState, useEffect } from 'react';
import Dashboard from '@/components/Dashboard';
import Navbar from '@/components/Navbar';
import useDashboardStore from '@/store/useDashboardStore';

export default function Home() {
  const [activeSection, setActiveSection] = useState('Zero');
  const { filter, setFilter } = useDashboardStore();

  return (
    <>
      <div className="flex flex-col items-center w-full max-w-screen-2xl mx-auto">
        <Navbar activeSection={activeSection} setActiveSection={setActiveSection} />      
        <Dashboard activeSection={activeSection} />
      </div> 
    </>
  );
}
