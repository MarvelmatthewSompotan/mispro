import React, { useState, useEffect, useCallback, useRef } from 'react';
import StatCard from '../../molecules/StatCard';
import WelcomeBanner from '../../molecules/WelcomeBanner';
import styles from '../home/Home.module.css';
import ColumnHeader from '../../atoms/columnHeader/ColumnHeader';
import { getDashboard } from '../../../services/api';

const formatGrowthText = (percent, period) => {
  const absPercent = Math.abs(percent);
  const trend = percent < 0 ? 'decreased' : 'increased';
  return `${trend} ${absPercent}% from ${period}`;
};

const Home = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newStudentSlide, setNewStudentSlide] = useState(0);
  const [returnStudentSlide, setReturnStudentSlide] = useState(0);
  const REFRESH_INTERVAL = 5000;
  const fetchControllerRef = useRef(null);

  const fetchDashboard = useCallback(async (options = {}) => {
    const { isBackgroundRefresh = false } = options;
    if (!isBackgroundRefresh) setLoading(true);

    const controller = new AbortController();
    const signal = controller.signal;
    fetchControllerRef.current?.abort();
    fetchControllerRef.current = controller;

    try {
      const res = await getDashboard({ signal });
      setDashboardData(res.data);
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Previous dashboard fetch aborted.');
        return;
      }
      console.error('Failed to load dashboard data:', error);
    } finally {
      if (!isBackgroundRefresh) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  useEffect(() => {
    const refreshData = () => {
      console.log('Auto refreshing dashboard data (background)...');
      fetchDashboard({ isBackgroundRefresh: true });
    };

    const intervalId = setInterval(refreshData, REFRESH_INTERVAL);
    return () => clearInterval(intervalId);
  }, [fetchDashboard]);

  const handleNewStudentClick = () => {
    setNewStudentSlide((prev) => (prev === 0 ? 1 : 0));
  };

  const handleReturnStudentClick = () => {
    setReturnStudentSlide((prev) => (prev === 0 ? 1 : 0));
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <div>Loading dashboard...</div>
      </div>
    );
  }

  if (!dashboardData) {
    return <div className={styles.error}>Failed to load dashboard data.</div>;
  }

  const {
    username,
    last_login,
    total_registrations,
    total_registration_growth_percent,
    today_registration,
    today_registration_growth_percent,
    new_students_today,
    new_students_today_growth_percent,
    returning_students_today,
    returning_students_today_growth_percent,
    new_students_current_year,
    returning_students_current_year,
    new_students_yearly_growth_percent,
    returning_students_yearly_growth_percent,
    latest_registrations,
  } = dashboardData;

  const newStudentData = [
    {
      value: new_students_today,
      label: 'New students (Today)',
      footerText: formatGrowthText(
        new_students_today_growth_percent,
        'yesterday'
      ),
    },
    {
      value: new_students_current_year,
      label: 'New students (This Year)',
      footerText: formatGrowthText(
        new_students_yearly_growth_percent,
        'last year'
      ),
    },
  ];

  const returnStudentData = [
    {
      value: returning_students_today,
      label: 'Returning students (Today)',
      footerText: formatGrowthText(
        returning_students_today_growth_percent,
        'yesterday'
      ),
    },
    {
      value: returning_students_current_year,
      label: 'Returning students (This Year)',
      footerText: formatGrowthText(
        returning_students_yearly_growth_percent,
        'last year'
      ),
    },
  ];

  return (
    <div className={styles.homeContainer}>
      <div className={styles.topContentWrapper}>
        <WelcomeBanner name={username} lastLogin={last_login} />
        <div className={styles.statCardGrid}>
          <div className={styles.cardWithDotsWrapper}>
            <StatCard
              value={total_registrations}
              label='Total registration'
              variant='gradient'
              footerText={formatGrowthText(
                total_registration_growth_percent,
                'last year'
              )}
              style={{ flex: 'none' }} 
            />
            <div className={styles.dotsPlaceholder} />
          </div>

          <div className={styles.cardWithDotsWrapper}>
            <StatCard
              value={today_registration}
              label='Total registration (Today)'
              variant='blue'
              footerText={formatGrowthText(
                today_registration_growth_percent,
                'yesterday'
              )}
              style={{ flex: 'none' }} 
            />
            <div className={styles.dotsPlaceholder} />
          </div>

          <div className={styles.cardWithDotsWrapper}>
            <StatCard
              value={newStudentData[newStudentSlide].value}
              label={newStudentData[newStudentSlide].label}
              variant='blue'
              footerText={newStudentData[newStudentSlide].footerText}
              onClick={handleNewStudentClick}
              style={{ flex: 'none' }} 
            />
            <div className={styles.paginationDots}>
              <span
                className={`${styles.dot} ${
                  newStudentSlide === 0 ? styles.active : ''
                }`}
              ></span>
              <span
                className={`${styles.dot} ${
                  newStudentSlide === 1 ? styles.active : ''
                }`}
              ></span>
            </div>
          </div>

          <div className={styles.cardWithDotsWrapper}>
            <StatCard
              value={returnStudentData[returnStudentSlide].value}
              label={returnStudentData[returnStudentSlide].label}
              variant='blue'
              footerText={returnStudentData[returnStudentSlide].footerText}
              onClick={handleReturnStudentClick}
              style={{ flex: 'none' }} 
            />
            <div className={styles.paginationDots}>
              <span
                className={`${styles.dot} ${
                  returnStudentSlide === 0 ? styles.active : ''
                }`}
              ></span>
              <span
                className={`${styles.dot} ${
                  returnStudentSlide === 1 ? styles.active : ''
                }`}
              ></span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainContentArea}>
        <h3>Latest Registration</h3>
        <div className={styles.tableContainer}>
          <div className={styles.tableHeader}>
            <ColumnHeader title='Student ID' />
            <ColumnHeader title='Student Name' />
            <ColumnHeader title='Grade' />
            <ColumnHeader title='Section' />
            <ColumnHeader title='School Year' />
            <ColumnHeader title='Status' />
          </div>

          <div className={styles.tableBody}>
            {latest_registrations?.length > 0 ? (
              latest_registrations.map((student) => (
                <div key={student.student_id} className={styles.tableRow}>
                  <div className={styles.tableCell}>{student.student_id}</div>
                  <div className={styles.tableCell}>{student.full_name}</div>
                  <div className={styles.tableCell}>{student.grade}</div>
                  <div className={styles.tableCell}>{student.section}</div>
                  <div className={styles.tableCell}>{student.school_year}</div>
                  <div className={styles.tableCell}>
                    <div
                    className={` ${
                      student.status?.toLowerCase() === 'confirmed'
                        ? styles.statusConfirmed
                        : student.status?.toLowerCase() === 'cancelled'
                        ? styles.statusCancelled
                        : ''
                    }`}
                  >
                    {student.status}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>
                No recent registrations found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
