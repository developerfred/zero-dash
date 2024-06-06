'use client';

import React, { useState } from 'react';
import Dashboard from '@/components/Dashboard';
import Navbar from '@/components/Navbar';

export default function Home() {
  const [activeSection, setActiveSection] = useState('Zero'); 

  return (
    <>
      <Navbar activeSection={activeSection} setActiveSection={setActiveSection} />
      <Dashboard activeSection={activeSection} />
    </>
  );
}