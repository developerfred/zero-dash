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
        setFilter,
    } = useDashboardStore();

    useEffect(() => {        
        if (filter === '15m') {
            setFilter('7d');
        } else {
            fetchTotals(filter);
        }
    }, [filter, setFilter, fetchTotals]);

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
                    <Card title="Domain registrations" value={totals.totalRegistrations} isLoading={isLoadingZns} />
                    <Card title="Worlds" value={totals.totalWorlds} isLoading={isLoadingZns} />
                    <Card title="Domains" value={totals.totalDomains} isLoading={isLoadingZns} />
                </div>
                <div className="charts">
                    <div className="chart-row">                        
                        <Chart data={znsData} dataKey="totalDomainRegistrations" chartType="bar" title="Domain registrations" />                                                
                        <Chart data={znsData} dataKey="totalWorlds" chartType="area" title="Worlds" />                        
                    </div>
                    <div className="chart-row">                                                   
                        <Chart data={znsData} dataKey="totalDomains" chartType="line" title="Domains" />                        
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ZeroDomainsSection;
