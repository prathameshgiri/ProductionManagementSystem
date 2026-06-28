/**
 * Dashboard.jsx - Main Dashboard Page
 * 
 * Features:
 * - 10 KPI stat cards
 * - 6 charts: Monthly Production, Inventory, Employee Performance,
 *             Machine Utilization, Revenue Trend, Production Status
 * - Loading skeletons
 * - Real data from backend aggregation API
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../services';
import StatCard from '../components/ui/StatCard';
import { StatCardSkeleton, ChartSkeleton } from '../components/ui/Skeleton';
import Breadcrumb from '../components/layout/Breadcrumb';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, LineElement, PointElement,
  ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  FiBox, FiZap, FiCheckCircle, FiClock, FiPackage, FiAlertCircle,
  FiTool, FiUsers, FiDollarSign, FiXCircle, FiActivity, FiBarChart2
} from 'react-icons/fi';
import toast from 'react-hot-toast';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler);

// Common chart options
const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { mode: 'index', intersect: false },
  },
};

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingCharts, setLoadingCharts] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchCharts();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await dashboardService.getStats();
      setStats(res.data.data);
    } catch (err) {
      toast.error('Failed to load dashboard stats');
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchCharts = async () => {
    try {
      const res = await dashboardService.getCharts();
      setCharts(res.data.data);
    } catch (err) {
      toast.error('Failed to load chart data');
    } finally {
      setLoadingCharts(false);
    }
  };

  // Tailwind-friendly dark-mode chart colors
  const isDark = document.documentElement.classList.contains('dark');
  const gridColor = isDark ? 'rgba(51,65,85,0.8)' : 'rgba(229,231,235,0.8)';
  const textColor = isDark ? '#94a3b8' : '#6b7280';

  const chartAxisDefaults = {
    grid: { color: gridColor },
    ticks: { color: textColor, font: { size: 11 } },
  };

  // KPI card definitions
  const kpiCards = stats ? [
    { title: 'Total Products', value: stats.totalProducts, icon: <FiBox />, color: 'indigo' },
    { title: 'Production Orders', value: stats.totalProductionOrders, icon: <FiBarChart2 />, color: 'blue' },
    { title: "Today's Production", value: stats.todayProduction, icon: <FiZap />, color: 'cyan', suffix: ' units' },
    { title: 'Machine Utilization', value: stats.machineUtilization, icon: <FiTool />, color: 'purple', suffix: '%' },
    { title: 'Inventory Items', value: stats.totalInventoryItems, icon: <FiPackage />, color: 'teal' },
    { title: 'Low Stock Alerts', value: stats.lowStockCount, icon: <FiAlertCircle />, color: 'orange', subtitle: 'Items below reorder' },
    { title: 'Pending Orders', value: stats.pendingOrders, icon: <FiClock />, color: 'yellow' },
    { title: 'Completed Orders', value: stats.completedOrders, icon: <FiCheckCircle />, color: 'green' },
    { title: 'Revenue', value: `₹${stats.revenue.toLocaleString()}`, icon: <FiDollarSign />, color: 'green', subtitle: 'From completed orders' },
    { title: 'Defective Products', value: stats.defectiveProducts, icon: <FiXCircle />, color: 'red', suffix: ' units' },
  ] : [];

  return (
    <div className="page-container animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <Breadcrumb />
          <h1 className="page-title">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Welcome back, <span className="font-semibold text-primary-600 dark:text-primary-400">{user?.name?.split(' ')[0]}</span>! Here's what's happening today.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <FiActivity className="text-green-500" />
          <span>Live Data</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
        {loadingStats
          ? Array.from({ length: 10 }).map((_, i) => <StatCardSkeleton key={i} />)
          : kpiCards.map((card, i) => <StatCard key={i} {...card} />)
        }
      </div>

      {/* Charts - Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">

        {/* Monthly Production Chart */}
        {loadingCharts ? <ChartSkeleton /> : (
          <div className="card p-5">
            <h3 className="section-title mb-4">Monthly Production</h3>
            <div className="chart-container">
              <Bar
                data={{
                  labels: charts?.monthlyProduction?.map(d => d.month) || [],
                  datasets: [{
                    label: 'Units Produced',
                    data: charts?.monthlyProduction?.map(d => d.produced) || [],
                    backgroundColor: 'rgba(99,102,241,0.8)',
                    borderRadius: 6,
                    borderSkipped: false,
                  }],
                }}
                options={{
                  ...chartDefaults,
                  plugins: { ...chartDefaults.plugins, legend: { display: false } },
                  scales: {
                    x: chartAxisDefaults,
                    y: { ...chartAxisDefaults, beginAtZero: true },
                  },
                }}
              />
            </div>
          </div>
        )}

        {/* Revenue Trend */}
        {loadingCharts ? <ChartSkeleton /> : (
          <div className="card p-5">
            <h3 className="section-title mb-4">Revenue Trend</h3>
            <div className="chart-container">
              <Line
                data={{
                  labels: charts?.revenueTrend?.map(d => d.month) || [],
                  datasets: [{
                    label: 'Revenue (₹)',
                    data: charts?.revenueTrend?.map(d => d.revenue) || [],
                    borderColor: '#22c55e',
                    backgroundColor: 'rgba(34,197,94,0.1)',
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#22c55e',
                    pointRadius: 4,
                  }],
                }}
                options={{
                  ...chartDefaults,
                  scales: {
                    x: chartAxisDefaults,
                    y: { ...chartAxisDefaults, beginAtZero: true, ticks: { ...chartAxisDefaults.ticks, callback: (v) => `₹${(v/1000).toFixed(0)}k` } },
                  },
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Charts - Row 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">

        {/* Production Status Donut */}
        {loadingCharts ? <ChartSkeleton /> : (
          <div className="card p-5">
            <h3 className="section-title mb-4">Order Status</h3>
            <div className="chart-container" style={{ height: 220 }}>
              <Doughnut
                data={{
                  labels: ['Pending', 'In Progress', 'Completed', 'Cancelled'],
                  datasets: [{
                    data: [
                      charts?.productionStatus?.pending || 0,
                      charts?.productionStatus?.in_progress || 0,
                      charts?.productionStatus?.completed || 0,
                      charts?.productionStatus?.cancelled || 0,
                    ],
                    backgroundColor: ['#f59e0b', '#3b82f6', '#22c55e', '#ef4444'],
                    borderWidth: 0,
                    hoverOffset: 8,
                  }],
                }}
                options={{
                  ...chartDefaults,
                  plugins: { legend: { display: true, position: 'bottom', labels: { color: textColor, padding: 12, font: { size: 11 } } } },
                  cutout: '65%',
                }}
              />
            </div>
          </div>
        )}

        {/* Machine Utilization Bar */}
        {loadingCharts ? <ChartSkeleton /> : (
          <div className="card p-5">
            <h3 className="section-title mb-4">Machine Utilization</h3>
            <div className="chart-container" style={{ height: 220 }}>
              <Bar
                data={{
                  labels: charts?.machineUtilization?.slice(0, 6).map(m => m.name) || [],
                  datasets: [{
                    label: 'Utilization %',
                    data: charts?.machineUtilization?.slice(0, 6).map(m => m.utilization) || [],
                    backgroundColor: charts?.machineUtilization?.slice(0, 6).map(m =>
                      m.status === 'running' ? 'rgba(99,102,241,0.8)' :
                      m.status === 'breakdown' ? 'rgba(239,68,68,0.8)' :
                      m.status === 'maintenance' ? 'rgba(245,158,11,0.8)' : 'rgba(148,163,184,0.6)'
                    ) || [],
                    borderRadius: 4,
                  }],
                }}
                options={{
                  ...chartDefaults,
                  indexAxis: 'y',
                  scales: {
                    x: { ...chartAxisDefaults, max: 100, ticks: { ...chartAxisDefaults.ticks, callback: v => v + '%' } },
                    y: chartAxisDefaults,
                  },
                }}
              />
            </div>
          </div>
        )}

        {/* Employee Performance */}
        {loadingCharts ? <ChartSkeleton /> : (
          <div className="card p-5">
            <h3 className="section-title mb-4">Employee Performance</h3>
            <div className="chart-container" style={{ height: 220 }}>
              <Bar
                data={{
                  labels: charts?.employeePerformance?.map(e => e.name) || [],
                  datasets: [{
                    label: 'Performance %',
                    data: charts?.employeePerformance?.map(e => e.performance) || [],
                    backgroundColor: 'rgba(168,85,247,0.8)',
                    borderRadius: 4,
                  }],
                }}
                options={{
                  ...chartDefaults,
                  scales: {
                    x: chartAxisDefaults,
                    y: { ...chartAxisDefaults, min: 60, max: 100, ticks: { ...chartAxisDefaults.ticks, callback: v => v + '%' } },
                  },
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Machine Status Summary + Shift Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Machine Status */}
        {stats && (
          <div className="card p-5">
            <h3 className="section-title mb-4">Machine Status</h3>
            <div className="space-y-3">
              {[
                { label: 'Running', count: stats.machines?.running, color: 'bg-green-500', text: 'text-green-600 dark:text-green-400' },
                { label: 'Idle', count: stats.machines?.idle, color: 'bg-gray-400', text: 'text-gray-600 dark:text-gray-400' },
                { label: 'Maintenance', count: stats.machines?.maintenance, color: 'bg-yellow-500', text: 'text-yellow-600 dark:text-yellow-400' },
                { label: 'Breakdown', count: stats.machines?.breakdown, color: 'bg-red-500', text: 'text-red-600 dark:text-red-400' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 ${item.color}`} />
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
                      <span className={`font-semibold ${item.text}`}>{item.count} machines</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 dark:bg-dark-border rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full`} style={{ width: `${(item.count / stats.machines?.total) * 100}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Shift Summary */}
        {stats && (
          <div className="card p-5">
            <h3 className="section-title mb-4">Shift Distribution</h3>
            <div className="space-y-4">
              {[
                { label: 'Morning Shift', count: stats.shifts?.morning, icon: '🌅', color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400' },
                { label: 'Evening Shift', count: stats.shifts?.evening, icon: '🌆', color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400' },
                { label: 'Night Shift', count: stats.shifts?.night, icon: '🌙', color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400' },
              ].map(shift => (
                <div key={shift.label} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-dark-hover">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{shift.icon}</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{shift.label}</span>
                  </div>
                  <span className={`text-sm font-bold px-3 py-1 rounded-full ${shift.color}`}>
                    {shift.count} active
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
