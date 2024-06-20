import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const nftAddresses = [
    '0x51bd5948cf84a1041d2720f56ded5e173396fc95',
    '0x4D8165Cb6861253E9edfBac2F41A386BA1A0a175',
    '0x1c42576aca321a590a809cd8b18492aafc1f3909',
    '0x4d8165cb6861253e9edfbac2f41a386ba1a0a175',
    '0x05f81f870cbca79e9171f22886b58b5597a603aa',
    '0x1a178cfd768f74b3308cbca9998c767f4e5b2cf8',
    '0xfea385b9e6e4fdfa3508ae6863d540c4a8ccc0fe',
    '0xc2e9678a71e50e5aed036e00e9c5caeb1ac5987d',
    '0xe4954e4fb3c448f4efbc1f8ec40ed54a2a1cc1f5'
];

const getNFTVolume = async (contractAddress: string) => {
    const url = `https://api.gopluslabs.io/api/v1/nft_security/1?contract_addresses=${contractAddress}`;
    const response = await axios.get(url);
    const data = response.data.result;
    return {
        nft_address: contractAddress,
        total_volume: data.total_volume,
        nft_name: data.nft_name,
        nft_owner_number: data.nft_owner_number || 0, 
        nft_items: data.nft_items || 0
    };
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const volumePromises = nftAddresses.map(getNFTVolume);
        const volumes = await Promise.all(volumePromises);

        const totalVolume = volumes.reduce((acc, nft) => acc + parseFloat(nft.total_volume), 0);
        const totalOwners = volumes.reduce((acc, nft) => acc + (nft.nft_owner_number || 0), 0); // Somando apenas valores válidos
        const totalItems = volumes.reduce((acc, nft) => acc + (nft.nft_items || 0), 0); // Somando apenas valores válidos
        const volumeByNFT = volumes.map(nft => ({
            name: nft.nft_name,
            volume: parseFloat(nft.total_volume),
            owners: nft.nft_owner_number || 0,
            items: nft.nft_items || 0
        }));

        res.status(200).json({ totalVolume, totalOwners, totalItems, volumeByNFT });
    } catch (error) {
        console.error('Error fetching NFT volumes:', error);
        res.status(500).json({ error: 'Failed to fetch NFT volumes' });
    }
};
