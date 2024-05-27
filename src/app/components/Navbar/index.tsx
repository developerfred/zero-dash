import React from 'react';
import styles from './Navbar.module.css';

interface NavItemProps {
    href: string;
    label: string;
}

const NavItem: React.FC<NavItemProps> = ({ href, label }) => (
    <a href={href} className={styles.menuItem}>
        {label}
    </a>
);

const Navbar: React.FC = () => {
    const navItems = [
        { href: "/zns", label: "ZNS" },
        { href: "/meow", label: "MEOW" },
        { href: "/wild", label: "WILD" },
        { href: "/finance", label: "Finance" },
        { href: "/productivity", label: "Productivity" }
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
                        <NavItem key={item.href} href={item.href} label={item.label} />
                    ))}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
