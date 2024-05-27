'use client';


import Dashboard from "@/components/Dashboard";
import Navbar  from "@/components/Navbar";

export default function Home() {
  return (
    <>
      <Navbar />
      <Dashboard dashboardType="Zero" />
    </>
  );
}
