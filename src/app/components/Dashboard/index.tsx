// @ts-nocheck

import React, { useEffect, useState } from 'react';
import Filters from '@/components/Filters';
import Chart from '@/components/Chart';
import Card from '@/components/Card';
import ProductivitySection from './ProductivitySection';
import ZeroDomainsSection from './ZeroDomainsSection';
import useDashboardStore from '@/store/useDashboardStore';
import '@/components/Dashboard/dashboard.css';
import ZeroGlobal from './ZeroGlobal';
import Loading from '@/components/Loading';
import MeowSection from './MeowSection';
import FinanceSection from './FinanceSection';
import WildSection from './WildSection';

interface DashboardProps {
    activeSection: string;
}

const Dashboard: React.FC<DashboardProps> = ({ activeSection }) => {
    const { filter, data, znsData, setFilter, fetchDashboardDataByFilter, isLoadingDashboard } = useDashboardStore();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setFilter('7d');
    }, [setFilter]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            await fetchDashboardDataByFilter(filter);            
            setLoading(false);
        };
        fetchData();
    }, [filter, fetchDashboardDataByFilter]);


    const totals = {
        dailyActiveUsers: data.reduce((acc, data) => acc + data.dailyActiveUsers, 0),
        totalMessagesSent: data.reduce((acc, data) => acc + data.totalMessagesSent, 0),
        userSignUps: data.reduce((acc, data) => acc + data.userSignUps, 0),
        newlyMintedDomains: data.reduce((acc, data) => acc + data.newlyMintedDomains, 0),
        totalRewardsEarned: data.reduce((acc, data) => acc + data.totalRewardsEarned, 0),
        totalRegistrations: znsData.reduce((acc, item) => acc + item.numRegistrars, 0),
        totalWorlds: znsData.reduce((acc, item) => acc + item.worldsCreated, 0),
        totalDomains: znsData.reduce((acc, item) => acc + item.numDomainsRegistered, 0),
    };

    const sectionComponents = {
        Zero: ZeroGlobal,
        ZNS: ZeroDomainsSection,
        MEOW: MeowSection,
        WILD: WildSection,
        Finance: FinanceSection,
        Productivity: ProductivitySection,
    };

    const renderSection = () => {
        const SectionComponent = sectionComponents[activeSection];
        return SectionComponent ? <SectionComponent /> : null;
    };

    return (
        <div className="dashboard">
            <Filters setFilter={setFilter} />
            {renderSection()}
        </div>
    );
};

export default Dashboard;