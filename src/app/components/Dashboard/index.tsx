// @ts-nocheck
import React, { useCallback, useEffect, memo } from 'react';
import Filters from '@/components/Filters';
import LinkIcons from '@/components/LinkIcons';
import ProductivitySection from './ProductivitySection';
import ZeroDomainsSection from './ZeroDomainsSection';
import useDashboardStore from '@/store/useDashboardStore';
import ZeroGlobal from './ZeroGlobal';
import MeowSection from './MeowSection';
import FinanceSection from './FinanceSection';
import WildSection from './WildSection';

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

const sectionTitles = {
    Zero: "Zero Global",
    ZNS: "Zero Domains",
    MEOW: "M.E.O.W ",
    WILD: "Wild ",
    Finance: "Finance",
    Productivity: "Productivity Section",
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

    const getTitle = () => {
        return sectionTitles[activeSection] || "Dashboard";
    };

    return (        
        <div className="dashboard">   
                <div className='filter-box'><div className="menu-box">
                    <h3 className="title-dashboard">{getTitle()}</h3>
                    <div className="links-box"><LinkIcons /></div>

                </div>
                    <Filters setFilter={setFilter} /></div>                     
            {renderSection()}
        </div>    
    );
};

export default memo(Dashboard);
