import React from 'react';
import styles from './LinkIcons.module.css';
import { FaFileAlt, FaGithub, FaHeadphones, FaXing } from 'react-icons/fa';
import { FaXTwitter } from "react-icons/fa6";

const LinkIcons = () => {
    const links = [
        { href: 'https://res.cloudinary.com/fact0ry/image/upload/v1602993979/ZER0_WHITEPAPER_-_v0.8_-_Official_wkjgwe.pdf', icon: <FaFileAlt /> },
        { href: 'https://github.com/zer0-os', icon: <FaGithub /> },        
        { href: 'https://x.com/zero__tech', icon: < FaXTwitter /> },
    ];

    return (
        <div className={styles.iconContainer}>
            {links.map((link, index) => (
                <a key={index} href={link.href} className={styles.iconLink} target="_blank" rel="noopener noreferrer">
                    {link.icon}
                </a>
            ))}
        </div>
    );
};

export default LinkIcons;
