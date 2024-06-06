// src/app/components/Navbar/index.tsx
import React from 'react';
import styles from './Navbar.module.css';

interface NavItemProps {
    label: string;
    isActive: boolean;
    onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ label, isActive, onClick }) => (
    <button onClick={onClick} className={`${styles.menuItem} ${isActive ? styles.active : ''}`}>
        {label}
    </button>
);

interface NavbarProps {
    activeSection: string;
    setActiveSection: (section: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeSection, setActiveSection }) => {
    const navItems = [
        { label: "ZOS", section: "Zero" },
        { label: "ZNS", section: "ZNS" },
        { label: "MEOW", section: "MEOW" },
        { label: "WILD", section: "WILD" },
        { label: "DAO", section: "Finance" },
        { label: "WORK", section: "Productivity" }
    ];

    return (
        <nav className={styles.navbar}>
            <div className={styles.navbarContainer}>
                <div className={styles.navbarLeft}>
                    <button onClick={() => setActiveSection("Zero")} className={styles.navbarTitle}>
                        ZERO
                    </button>
                </div>
                <div className={styles.navbarMenu}>
                    {navItems.map((item) => (
                        <NavItem
                            key={item.section}
                            label={item.label}
                            isActive={activeSection === item.section}
                            onClick={() => setActiveSection(item.section)}
                        />
                    ))}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
