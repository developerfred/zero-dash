import React from 'react';
import { HiOutlineUser, HiOutlineCurrencyDollar, HiOutlineChartBar, HiOutlineChatBubbleLeft, HiOutlineUsers, HiOutlineGlobeAlt, HiOutlineCubeTransparent, HiOutlineBanknotes, HiOutlineArrowsUpDown, HiOutlineSquares2X2, HiOutlineSwatch } from 'react-icons/hi2';
import { RiContractLine } from "react-icons/ri";
import { BsSafe2 } from "react-icons/bs";

interface IconMapping {
    keywords: string[];
    icon: React.ReactElement;
}

const iconMappings: IconMapping[] = [
    { keywords: ["users", "holders"], icon: <HiOutlineUsers /> },
    { keywords: ["rewards", "earnings", "token", "revenue", "usd"], icon: <HiOutlineCurrencyDollar /> },
    { keywords: ["activity"], icon: <HiOutlineChartBar /> },
    { keywords: ["messages"], icon: <HiOutlineChatBubbleLeft /> },
    { keywords: ["sign ups"], icon: <HiOutlineUsers /> },
    { keywords: ["volume"], icon: <HiOutlineChartBar /> },
    { keywords: ["world"], icon: <HiOutlineGlobeAlt /> },
    { keywords: ["registrations"], icon: <RiContractLine /> },
    { keywords: ["domain"], icon: <HiOutlineCubeTransparent /> },
    { keywords: ["balance"], icon: <HiOutlineBanknotes /> },
    { keywords: ["transactions"], icon: <HiOutlineArrowsUpDown /> },
    { keywords: ["daos"], icon: <HiOutlineSquares2X2 /> },
    { keywords: ["lp"], icon: <BsSafe2 /> },
    


    
    

    

];

export const getIconForTitle = (title: string): React.ReactElement | null => {
    const titleLower = title.toLowerCase();
    for (const mapping of iconMappings) {
        if (mapping.keywords.some(keyword => titleLower.includes(keyword))) {
            return mapping.icon;
        }
    }
    return null;
};
