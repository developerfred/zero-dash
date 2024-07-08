export interface AuthorizationResponse {
    accessToken?: string;
    nonceToken?: string;
}

export interface Wallet {
    id: string;
    publicAddress: string;
}

interface ProfileSummary {
    firstName: string;
    guildId: string;
    id: string;
    lastName: string;
    profileImage: string;
    ssbPublicKey: string;
    primaryEmail: string;
}

export interface UserPayload {
    data?: User;
    nonce?: string;
}

export interface User {
    id: string;
    createdAt: string;
    handle: string;
    isOnline: boolean;
    lastActiveAt: string;
    profileId: string;
    role: string;
    updatedAt: string;
    profileSummary: ProfileSummary;
    wallets: Wallet[];
    matrixId?: string;
    matrixAccessToken?: string;
    primaryZID?: string;
    primaryWalletAddress?: string;
}

export interface AuthenticationState {
    user: UserPayload;
    nonce?: string;
    displayLogoutModal: boolean;
}


export interface ChartData {
    labels: string[];
    values: number[];
    label: string;
}

export interface MockData {
    dailyActiveUsers: ChartData;
    totalMessagesSent: ChartData;
    userSignUps: ChartData;
    newlyMintedDomains: ChartData;
    totalRewardsEarned: ChartData;
}

export interface DataPoint {
    date: string;
    [key: string]: string | number;
    dailyActiveUsers: number;
    totalMessagesSent: number;
    userSignUps: number;
    newlyMintedDomains: number;
    totalRewardsEarned: number;
}

export interface ZnsData {
    date: string;
    totalRegistrations: number;
    numDomainsRegistered: number;
    numDomainsRegisteredTotal: number;
    numRegistrars: number;
    worldsCreated: number;
    worldsDestroyed: number;
    dailyActiveUsers?: number;
    totalMessagesSent?: number;
    userSignUps?: number;
    newlyMintedDomains?: number;
    totalRewardsEarned?: number;
}

export const isDataPointArray = (data: DataPoint[] | ZnsData[]): data is DataPoint[] => {
    return (data as DataPoint[])[0]?.dailyActiveUsers !== undefined;
}


export interface TotalRewardsEarned {
    amount: string;
    unit: string;
    precision: number;
}

export interface MetricsData {
    date: string;
    dailyActiveUsers: number;
    totalMessagesSent: number;
    userSignUps: number;
    newlyMintedDomains: number;
    totalRewardsEarned: TotalRewardsEarned;
}

export interface GroupedData {
    totalDomainRegistrations: number;
    totalWorlds: number;
    totalDomains: number;
    domains: ZnsData[];
    worlds: ZnsData[];
}

export interface Reward {
    amount: string;
    precision: number;
}

export interface Post {
    id: string;
    title: string;
    slug: string;
    published_at: string;
    updated_at: string;
    feature_image: string;
}

export interface GroupedPosts {
    [key: string]: {
        date: string;
        numberOfPosts: number;
        posts: Post[];
    };
}


export interface FinanceData {
    date: string;
    numberOfTransactions: number;
};

export interface BalanceChartData {
    date: string;
    balance: number;
};



export interface Totals {
    totalRegistrations: number;
    totalWorlds: number;
    totalDomains: number;
}

export interface DashboardState {
    filter: string;
    activeSection: string;
    pairData: any;
    data: DataPoint[];
    zosData: MetricsData[];
    znsData: ZnsData[];
    znsDataCache: Record<string, GroupedData>;
    zosDataCache: Record<string, MetricsData[]>;
    totals: {
        totalRegistrations: number;
        totalWorlds: number;
        totalDomains: number;
        dailyActiveUsers: number;
        totalMessagesSent: number;
        userSignUps: number;
        newlyMintedDomains: number;
        totalRewardsEarned: string;
        dayCount: number;
    };
    rewardsData: { date: string; totalRewardsEarned: number }[];
    tokenPriceInUSD: number | null;
    meowHolders: number | string;
    volume: number;
    holdersCount: number;
    lpHolderCount: number;
    isLoadingDashboard: boolean;
    isLoadingZns: boolean;
    isLoadingPairData: boolean;
    isInfoLoading: boolean;
    setFilter: (filter: string) => void;
    setData: (data: DataPoint[]) => void;
    setZosData: (data: MetricsData[]) => void;
    fetchDashboardData: (fromDate: string, toDate: string) => Promise<void>;
    fetchTotals: (filter: string) => Promise<void>;
    fetchDashboardDataByFilter: (filter: string) => Promise<void>;
    fetchTokenPrice: () => Promise<void>;
    fetchPairData: () => Promise<void>;
    fetchMeowInfo: () => void;
}
