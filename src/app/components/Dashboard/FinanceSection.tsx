import React, { useEffect, useState } from 'react';
import Chart from '@/components/Chart';
import Card from '@/components/Card';
import useSafeStore from '@/store/useSafeStore';
import useDashboardStore from '@/store/useDashboardStore';
import useChartStore from '@/store/useChartStore';
import { formatUnits } from 'viem';
import { formatUSD } from '@/app/lib/currencyUtils';
import { FinanceData, BalanceChartData } from '@/app/types';

const FinanceSection: React.FC = () => {
    const { filter, setFilter, tokenPriceInUSD, fetchTokenPrice } = useDashboardStore();
    const { isLoading, fetchSafeData, transactions, balances } = useSafeStore();
    const [financeData, setFinanceData] = useState<FinanceData[]>([]);
    const { chartData, fetchChartData, isLoadingChart } = useChartStore();
    const [chartPrice, setChartPrice] = useState<number | null>(null);
    const [balanceChartData, setBalanceChartData] = useState<{ date: string; balance: number }[]>([]);

    useEffect(() => {
        fetchSafeData(filter);
    }, [fetchSafeData, filter]);

    useEffect(() => {
        if (transactions.length) {
            const aggregatedData: FinanceData[] = transactions.map((transaction) => ({
                date: transaction.date,
                numberOfTransactions: transaction.numberOfTransactions,
            }));

            setFinanceData(aggregatedData);
        }
    }, [transactions]);

    useEffect(() => {
        if (!filter) {
            console.error('Filter is undefined');
            return;
        }

        const now = new Date();
        let start: Date;

        switch (filter) {
            case '24h':
                start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                break;
            case '7d':
                start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case '30d':
                start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            case '90d':
                start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                break;
            case '365d':
                start = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                break;
            case 'today':
                start = new Date();
                start.setHours(0, 0, 0, 0);
                break;
            case 'yesterday':
                start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                start.setHours(0, 0, 0, 0);
                break;
            case 'last_week':
                start = new Date(now.getTime() - (now.getDay() + 7) * 24 * 60 * 60 * 1000);
                start.setHours(0, 0, 0, 0);
                break;
            case 'last_month':
                start = new Date();
                start.setMonth(now.getMonth() - 1);
                start.setHours(0, 0, 0, 0);
                break;
            case 'last_year':
                start = new Date();
                start.setFullYear(now.getFullYear() - 1);
                start.setHours(0, 0, 0, 0);
                break;
            default:
                if (filter.startsWith('custom')) {
                    const dates = filter.split('_');
                    start = new Date(dates[1]);
                    const end = new Date(dates[2]);
                    fetchChartData('ethereum:0x0ec78ed49c2d27b315d462d43b5bab94d2c79bf8', start, end);
                    return;
                } else {
                    throw new Error(`Invalid filter format: ${filter}`);
                }
        }

        fetchChartData('ethereum:0x0ec78ed49c2d27b315d462d43b5bab94d2c79bf8', start, now);
    }, [filter, fetchChartData, fetchTokenPrice]);

    useEffect(() => {
        if (chartData.length) {
            setChartPrice(chartData[chartData.length - 1]?.price || null);
            const balanceData: BalanceChartData[] = chartData.map((data) => ({
                date: data.date,
                balance: balances[1] ? parseFloat(formatUnits(BigInt(balances[1].balance), 18)) * data.price : 0
            }));
            setBalanceChartData(balanceData);
        }
    }, [chartData, balances]);

    const calculateBalanceInUSD = () => {
        if (balances[1] && balances[1].balance && balances[1].token && chartPrice) {
            const balanceInEther = parseFloat(formatUnits(BigInt(balances[1].balance), 18));
            return balanceInEther * chartPrice;
        }
        return null;
    };

    const balanceInUSD = calculateBalanceInUSD();

    return (
        <div className="section">
            <h2 id="zero-finance">Finance</h2>
            <div className="zero-finance">
                <div className="cards">
                    <Card
                        title="DAO transactions"
                        value={transactions.reduce((acc, transaction) => acc + transaction.numberOfTransactions, 0)}
                        isLoading={isLoading}
                    />
                    <Card
                        title="DAO Balance"
                        value={balanceInUSD !== null ? formatUSD(balanceInUSD) : 'Loading...'}
                        isLoading={isLoadingChart}
                    />
                </div>
                <div className="charts">
                    <div className="chart-row">
                        <div className="chart-container">
                            <h3>DAO transactions Time</h3>
                            <Chart data={financeData} dataKey="numberOfTransactions" chartType="area" />
                        </div>
                        <div className="chart-container">
                            <h3>DAO Balance Over Time</h3>
                            <Chart data={balanceChartData} dataKey="balance" chartType="area" isCurrency={true} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinanceSection;
