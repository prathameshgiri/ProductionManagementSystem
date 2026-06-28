/**
 * Reports.jsx - PDF Reports Generation Page
 */
import { useState } from 'react';
import Breadcrumb from '../components/layout/Breadcrumb';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';
import { dashboardService, productionService, inventoryService, qualityService } from '../services';
import { FiFileText, FiDownload, FiBarChart2, FiPackage, FiClipboard, FiZap } from 'react-icons/fi';
import jsPDF from 'jspdf';

const REPORT_TYPES = [
  { id: 'dashboard', label: 'Dashboard Summary', icon: <FiBarChart2 />, description: 'KPI overview and production stats', color: 'indigo', fetchFn: () => dashboardService.getStats() },
  { id: 'production', label: 'Production Report', icon: <FiZap />, description: 'All production orders and status', color: 'blue', fetchFn: () => productionService.getAll({ limit: 100 }) },
  { id: 'inventory', label: 'Inventory Report', icon: <FiPackage />, description: 'Complete inventory list with stock levels', color: 'green', fetchFn: () => inventoryService.getAll({ limit: 100 }) },
  { id: 'quality', label: 'Quality Report', icon: <FiClipboard />, description: 'Inspection records and defect analysis', color: 'purple', fetchFn: () => qualityService.getAll({ limit: 100 }) },
];

const Reports = () => {
  const [loading, setLoading] = useState({});

  const generatePDF = async (report) => {
    setLoading(prev => ({ ...prev, [`${report.id}_pdf`]: true }));
    try {
      const res = await report.fetchFn();
      const data = res.data.data;

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const now = new Date().toLocaleString();

      // Header
      doc.setFillColor(99, 102, 241);
      doc.rect(0, 0, pageWidth, 35, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('PMS Factory - ' + report.label, 14, 15);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('Generated: ' + now, 14, 25);

      doc.setTextColor(0, 0, 0);
      let y = 50;

      if (report.id === 'dashboard') {
        // KPI table
        const stats = data;
        const kpis = [
          ['Total Products', stats.totalProducts],
          ['Production Orders', stats.totalProductionOrders],
          ['Pending Orders', stats.pendingOrders],
          ['Completed Orders', stats.completedOrders],
          ['Total Employees', stats.totalEmployees],
          ['Low Stock Alerts', stats.lowStockCount],
          ['Machine Utilization', stats.machineUtilization + '%'],
          ['Revenue (Completed)', '₹' + stats.revenue?.toLocaleString()],
          ['Defective Products', stats.defectiveProducts + ' units'],
        ];
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Key Performance Indicators', 14, y);
        y += 8;
        doc.setFontSize(10);
        kpis.forEach(([label, val]) => {
          doc.setFont('helvetica', 'normal');
          doc.text(`${label}:`, 14, y);
          doc.setFont('helvetica', 'bold');
          doc.text(String(val ?? '–'), 100, y);
          y += 8;
        });
      } else if (Array.isArray(data)) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`Total Records: ${data.length}`, 14, y);
        y += 10;

        data.slice(0, 40).forEach((item, idx) => {
          if (y > 270) { doc.addPage(); y = 20; }
          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          const name = item.name || item.productName || item.orderId || `Record ${idx + 1}`;
          doc.text(`${idx + 1}. ${name}`, 14, y);
          doc.setFont('helvetica', 'normal');

          // Secondary info per type
          if (report.id === 'production') {
            doc.text(`Status: ${item.status} | Qty: ${item.quantity} | Plan: ${item.planType}`, 14, y + 5);
          } else if (report.id === 'inventory') {
            doc.text(`Category: ${item.category} | Qty: ${item.quantity} ${item.unit} | Cost: ₹${item.unitCost}`, 14, y + 5);
          } else if (report.id === 'quality') {
            doc.text(`Product: ${item.productName} | Inspected: ${item.inspectedQuantity} | Passed: ${item.passedQuantity} | Status: ${item.status}`, 14, y + 5);
          }
          y += 14;
        });
      }

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(128, 128, 128);
        doc.text(`PMS Factory | ${report.label} | Page ${i} of ${pageCount}`, 14, 290);
        doc.text('Confidential', pageWidth - 40, 290);
      }

      doc.save(`PMS_${report.label.replace(/ /g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success(`${report.label} downloaded!`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, [`${report.id}_pdf`]: false }));
    }
  };

  const generateCSV = async (report) => {
    setLoading(prev => ({ ...prev, [`${report.id}_csv`]: true }));
    try {
      const res = await report.fetchFn();
      let data = res.data.data;
      
      let csvContent = "data:text/csv;charset=utf-8,";
      
      if (report.id === 'dashboard') {
        csvContent += "Metric,Value\n";
        csvContent += `Total Products,${data.totalProducts}\n`;
        csvContent += `Production Orders,${data.totalProductionOrders}\n`;
        csvContent += `Pending Orders,${data.pendingOrders}\n`;
        csvContent += `Completed Orders,${data.completedOrders}\n`;
        csvContent += `Total Employees,${data.totalEmployees}\n`;
        csvContent += `Low Stock Alerts,${data.lowStockCount}\n`;
        csvContent += `Machine Utilization,${data.machineUtilization}%\n`;
        csvContent += `Revenue (Completed),${data.revenue}\n`;
        csvContent += `Defective Products,${data.defectiveProducts}\n`;
      } else if (Array.isArray(data) && data.length > 0) {
        // Extract headers from first object
        const headers = Object.keys(data[0]);
        csvContent += headers.join(",") + "\n";
        
        // Add rows
        data.forEach(item => {
          let row = headers.map(header => {
            let val = item[header] === null || item[header] === undefined ? '' : item[header];
            // Escape quotes and wrap in quotes if contains comma
            val = String(val).replace(/"/g, '""');
            return `"${val}"`;
          });
          csvContent += row.join(",") + "\n";
        });
      } else {
        csvContent += "No data available\n";
      }

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `PMS_${report.label.replace(/ /g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`${report.label} exported to CSV!`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate CSV. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, [`${report.id}_csv`]: false }));
    }
  };

  const colorBg = { indigo: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400', blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400', green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400', purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' };

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <div><Breadcrumb /><h1 className="page-title">Reports</h1><p className="text-sm text-gray-500 dark:text-gray-400">Generate and download PDF and CSV reports for any module</p></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
        {REPORT_TYPES.map(report => (
          <div key={report.id} className="card p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${colorBg[report.color]}`}>
                {report.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{report.label}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{report.description}</p>
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<FiDownload />}
                    loading={loading[`${report.id}_pdf`]}
                    onClick={() => generatePDF(report)}
                  >
                    PDF
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<FiFileText />}
                    loading={loading[`${report.id}_csv`]}
                    onClick={() => generateCSV(report)}
                  >
                    CSV (Excel)
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 card p-5 bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800">
        <div className="flex items-start gap-3">
          <FiFileText className="text-primary-600 dark:text-primary-400 text-xl flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-primary-800 dark:text-primary-300 mb-1">About Reports</h3>
            <ul className="text-sm text-primary-700 dark:text-primary-400 space-y-1">
              <li>• Reports are generated directly in your browser — no server upload needed</li>
              <li>• Data is fetched from the live database at time of generation</li>
              <li>• CSV files can be opened in Microsoft Excel or Google Sheets</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
