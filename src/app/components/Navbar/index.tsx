import React from 'react';
import styles from './Navbar.module.css';

const Navbar: React.FC = () => {
    return (
        <nav className={styles.navbar}>
            <div className={styles.navbarContainer}>
                <div className={styles.navbarLeft}>
                    <a className={styles.navbarTitle} aria-label="ZERO dashboard" href="/">
                        ZERO
                    </a>
                </div>
                <div className={styles.navbarMenu}>
                    <a href="#zero-domains" className={styles.menuItem}>
                        ZNS
                    </a>
                    <a href="#zero-meow" className={styles.menuItem}>
                        MEOW
                    </a>
                    <a href="#zero-wild" className={styles.menuItem}>
                        WILD
                    </a>
                    <a href="#zero-finance" className={styles.menuItem}>
                        Finance
                    </a>
                    <a href="#zero-productivity" className={styles.menuItem}>
                        Productivity
                    </a>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
