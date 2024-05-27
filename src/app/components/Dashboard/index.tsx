import React, { useEffect, useState } from 'react';
import Filters from '@/components/Filters';
import Chart from '@/components/Chart';
import Card from '@/components/Card';
import useDashboardStore from '@/store/useDashboardStore';
import '@/components/Dashboard/dashboard.css';

interface DashboardProps {
    dashboardType: string;
}

const Dashboard: React.FC<DashboardProps> = ({ dashboardType }) => {
    const { filter, data, znsData, setFilter, fetchDashboardData, fetchZnsData } = useDashboardStore();
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            await fetchDashboardData(filter);
            await fetchZnsData(filter);
            setLoading(false);
        };
        fetchData();
    }, [filter, fetchDashboardData, fetchZnsData]);


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
        switch (dashboardType) {
            case 'Zero':
                return (<div className="section">
                    <h2 id="zero-global">ZERO Global</h2>
                    <div className="zero-global">
                        <Filters setFilter={setFilter} />
                        <div className="cards">
                            <Card title="Daily Active Users" value={totals.dailyActiveUsers} />
                            <Card title="Total Messages Sent" value={totals.totalMessagesSent} />
                            <Card title="User Sign Ups" value={totals.userSignUps} />
                            <Card title="Newly Minted Domains" value={totals.newlyMintedDomains} />
                            <Card title="Total Rewards Earned" value={totals.totalRewardsEarned} />
                        </div>
                        <div className="charts">
                            <div className="chart-row">
                                <div className="chart-container">
                                    <h3>Daily Active Users</h3>
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
                </div>);
            case 'ZNS':
                return (
                    <div className="section">
                        <h2 id="zero-domains">ZERO Domains</h2>
                        <div className="zero-domains">
                            <Filters setFilter={setFilter} />
                            <div className="cards">
                                <Card title="Total Domain Registrations" value={totals.totalRegistrations} />
                                <Card title="Total Worlds" value={totals.totalWorlds} />
                                <Card title="Total Domains" value={totals.totalDomains} />
                                <Card title="Total Amount Staked" value={totals.totalRewardsEarned} />
                            </div>
                            <div className="charts">
                                <div className="chart-row">
                                    <div className="chart-container">
                                        <h3>Total Domain Registrations</h3>
                                        <Chart data={znsData} dataKey="NetTotalRegistrations" chartType="bar" />
                                    </div>
                                    <div className="chart-container">
                                        <h3>Total Worlds</h3>
                                        <Chart data={znsData} dataKey="WorldsCreated" chartType="bar" />
                                    </div>
                                </div>
                                <div className="chart-row">
                                    <div className="chart-container">
                                        <h3>Total Domains</h3>
                                        <Chart data={znsData} dataKey="NumDomainsRegistered" chartType="bar" />
                                    </div>
                                    <div className="chart-container">
                                        <h3>Total Amount Staked</h3>
                                        <Chart data={znsData} dataKey="NumDomainsRegisteredTotal" chartType="area" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'MEOW':
                return (
                    <div className="section">
                        <h2 id="zero-meow">MEOW</h2>
                        <div className="zero-meow">
                            <Filters setFilter={setFilter} />
                            <div className="cards">
                                <Card title="MEOW Active Users" value={totals.dailyActiveUsers} />
                                <Card title="MEOW exchange" value={totals.totalMessagesSent} />
                                <Card title="User Sign Ups" value={totals.userSignUps} />
                                <Card title="Newly Minted Domains" value={totals.newlyMintedDomains} />
                                <Card title="Total Rewards Earned" value={totals.totalRewardsEarned} />
                            </div>
                            <div className="charts">
                                <div className="chart-row">
                                    <div className="chart-container">
                                        <h3>MEOW Active Users</h3>
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
            case 'WILD':
                return (
                    <div className="section">
                        <h2 id="zero-wild">WILD</h2>
                        <div className="zero-wild">
                            <Filters setFilter={setFilter} />
                            <div className="cards">
                                <Card title="WILD Active Users" value={totals.dailyActiveUsers} />
                                <Card title="WILD" value={totals.totalMessagesSent} />
                                <Card title="User Sign Ups" value={totals.userSignUps} />
                                <Card title="Newly Minted Domains" value={totals.newlyMintedDomains} />
                                <Card title="Total Rewards Earned" value={totals.totalRewardsEarned} />
                            </div>
                            <div className="charts">
                                <div className="chart-row">
                                    <div className="chart-container">
                                        <h3>WILD Active Users</h3>
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
            case 'Finance':
                return (
                    <div className="section">
                        <h2 id="zero-finance">Finance</h2>
                        <div className="zero-finance">
                            <Filters setFilter={setFilter} />
                            <div className="cards">
                                <Card title="Finance Active Users" value={totals.dailyActiveUsers} />
                                <Card title="Finance Messages" value={totals.totalMessagesSent} />
                                <Card title="User Sign Ups" value={totals.userSignUps} />
                                <Card title="Newly Minted Domains" value={totals.newlyMintedDomains} />
                                <Card title="Total Rewards Earned" value={totals.totalRewardsEarned} />
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
                    <div className="section">
                        <h2 id="zero-productivity">Productivity</h2>
                        <div className="zero-productivity">
                            <Filters setFilter={setFilter} />
                            <div className="cards">
                                <Card title="Productivity Active Users" value={totals.dailyActiveUsers} />
                                <Card title="Productivity Messages" value={totals.totalMessagesSent} />
                                <Card title="User Sign Ups" value={totals.userSignUps} />
                                <Card title="Newly Minted Domains" value={totals.newlyMintedDomains} />
                                <Card title="Total Rewards Earned" value={totals.totalRewardsEarned} />
                            </div>
                            <div className="charts">
                                <div className="chart-row">
                                    <div className="chart-container">
                                        <h3>Productivity Active Users</h3>
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
            default:
                return null;
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="dashboard">
            {renderSection()}
        </div>
    );
};

export default Dashboard;
