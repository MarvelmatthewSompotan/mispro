import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { FaUserFriends, FaPlus } from "react-icons/fa";
import styles from "./Home.module.css";
import { getDashboard } from "../../../services/api";
import WelcomeBanner from "../../Molecules/WelcomeBanner/WelcomeBanner";

const formatNumber = (num) => {
  if (num === undefined || num === null) return "0";
  return new Intl.NumberFormat("id-ID").format(num);
};

// Disamakan dengan TrendTextRight di Analytics
const TrendText = ({ growth, periodLabel }) => {
  const val = growth ? Number(growth) : 0;
  const isPositive = val >= 0;

  return (
    <div className={styles.trendTextContainer}>
      <span>{isPositive ? "Increased" : "Decreased"}&nbsp;</span>
      <span
        className={isPositive ? styles.trendPositive : styles.trendNegative}
      >
        {Math.abs(val).toFixed(0)}%
      </span>
      <span>&nbsp;from {periodLabel}</span>
    </div>
  );
};

// Struktur disamakan persis dengan SimpleStatCard di Analytics
const SimpleStatCard = ({ title, count, growth, periodLabel }) => (
  <div className={styles.statCard}>
    <div className={styles.cardTopRow}>
      <div className={styles.cardLabel}>{title}</div>
      <TrendText growth={growth} periodLabel={periodLabel} />
    </div>
    <div className={styles.cardMainStat}>
      <div className={styles.cardBigValue}>{formatNumber(count)}</div>
      <FaUserFriends className={styles.cardIcon} />
    </div>
  </div>
);

const Home = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch Data dari Backend
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getDashboard();
      if (res.success) {
        setData(res.data);
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleFullAnalytics = () => {
    navigate("/analytics");
  };

  if (loading) {
    return (
      <div className={styles.centerMessage}>
        <div className={styles.spinner}></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={styles.centerMessage}>Failed to load dashboard data.</div>
    );
  }

  // Destructure Data sesuai JSON Backend
  const {
    username,
    last_login,
    today,
    school_year,
    active_students_matrix,
    daily_trend,
    latest_registrations,
  } = data;

  // 1. Data untuk Chart di Kartu Hitam (Total Active Student Trend)
  const activeChartData = daily_trend
    ? daily_trend.map((d) => ({
        name: d.date,
        val: d.total,
      }))
    : [];

  const totalActiveStudents = active_students_matrix?.Total || 0;

  const registrationTrendData = daily_trend
    ? daily_trend.map((d) => ({
        date: d.date,
        current: d.total,
        lastMonth: 0,
      }))
    : [];

  return (
    <div className={styles.homeContainer}>
      <WelcomeBanner name={username} lastLogin={last_login} />

      <div className={styles.topStatsGrid}>
        <div className={styles.leftColumnStack}>
          <SimpleStatCard
            title="Today Registration"
            count={today?.total}
            growth={today?.growth_total}
            periodLabel="yesterday"
          />
          <SimpleStatCard
            title="Current S.Y Registration"
            count={school_year?.total}
            growth={school_year?.growth_total}
            periodLabel="last year"
          />
        </div>

        <div className={styles.darkCard}>
          <div className={styles.grossInfo}>
            <div className={styles.cardTitleWhite}>Total Active Student</div>
            <div className={styles.cardMainStatDark}>
              <div className={styles.statValueWhite}>
                {formatNumber(totalActiveStudents)}
              </div>
              <FaUserFriends className={styles.statIconWhite} />
            </div>
            <div className={styles.darkTrendText}>
              Increased{" "}
              <span style={{ color: "#00f413", fontWeight: "bold" }}>20%</span>{" "}
              from last year
            </div>
          </div>

          <div className={styles.grossChart}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activeChartData}>
                <defs>
                  <linearGradient
                    id="grossGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#00f413" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#00f413" stopOpacity={0} />
                  </linearGradient>
                </defs>
                {/* CartesianGrid dihapus agar clean seperti Analytics */}
                <Area
                  type="monotone"
                  dataKey="val"
                  stroke="#00f413"
                  fill="url(#grossGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* --- 3. Middle Section: Latest Registration Table --- */}
      <div className={styles.sectionHeader}>Latest registration</div>
      <div className={styles.tableContainer}>
        {/* Header Tabel */}
        <div className={styles.tableHeader}>
          <div>Registration ID</div>
          <div>Student Name</div>
          <div>Grade</div>
          <div>Section</div>
          <div>School year</div>
          <div>Type</div>
          <div>Status</div>
        </div>

        {/* Body Tabel */}
        <div>
          {latest_registrations && latest_registrations.length > 0 ? (
            latest_registrations.map((row, idx) => (
              <div key={idx} className={styles.tableRow}>
                <div>
                  {row.student_id
                    ? row.student_id
                    : `APP-${row.application_id}`}
                </div>
                <div style={{ fontWeight: 500 }}>{row.full_name}</div>
                <div>{row.grade}</div>
                <div>{row.section}</div>
                <div>{row.school_year}</div>
                <div>{row.type}</div>
                <div>
                  <div
                    className={`${styles.statusBadge} ${
                      row.status === "Confirmed"
                        ? styles.statusConfirmed
                        : row.status === "Cancelled"
                        ? styles.statusCancelled
                        : styles.statusPending
                    }`}
                  >
                    {row.status}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div
              style={{
                padding: "32px",
                textAlign: "center",
                color: "var(--main-grey)",
              }}
            >
              No recent registrations found.
            </div>
          )}
        </div>
      </div>

      {/* --- 4. Bottom Section: Registration Trend Chart --- */}
      <div className={styles.chartSection}>
        <div className={styles.chartTopRow}>
          {/* Title & Legend di Kiri */}
          <div className={styles.chartTitleGroup}>
            <div className={styles.sectionHeader} style={{ margin: 0 }}>
              Registration Trend
            </div>
            <div className={styles.chartLegend}>
              <div className={styles.legendItem}>
                <div
                  className={styles.legendBox}
                  style={{ backgroundColor: "var(--red)" }}
                ></div>
                <span>Last Month</span>
              </div>
              <div className={styles.legendItem}>
                <div
                  className={styles.legendBox}
                  style={{ backgroundColor: "var(--main-accent)" }}
                ></div>
                <span>Current Month</span>
              </div>
            </div>
          </div>

          {/* Link di Kanan */}
          <div className={styles.linkText} onClick={handleFullAnalytics}>
            Show Full Analytics
          </div>
        </div>

        <div style={{ width: "100%", height: 320 }}>
          <ResponsiveContainer>
            <LineChart
              data={registrationTrendData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e0e0e0"
              />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#7A7A7A", fontWeight: 500 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#7A7A7A" }}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  fontSize: "12px",
                }}
              />
              <Line
                type="monotone"
                dataKey="lastMonth"
                stroke="var(--red)"
                strokeWidth={3}
                dot={false}
                name="Last Month"
              />
              <Line
                type="monotone"
                dataKey="current"
                stroke="var(--main-accent)"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, strokeWidth: 0 }}
                name="Current Month"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* FAB */}
        <button
          className={styles.floatingBtn}
          onClick={handleFullAnalytics}
          title="View Analytics"
        >
          <FaPlus />
        </button>
      </div>
    </div>
  );
};

export default Home;
