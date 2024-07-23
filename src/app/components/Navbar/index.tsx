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
        { label: "RACING", section: "Racing" },
        { label: "DAO", section: "Finance" },        
    ];

    return (
        <nav className={styles.navbar}>
            <div className={styles.navbarLeft}>
                <button onClick={() => setActiveSection("Zero")} className={styles.navbarTitle}>
                    <img src='./zero-dashboard-logo.png' alt="Logo" />
                </button>
            </div>
            <div className={styles.navbarContainer}>                
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
