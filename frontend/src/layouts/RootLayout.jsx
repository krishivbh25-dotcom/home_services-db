import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar';
import Sidebar from '../components/Sidebar/Sidebar';
import Footer from '../components/Footer/Footer';
import styles from './RootLayout.module.css';

/**
 * RootLayout: Application shell with Top Navbar, Left Sidebar, Main Content, and Footer.
 * Works seamlessly across Customer, Partner, and Admin roles.
 */
export default function RootLayout() {
  return (
    <div className={styles.layoutContainer}>
      <Navbar />
      <div className={styles.bodyWrapper}>
        <Sidebar />
        <main className={styles.mainContent}>
          <div className={styles.contentContainer}>
            <Outlet />
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
