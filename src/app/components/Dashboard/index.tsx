import React, { useState } from 'react';
import Filters from '@/components/Filters';
import Chart from '@/components/Chart';
import Card from '@/components/Card';
import { mockData, DataPoint } from '../mockData';
import './dashboard.css';

const Dashboard: React.FC = () => {
    const [filter, setFilter] = useState<string>('24h');
    const filteredData: DataPoint[] = mockData(filter);

    const totals = {
        dailyActiveUsers: filteredData.reduce((acc, data) => acc + data.dailyActiveUsers, 0),
        totalMessagesSent: filteredData.reduce((acc, data) => acc + data.totalMessagesSent, 0),
        userSignUps: filteredData.reduce((acc, data) => acc + data.userSignUps, 0),
        newlyMintedDomains: filteredData.reduce((acc, data) => acc + data.newlyMintedDomains, 0),
        totalRewardsEarned: filteredData.reduce((acc, data) => acc + data.totalRewardsEarned, 0),
    };

    return (
        <div className="dashboard">
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
                        <Chart data={filteredData} dataKey="dailyActiveUsers" />
                    </div>
                    <div className="chart-container">
                        <h3>Total Messages Sent</h3>
                        <Chart data={filteredData} dataKey="totalMessagesSent" />
                    </div>
                </div>
                <div className="chart-row">
                    <div className="chart-container">
                        <h3>User Sign Ups</h3>
                        <Chart data={filteredData} dataKey="userSignUps" />
                    </div>
                    <div className="chart-container">
                        <h3>Newly Minted Domains</h3>
                        <Chart data={filteredData} dataKey="newlyMintedDomains" />
                    </div>
                </div>
                <div className="chart-row">
                    <div className="chart-container">
                        <h3>Total Rewards Earned</h3>
                        <Chart data={filteredData} dataKey="totalRewardsEarned" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
