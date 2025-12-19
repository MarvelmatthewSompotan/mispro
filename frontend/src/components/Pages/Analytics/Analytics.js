import React, { useEffect, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { FaUserFriends, FaSync } from 'react-icons/fa';
import styles from './Analytics.module.css';
import { getAnalytics } from '../../../services/api'; // Pastikan path import benar

// --- HELPER FUNCTIONS ---
const formatNumber = (num) => {
  if (num === undefined || num === null) return '0';
  // Format angka dengan pemisah ribuan titik (style Indonesia)
  return new Intl.NumberFormat('id-ID').format(num);
};

const formatPercent = (val) => {
  if (val === undefined || val === null) return '0%';
  return `${Number(val).toFixed(1)}%`;
};

// --- SUB-COMPONENT: TREND TEXT ---
const TrendTextRight = ({ growth, isPositive }) => {
  // Jika growth undefined/null anggap 0
  const val = growth ? Number(growth) : 0;
  // Tentukan positif/negatif otomatis jika isPositive tidak dipassing
  const positive = isPositive !== undefined ? isPositive : val >= 0;

  return (
    <div className={styles.trendRightContainer}>
      <span>{positive ? 'Increased' : 'Decreased'}&nbsp;</span>
      <span className={positive ? styles.trendPositive : styles.trendNegative}>
        {Math.abs(val)}%
      </span>
      <span>&nbsp;from last year</span>
    </div>
  );
};

// --- SUB-COMPONENTS CARDS ---

const SimpleStatCard = ({ title, count, growth }) => (
  <div className={styles.card}>
    <div className={styles.cardTopRow}>
      <div className={styles.cardTitle}>{title}</div>
      <TrendTextRight growth={growth} />
    </div>
    <div className={styles.cardMainStat}>
      <div className={styles.statValue}>{formatNumber(count)}</div>
      <FaUserFriends className={styles.statIcon} />
    </div>
  </div>
);

const DetailedStatCard = ({ title, data }) => {
  if (!data) return null;
  // Data expects structure: { total, growth_total, confirmed, growth_confirmed, cancelled, growth_cancelled }

  const isCancelledPositive = Number(data.growth_cancelled) <= 0; // Cancelled turun itu bagus (positif)

  return (
    <div className={styles.card}>
      <div style={{ marginBottom: '16px' }}>
        <div className={styles.cardTopRow}>
          <div className={styles.cardTitle}>{title}</div>
          <TrendTextRight growth={data.growth_total} />
        </div>

        <div className={styles.cardMainStat}>
          <div className={styles.statValue}>{formatNumber(data.total)}</div>
          <FaUserFriends className={styles.statIcon} />
        </div>
      </div>

      {/* Section Bawah (Sub Stats) */}
      <div className={styles.subStatsContainer}>
        {/* Confirmed Box */}
        <div className={styles.subStatBox}>
          <div className={styles.subStatLabel}>Confirmed</div>
          <div className={styles.subStatContentCenter}>
            <div className={styles.subStatValue}>
              {formatNumber(data.confirmed)}
            </div>
            <FaUserFriends className={styles.subStatIcon} />
          </div>
          <div className={styles.trendCenterText}>
            <span
              className={
                Number(data.growth_confirmed) >= 0
                  ? styles.trendPositive
                  : styles.trendNegative
              }
            >
              {Number(data.growth_confirmed).toFixed(1)}%
            </span>{' '}
            from last year
          </div>
        </div>

        {/* Cancelled Box */}
        <div className={styles.subStatBox}>
          <div className={styles.subStatLabel}>Cancelled</div>
          <div className={styles.subStatContentCenter}>
            <div className={styles.subStatValue}>
              {formatNumber(data.cancelled)}
            </div>
            <FaUserFriends className={styles.subStatIcon} />
          </div>
          <div className={styles.trendCenterText}>
            <span
              className={
                isCancelledPositive
                  ? styles.trendPositive
                  : styles.trendNegative
              }
            >
              {Number(data.growth_cancelled).toFixed(1)}%
            </span>{' '}
            from last year
          </div>
        </div>
      </div>
    </div>
  );
};

// --- UPDATED ORANGE CARD COMPONENT ---
const OrangePieCard = ({ syData }) => {
  // Hitung persentase untuk Pie Chart berdasarkan data 'school_year'
  const returningVal = syData?.returning?.total || 0;
  const newVal = syData?.new?.total || 0;
  const transferVal = syData?.transferee?.total || 0;
  const totalVal = syData?.all?.total || 1; // avoid division by zero

  const returningPct = Math.round((returningVal / totalVal) * 100);
  const newPct = Math.round((newVal / totalVal) * 100);
  const transferPct = Math.round((transferVal / totalVal) * 100);

  const data = [
    {
      name: 'Returning Students',
      value: returningPct,
      count: returningVal,
      color: '#ffffff',
    },
    { name: 'New Students', value: newPct, count: newVal, color: '#ffeb53' },
    {
      name: 'Transferred Students',
      value: transferPct,
      count: transferVal,
      color: '#ffcf30',
    },
  ];

  return (
    <div className={styles.orangeCard}>
      {/* Bagian Kiri: Header + Legend */}
      <div className={styles.orangeContentLeft}>
        {/* Header Section */}
        <div className={styles.orangeHeaderSection}>
          <div className={styles.orangeTitle}>
            Total Registered (Current SY)
          </div>
          <div className={styles.orangeValueWrapper}>
            <div className={styles.orangeValue}>
              {formatNumber(syData?.all?.total)}
            </div>
            <FaUserFriends style={{ fontSize: '24px', marginBottom: '6px' }} />
          </div>
        </div>

        {/* Legend Section */}
        <div className={styles.orangeLegendContainer}>
          {data.map((item, index) => (
            <div key={index} className={styles.orangeLegendRow}>
              <div
                className={styles.legendColorBox}
                style={{ backgroundColor: item.color }}
              ></div>
              <div className={styles.legendTextGroup}>
                <div className={styles.legendPercent}>
                  {item.value}% ({item.count})
                </div>
                <div className={styles.legendLabel}>{item.name}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bagian Kanan: Chart */}
      <div className={styles.orangeChartWrapper}>
        <ResponsiveContainer width='100%' height='100%'>
          <PieChart>
            <Pie
              data={data}
              innerRadius={45}
              outerRadius={65}
              dataKey='value'
              stroke='none'
              startAngle={90}
              endAngle={-270}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// --- COMPONENT: GROSS STAT CARD ---
const GrossStatCard = ({ globalData, trendData }) => {
  // Gunakan trendData (monthly) untuk visualisasi area chart kecil
  const chartData =
    trendData?.current_data?.map((d) => ({ val: d.total })) || [];

  return (
    <div className={styles.grossCard}>
      <div className={styles.grossInfo}>
        <div className={styles.cardTitleWhite}>Total Registration (Global)</div>
        <div className={styles.cardMainStat}>
          <div className={styles.statValueWhite}>
            {formatNumber(globalData?.total)}
          </div>
          <FaUserFriends className={styles.statIconWhite} />
        </div>
        <div className={styles.trendContainerWhite}>
          <span>
            {Number(globalData?.total_growth) >= 0 ? 'Increased' : 'Decreased'}{' '}
            by
          </span>
          <span
            className={
              Number(globalData?.total_growth) >= 0
                ? styles.trendGreen
                : styles.trendNegative
            }
          >
            &nbsp;{Number(globalData?.total_growth).toFixed(1)}%
          </span>
          <span>&nbsp;from last year</span>
        </div>
      </div>
      <div className={styles.grossChart}>
        <ResponsiveContainer width='100%' height='100%'>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id='grossGradient' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='5%' stopColor='#00f413' stopOpacity={0.8} />
                <stop offset='95%' stopColor='#00f413' stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type='monotone'
              dataKey='val'
              stroke='#00f413'
              fill='url(#grossGradient)'
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// --- COMPONENT: ACTIVE STUDENTS TABLE ---
const ActiveStudentsTable = ({ matrixData, syName }) => {
  if (!matrixData) return null;

  // Urutan baris yang diinginkan
  const levels = ['High', 'Middle', 'Elementary', 'ECP'];

  return (
    <div className={styles.tableSectionContainer}>
      <div className={styles.asCard}>
        {/* Header Bagian Atas */}
        <div className={styles.asHeaderRow}>
          <div className={styles.asTitle}>Active Students</div>
          <div className={styles.asYear}>S.Y {syName}</div>
        </div>

        {/* Container Tabel (Flex Row of Columns) */}
        <div className={styles.asTableFlex}>
          {/* ================= KOLOM 1: LABELS ================= */}
          <div className={styles.asColLabels}>
            <div
              className={`${styles.asCell} ${styles.asCellHeader} ${styles.asBgTransparent}`}
            ></div>
            {levels.map((level) => (
              <div
                key={level}
                className={`${styles.asCell} ${styles.asCellBody} ${styles.asBgGrey}`}
              >
                {level === 'High'
                  ? 'High School'
                  : level === 'Middle'
                  ? 'Middle School'
                  : level === 'Elementary'
                  ? 'Elementary School'
                  : 'Early Childhood Program'}
              </div>
            ))}
            <div className={`${styles.asCell} ${styles.asCellTotal}`}></div>
          </div>

          {/* ================= KOLOM 2: NEW STUDENT ================= */}
          <div className={styles.asColData}>
            <div
              className={`${styles.asCell} ${styles.asCellHeader} ${styles.asBgGrey}`}
            >
              New Student
            </div>
            {levels.map((level) => (
              <div
                key={level}
                className={`${styles.asCell} ${styles.asCellBody} ${styles.asBgWhite}`}
              >
                {matrixData[level]?.total_new || 0}
              </div>
            ))}
            <div className={`${styles.asCell} ${styles.asCellTotal}`}>
              <span className={styles.asTextGreen}>
                {matrixData.Total?.total_new || 0}
              </span>
            </div>
          </div>

          {/* ================= KOLOM 3: OLD STUDENT (Returning) ================= */}
          <div className={styles.asColData}>
            <div
              className={`${styles.asCell} ${styles.asCellHeader} ${styles.asBgGrey}`}
            >
              Old Student
            </div>
            {levels.map((level) => (
              <div
                key={level}
                className={`${styles.asCell} ${styles.asCellBody} ${styles.asBgWhite}`}
              >
                {matrixData[level]?.total_returning || 0}
              </div>
            ))}
            <div className={`${styles.asCell} ${styles.asCellTotal}`}>
              <span className={styles.asTextGreen}>
                {matrixData.Total?.total_returning || 0}
              </span>
            </div>
          </div>

          {/* ================= KOLOM 4: TRANSFEREE ================= */}
          <div className={styles.asColData}>
            <div
              className={`${styles.asCell} ${styles.asCellHeader} ${styles.asBgGrey}`}
            >
              Transferee
            </div>
            {levels.map((level) => (
              <div
                key={level}
                className={`${styles.asCell} ${styles.asCellBody} ${styles.asBgWhite}`}
              >
                {matrixData[level]?.total_transferee || 0}
              </div>
            ))}
            <div className={`${styles.asCell} ${styles.asCellTotal}`}>
              <span className={styles.asTextGreen}>
                {matrixData.Total?.total_transferee || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- CHART COMPONENTS ---
const RegistrationGrowthChart = ({ data }) => {
  // Data multi_year_trend dari API: array of { school_year, total, ... }
  // Recharts butuh key yang konsisten.
  const chartData =
    data?.map((d) => ({
      year: d.school_year,
      value: d.total,
    })) || [];

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartHeader}>
        <div className={styles.chartTitle}>Registration Growth</div>
        <div className={styles.growthSubtitle}>5 Year</div>
      </div>
      <div className={styles.chartContainer}>
        <ResponsiveContainer width='100%' height='100%'>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id='colorGrowth' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='5%' stopColor='#00f413' stopOpacity={0.3} />
                <stop offset='95%' stopColor='#00f413' stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray='3 3' vertical={false} />
            <XAxis
              dataKey='year'
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fontWeight: 600 }}
              dy={10}
            />
            <YAxis axisLine={false} tickLine={false} />
            <Tooltip />
            <Area
              type='monotone'
              dataKey='value'
              stroke='var(--green)'
              fillOpacity={1}
              fill='url(#colorGrowth)'
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const RegistrationTrendChart = ({ trends }) => {
  if (!trends) return null;

  const chartData = trends.current_data.map((item, index) => {
    const prevItem = trends.previous_data[index] || {};
    return {
      month: item.month,
      current: item.total,
      previous: prevItem.total || 0,
    };
  });

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartHeader}>
        <div className={styles.chartTitle}>Registration Trend</div>
        <div className={styles.trendLegend}>
          <div className={styles.legendItem}>
            <div
              className={styles.legendColorBox}
              style={{ backgroundColor: '#EE0808' }}
            ></div>
            <span>{trends.current_label}</span>
          </div>
          <div className={styles.legendItem}>
            <div
              className={styles.legendColorBox}
              style={{ backgroundColor: '#5F84FE' }}
            ></div>
            <span>{trends.previous_label}</span>
          </div>
        </div>
      </div>
      <div className={styles.chartContainer}>
        <ResponsiveContainer width='100%' height='100%'>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray='3 3' vertical={false} />
            <XAxis
              dataKey='month'
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fontWeight: 600 }}
              dy={10}
            />
            <YAxis axisLine={false} tickLine={false} />
            <Tooltip />
            <Line
              type='monotone'
              dataKey='current' // Merah
              stroke='#EE0808'
              strokeWidth={3}
              dot={false}
              name={trends.current_label}
            />
            <Line
              type='monotone'
              dataKey='previous' // Biru
              stroke='#5F84FE'
              strokeWidth={3}
              dot={false}
              name={trends.previous_label}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// --- MAIN ANALYTICS COMPONENT ---
const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Memulai fetch analytics...'); // 1. Cek apakah fungsi jalan
        const response = await getAnalytics();

        console.log('Response dari API:', response); // 2. LIHAT INI DI CONSOLE

        if (response && response.success) {
          console.log('Set Data berhasil:', response.data);
          setData(response.data);
        } else {
          console.error('Response success bukan true:', response);
        }
      } catch (error) {
        console.error('Error fetching analytics (Masuk Catch):', error);
        // Cek apakah ada detail response dari api.js
        if (error.response) {
          console.error('Detail Error Backend:', error.response);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className={styles.mainContainer}>
        <p>Loading analytics...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={styles.mainContainer}>
        <p>No data available.</p>
      </div>
    );
  }

  const global = data.global;
  const sy = data.school_year;

  // 2. Data Active Students Matrix
  const activeMatrix = data.active_students_matrix;

  // Data Chart untuk Active Student (Bar Chart Tengah)
  const activeStudentChartData = [
    { name: 'HS', value: activeMatrix.High.total, max: 1000 },
    { name: 'MS', value: activeMatrix.Middle.total, max: 1000 },
    { name: 'ES', value: activeMatrix.Elementary.total, max: 1000 },
    { name: 'ECP', value: activeMatrix.ECP.total, max: 1000 },
  ];

  // 3. Data Served Students (Donut Charts)
  const servedSummary = data.enrollment_unique_students.summary;
  const servedTotal = servedSummary.total;

  // Helper untuk donut data (Value vs Sisa)
  const getDonutData = (val, max) => [{ value: val }, { value: max - val }];

  return (
    <div className={styles.mainContainer}>
      <div className={styles.headerSection}>
        <div className={styles.pageTitle}>Analytics</div>
      </div>

      <div className={styles.topSectionSplit}>
        {/* WRAPPER KIRI */}
        <div className={styles.leftColumnWrapper}>
          <div className={styles.preRegisteredHeader}>
            Registration Stats ({data.meta.current_sy})
            <FaSync style={{ fontSize: '12px', marginLeft: '6px' }} />
          </div>

          <div className={styles.leftColumnCards}>
            {/* Menggunakan data GLOBAL untuk Total Registration */}
            <SimpleStatCard
              title='Total Registration'
              count={global.total}
              growth={global.total_growth}
            />
            <DetailedStatCard title='Total Registration (New)' data={sy.new} />
            <DetailedStatCard
              title='Total Registration (Returning)'
              data={sy.returning}
            />
          </div>
        </div>

        {/* WRAPPER KANAN */}
        <div className={styles.rightColumnCards}>
          <OrangePieCard syData={sy} />
          <DetailedStatCard
            title='Total Registration (Transfer)'
            data={sy.transferee}
          />
        </div>
      </div>

      {/* --- BAGIAN 2: TENGAH --- */}
      <div className={styles.dashboardGrid}>
        <div className={`${styles.sectionCard} ${styles.activeStudentCard}`}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitle}>Active Students</div>
            <div style={{ fontSize: '12px', color: 'var(--main-grey)' }}>
              S.Y {data.meta.current_sy}
            </div>
          </div>
          <div className={styles.activeBigNumber}>
            <div className={styles.statValue}>
              {formatNumber(activeMatrix.Total.total)}
            </div>
            <FaUserFriends className={styles.statIcon} />
          </div>
          <div className={styles.activeChartContainer}>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart
                data={activeStudentChartData}
                margin={{ top: 20, right: 0, left: -25, bottom: 0 }}
              >
                <XAxis
                  dataKey='name'
                  tick={{ fontSize: 12, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#7A7A7A' }}
                />
                <Tooltip />
                <Bar
                  dataKey='value'
                  fill='var(--green)'
                  radius={[20, 20, 20, 20]}
                  barSize={24}
                  background={{ fill: '#f0f0f0', radius: [20, 20, 20, 20] }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={styles.rightColumnStack}>
          {/* Gross Card menggunakan data Global & Monthly Trends untuk chart kecil */}
          <GrossStatCard globalData={global} trendData={data.monthly_trends} />

          <div className={`${styles.sectionCard} ${styles.servedStudentsCard}`}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitle}>Total Served Students</div>
              <div
                className={styles.trendContainer}
                style={{ cursor: 'pointer', color: 'var(--main-accent)' }}
              >
                All Levels <FaSync style={{ fontSize: '10px' }} />
              </div>
            </div>
            <div
              className={styles.activeBigNumber}
              style={{ marginBottom: '20px' }}
            >
              <div className={styles.textGradientPurple}>
                {formatNumber(servedTotal)}
              </div>
              <FaUserFriends className={styles.statIcon} />
            </div>
            <div className={styles.servedStatsGrid}>
              {/* Graduate Donut */}
              <div className={styles.donutStat}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={getDonutData(servedSummary.graduate, servedTotal)}
                      innerRadius={60}
                      outerRadius={80}
                      dataKey='value'
                      stroke='none'
                      startAngle={90}
                      endAngle={-270}
                      paddingAngle={5}
                    >
                      <Cell fill='#00C49F' />
                      <Cell fill='var(--main-background)' />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className={styles.donutLabel}>
                  <div className={styles.textGradientGreenSmall}>
                    {formatNumber(servedSummary.graduate)}
                  </div>
                  <div
                    className={`${styles.donutText} ${styles.textGradientGreenSmall}`}
                  >
                    Graduated <br /> Students
                  </div>
                </div>
              </div>

              {/* Withdrawn Donut */}
              <div className={styles.donutStat}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={getDonutData(servedSummary.withdraw, servedTotal)}
                      innerRadius={60}
                      outerRadius={80}
                      dataKey='value'
                      stroke='none'
                      startAngle={90}
                      endAngle={-270}
                      paddingAngle={5}
                    >
                      <Cell fill='#ca66ff' />
                      <Cell fill='var(--main-background)' />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className={styles.donutLabel}>
                  <div className={styles.textGradientPinkSmall}>
                    {formatNumber(servedSummary.withdraw)}
                  </div>
                  <div
                    className={`${styles.donutText} ${styles.textGradientPinkSmall}`}
                  >
                    Withdrawn <br /> Students
                  </div>
                </div>
              </div>

              {/* Expelled Donut */}
              <div className={styles.donutStat}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={getDonutData(servedSummary.expelled, servedTotal)}
                      innerRadius={60}
                      outerRadius={80}
                      dataKey='value'
                      stroke='none'
                      startAngle={90}
                      endAngle={-270}
                      paddingAngle={5}
                    >
                      <Cell fill='#FF8042' />
                      <Cell fill='var(--main-background)' />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className={styles.donutLabel}>
                  <div className={styles.textGradientOrangeSmall}>
                    {formatNumber(servedSummary.expelled)}
                  </div>
                  <div
                    className={`${styles.donutText} ${styles.textGradientOrangeSmall}`}
                  >
                    Expelled <br /> Students
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ActiveStudentsTable
        matrixData={activeMatrix}
        syName={data.meta.current_sy}
      />

      <div className={styles.bottomChartsGrid}>
        <RegistrationGrowthChart data={data.multi_year_trend} />
        <RegistrationTrendChart trends={data.monthly_trends} />
      </div>
    </div>
  );
};

export default Analytics;
