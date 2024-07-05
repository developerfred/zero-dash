import React, { useEffect } from 'react';
import useDashboardStore from '@/store/useDashboardStore';
import Chart from '@/components/Chart';
import Card from '@/components/Card';

const ZeroDomainsSection: React.FC = () => {
    const {
        filter,        
        znsDataCache,        
        fetchTotals,
        isLoadingZns,
    } = useDashboardStore();

    useEffect(() => {
        fetchTotals(filter);
    }, [filter]);

    const cachedData = znsDataCache[filter] || {};

    const totals = {
        totalRegistrations: Object.values(cachedData).reduce((acc, val) => acc + val.totalDomainRegistrations, 0),
        totalWorlds: Object.values(cachedData).reduce((acc, val) => acc + val.totalWorlds, 0),
        totalDomains: Object.values(cachedData).reduce((acc, val) => acc + val.totalDomains, 0),
    };

    const znsData = Object.values(cachedData);
    
    return (
        <div className="section">            
            <div className="zero-domains">
                <div className="cards">
                    <Card title="Total Domain registrations" value={totals.totalRegistrations} isLoading={isLoadingZns} />
                    <Card title="Total worlds" value={totals.totalWorlds} isLoading={isLoadingZns} />
                    <Card title="Total domains" value={totals.totalDomains} isLoading={isLoadingZns} />
                </div>
                <div className="charts">
                    <div className="chart-row">
                        
                            <Chart data={znsData} dataKey="totalDomainRegistrations" chartType="bar" title="Total Domain registrations" />
                        
                        
                            <Chart data={znsData} dataKey="totalWorlds" chartType="area" title="Total worlds" />
                        
                    </div>
                    <div className="chart-row">
                                                   
                            <Chart data={znsData} dataKey="totalDomains" chartType="line" title="Total domains" />
                        
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ZeroDomainsSection;
