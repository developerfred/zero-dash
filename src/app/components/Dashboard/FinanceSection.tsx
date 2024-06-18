// @ts-ignore
// @ts-nocheck
import React, { useEffect, useState } from 'react';
import Chart from '@/components/Chart';
import Card from '@/components/Card';
import useSafeStore from '@/store/useSafeStore';
import useDashboardStore from '@/store/useDashboardStore';
import { formatUnits } from 'viem';
import { formatUSD } from '@/app/lib/currencyUtils';

type ChartData = {
    date: string;
    numberOfTransactions: number;
};

const FinanceSection: React.FC = () => {
    const { filter, setFilter, tokenPriceInUSD } = useDashboardStore();
    const { isLoading, fetchSafeData, transactions, balances } = useSafeStore();
    const [chartData, setChartData] = useState<ChartData[]>([]);

    useEffect(() => {
        fetchSafeData(filter);
    }, [fetchSafeData, filter]);

    useEffect(() => {
        if (transactions.length) {
            const aggregatedData: ChartData[] = transactions.map((transaction) => ({
                date: transaction.date,
                numberOfTransactions: transaction.numberOfTransactions,
            }));

            setChartData(aggregatedData);
        }
    }, [transactions]);

    const calculateBalanceInUSD = () => {
        if (balances[1] && balances[1].balance && balances[1].token && tokenPriceInUSD) {
            const balanceInEther = parseFloat(formatUnits(BigInt(balances[1].balance), 18));
            return balanceInEther * tokenPriceInUSD;
        }
        return null;
    };

    const balanceInUSD = calculateBalanceInUSD();

    return (
        <div className="section">
            <h2 id="zero-finance">Finance</h2>
            <div className="zero-finance">
                <div className="cards">
                    <Card title="DAO transactions" value={transactions.reduce((acc, transaction) => acc + transaction.numberOfTransactions, 0)} isLoading={isLoading} />
                    <Card title="DAO Balance" value={balanceInUSD ? `${formatUSD(balanceInUSD)}` : 'Loading...'} isLoading={isLoading} />
                </div>
                <div className="charts">
                    <div className="chart-row">
                        <div className="chart-container">
                            <h3>DAO transactions Time</h3>
                            <Chart data={chartData} dataKey="numberOfTransactions" chartType="area" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinanceSection;
