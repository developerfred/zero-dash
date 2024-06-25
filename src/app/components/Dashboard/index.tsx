// @ts-nocheck

import React, { useCallback, useEffect } from 'react';
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
import { memo } from 'react';

interface DashboardProps {
    activeSection: string;
}

const sectionComponents = {
    Zero: ZeroGlobal,
    ZNS: ZeroDomainsSection,
    MEOW: MeowSection,
    WILD: WildSection,
    Finance: FinanceSection,
    Productivity: ProductivitySection,
};

const Dashboard: React.FC<DashboardProps> = ({ activeSection }) => {
    const { filter, setFilter } = useDashboardStore();

    const renderSection = useCallback(() => {
        const SectionComponent = sectionComponents[activeSection];
        return SectionComponent ? <SectionComponent /> : null;
    }, [activeSection]);

    useEffect(() => {
        setFilter(filter);
    }, [filter, setFilter]);

    return (
        <div className="dashboard">
            <Filters setFilter={setFilter} />
            {renderSection()}
        </div>
    );
};

export default memo(Dashboard);
