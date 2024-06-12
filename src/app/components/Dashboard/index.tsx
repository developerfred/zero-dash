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

interface DashboardProps {
    activeSection: string;
}

const Dashboard: React.FC<DashboardProps> = ({ activeSection }) => {
    const { filter, data, znsData, setFilter, fetchDashboardDataByFilter, fetchZnsData, isLoadingDashboard } = useDashboardStore();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setFilter('7d');
    }, [setFilter]);
    
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            await fetchDashboardDataByFilter(filter);
            await fetchZnsData(filter);
            setLoading(false);
        };
        fetchData();
    }, [filter, fetchDashboardDataByFilter, fetchZnsData]);


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

    const renderSection = () => {
        switch (activeSection) {
            case 'Zero':
                return (
                       <ZeroGlobal />);
            case 'ZNS':
                return (
                    <ZeroDomainsSection />
                );
            case 'MEOW':
                return (
                    <MeowSection />
                );
            case 'WILD':
                return (
                    <div className="section">
                        <h2 id="zero-wild">WILD</h2>
                        <div className="zero-wild">                            
                            <div className="cards">
                                <Card title="WILD Active Users" value={totals.dailyActiveUsers} isLoading={isLoadingDashboard} />
                                <Card title="WILD" value={totals.totalMessagesSent} isLoading={isLoadingDashboard} />
                                <Card title="User Sign Ups" value={totals.userSignUps} isLoading={isLoadingDashboard} />
                                <Card title="Newly Minted Domains" value={totals.newlyMintedDomains} isLoading={isLoadingDashboard} />
                                <Card title="Total Rewards Earned" value={totals.totalRewardsEarned} isLoading={isLoadingDashboard} />
                            </div>
                            <div className="charts">
                                <div className="chart-row">
                                    <div className="chart-container">
                                        <h3>WILD Active Users</h3>
                                        <Chart data={data} dataKey="dailyActiveUsers" chartType="line"  />
                                    </div>
                                    <div className="chart-container">
                                        <h3>Total Messages Sent</h3>
                                        <Chart data={data} dataKey="totalMessagesSent" chartType="line" />
                                    </div>
                                </div>
                                <div className="chart-row">
                                    <div className="chart-container">
                                        <h3>User Sign Ups</h3>
                                        <Chart data={data} dataKey="userSignUps" chartType="line" />
                                    </div>
                                    <div className="chart-container">
                                        <h3>Newly Minted Domains</h3>
                                        <Chart data={data} dataKey="newlyMintedDomains" chartType="line" />
                                    </div>
                                </div>
                                <div className="chart-row">
                                    <div className="chart-container">
                                        <h3>Total Rewards Earned</h3>
                                        <Chart data={data} dataKey="totalRewardsEarned" chartType="line" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'Finance':
                return (
                    <div className="section">
                        <h2 id="zero-finance">Finance</h2>
                        <div className="zero-finance">                            
                            <div className="cards">
                                <Card title="Finance Active Users" value={totals.dailyActiveUsers} isLoading={isLoadingDashboard} />
                                <Card title="Finance Messages" value={totals.totalMessagesSent} isLoading={isLoadingDashboard} />
                                <Card title="User Sign Ups" value={totals.userSignUps} isLoading={isLoadingDashboard} />
                                <Card title="Newly Minted Domains" value={totals.newlyMintedDomains} isLoading={isLoadingDashboard} />
                                <Card title="Total Rewards Earned" value={totals.totalRewardsEarned} isLoading={isLoadingDashboard} />
                            </div>
                            <div className="charts">
                                <div className="chart-row">
                                    <div className="chart-container">
                                        <h3>Finance Active Users</h3>
                                        <Chart data={data} dataKey="dailyActiveUsers" chartType="line" />
                                    </div>
                                    <div className="chart-container">
                                        <h3>Total Messages Sent</h3>
                                        <Chart data={data} dataKey="totalMessagesSent" chartType="line" />
                                    </div>
                                </div>
                                <div className="chart-row">
                                    <div className="chart-container">
                                        <h3>User Sign Ups</h3>
                                        <Chart data={data} dataKey="userSignUps" chartType="line" />
                                    </div>
                                    <div className="chart-container">
                                        <h3>Newly Minted Domains</h3>
                                        <Chart data={data} dataKey="newlyMintedDomains" chartType="line" />
                                    </div>
                                </div>
                                <div className="chart-row">
                                    <div className="chart-container">
                                        <h3>Total Rewards Earned</h3>
                                        <Chart data={data} dataKey="totalRewardsEarned" chartType="line" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'Productivity':
                return (
                    <ProductivitySection />
                );
            default:
                return null;
        }
    };

    return (
        <div className="dashboard">
            <Filters setFilter={setFilter} />
            {renderSection()}
        </div>
    );
};

export default Dashboard;