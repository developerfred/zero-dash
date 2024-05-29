import React from 'react';
import { usePathname } from 'next/navigation';
import styles from './Navbar.module.css';

interface NavItemProps {
    href: string;
    label: string;
    isActive: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ href, label, isActive }) => (
    <a href={href} className={`${styles.menuItem} ${isActive ? styles.active : ''}`}>
        {label}
    </a>
);

const Navbar: React.FC = () => {
    const pathname = usePathname();

    const navItems = [
        { href: "/", label: "ZOS" },
        { href: "/zns", label: "ZNS" },
        { href: "/meow", label: "MEOW" },
        { href: "/wild", label: "WILD" },
        { href: "/finance", label: "DAO" },
        { href: "/productivity", label: "WORK" }
    ];

    return (
        <nav className={styles.navbar}>
            <div className={styles.navbarContainer}>
                <div className={styles.navbarLeft}>
                    <a className={styles.navbarTitle} aria-label="ZERO dashboard" href="/">
                        ZERO
                    </a>
                </div>
                <div className={styles.navbarMenu}>
                    {navItems.map((item) => (
                        <NavItem 
                            key={item.href} 
                            href={item.href} 
                            label={item.label} 
                            isActive={pathname === item.href}
                        />
                    ))}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
