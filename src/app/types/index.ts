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