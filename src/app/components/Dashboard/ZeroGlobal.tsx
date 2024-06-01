import React, { useEffect } from 'react';
import useDashboardStore from '@/store/useDashboardStore';
import Filters from '@/components/Filters';
import Chart from '@/components/Chart';
import Card from '@/components/Card';

const ZeroGlobal: React.FC = () => {
    const { filter, totals, data, setFilter, fetchDashboardData } = useDashboardStore();

    useEffect(() => {
        const fetchData = async () => {
            const toDate = new Date().toISOString().split('T')[0];
            const fromDate = new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]; // Adjust this range as needed
            await fetchDashboardData(fromDate, toDate);
        };

        fetchData();
    }, [filter, fetchDashboardData]);

    return (
        <div className="section">
            <h2 id="zero-global">ZERO Global</h2>
            <div className="zero-global">
                <Filters setFilter={setFilter} />
                <div className="cards">
                    <Card title="Daily Active Users" value={totals.dailyActiveUsers} />
                    <Card title="Total Messages Sent" value={totals.totalMessagesSent} />
                    <Card title="User Sign Ups" value={totals.userSignUps} />
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
                            <h3>Total Rewards Earned</h3>
                            <Chart data={data} dataKey="totalRewardsEarned" chartType="line" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ZeroGlobal;
