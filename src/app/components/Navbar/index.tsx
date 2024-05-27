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
        { href: "/", label: "ZERO Messenger"},
        { href: "/zns", label: "Onchain for ZNS" },
        { href: "/meow", label: "Meow Token Info" },
        { href: "/wild", label: "WILD Token Info" },
        { href: "/finance", label: "DAO" },
        { href: "/productivity", label: "Work" }
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
