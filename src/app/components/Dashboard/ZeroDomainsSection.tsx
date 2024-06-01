// @ts-nocheck
import React, { useEffect } from 'react';
import useDashboardStore from '@/store/useDashboardStore';
import Filters from '@/components/Filters';
import Chart from '@/components/Chart';
import Card from '@/components/Card';

const ZeroDomainsSection = () => {
    const {
        filter,
        totals,
        znsData,
        setFilter,
        fetchTotals,
        fetchZnsData,
    } = useDashboardStore();

    useEffect(() => {
        fetchTotals(filter);
        fetchZnsData(filter);
    }, [filter, fetchTotals, fetchZnsData]);

    return (
        <div className="section">
            <h2 id="zero-domains">ZERO Domains</h2>
            <div className="zero-domains">
                <Filters setFilter={setFilter} />
                <div className="cards">
                    <Card title="Total Domain Registrations" value={totals.totalDomainRegistrations} />
                    <Card title="Total Worlds" value={totals.totalWorlds} />
                    <Card title="Total Domains" value={totals.totalDomains} />
                    {/* <Card title="Total Amount Staked" value={totals.totalRewardsEarned} /> */}
                </div>
                <div className="charts">
                    <div className="chart-row">
                        <div className="chart-container">
                            <h3>Total Domain Registrations</h3>
                            <Chart data={znsData} dataKey="NetTotalRegistrations" chartType="bar" />
                        </div>
                        <div className="chart-container">
                            <h3>Total Worlds</h3>
                            <Chart data={znsData} dataKey="WorldsCreated" chartType="area" />
                        </div>
                    </div>
                    <div className="chart-row">
                        <div className="chart-container">
                            <h3>Total Domains</h3>
                            <Chart data={znsData} dataKey="NumDomainsRegistered" chartType="line" />
                        </div>
                        {/* <div className="chart-container">
                            <h3>Total Amount Staked</h3>
                            <Chart data={znsData} dataKey="NumDomainsRegisteredTotal" chartType="area" />
                        </div> */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ZeroDomainsSection;
