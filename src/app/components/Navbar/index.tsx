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
                    <a href="#zero-global" className={styles.menuItem}>
                        ZERO DATA
                    </a>
                    <a href="#zero-domains" className={styles.menuItem}>
                        ZNS DATA
                    </a>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
