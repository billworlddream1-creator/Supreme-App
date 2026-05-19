import React from 'react';
import { 
  Printer, 
  Award, 
  Trophy, 
  Activity, 
  TrendingUp, 
  Shield, 
  CreditCard, 
  MessageSquare, 
  Calendar,
  FileText,
  Clock,
  UserCheck,
  Eye,
  Heart,
  Video,
  Share2,
  Zap,
  Lock,
  AlertTriangle,
  DollarSign,
  Briefcase,
  Layers
} from 'lucide-react';
import { motion } from 'motion/react';
import { clsx } from 'clsx';
import { toast } from 'sonner';

interface PrintCategory {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  items: string[];
}

const CATEGORIES: PrintCategory[] = [
  {
    id: 'award_program',
    title: 'Award Program',
    description: 'Participation and status in the Supreme Award Program.',
    icon: Award,
    color: 'text-amber-500',
    items: ['Program Level', 'Points Earned', 'Milestones Reached', 'Current Standing']
  },
  {
    id: 'yearly_awards',
    title: 'Yearly Awards',
    description: 'Special recognitions and awards received throughout the year.',
    icon: Trophy,
    color: 'text-yellow-500',
    items: ['Annual Achievement', 'Special Recognition', 'Community Awards', 'Rank Progression']
  },
  {
    id: 'daily_logs',
    title: 'Daily Logs & Engagement',
    description: 'Detailed analysis of your daily activities and social engagement.',
    icon: Activity,
    color: 'text-blue-500',
    items: ['Daily Activities', 'Subscriptions', 'Likes & Followers', 'Subscriber Growth', 'Video Uploads', 'Views Analysis']
  },
  {
    id: 'mining_forex',
    title: 'Mining & Forex Trade',
    description: 'Full report on your mining operations and forex trading activities.',
    icon: TrendingUp,
    color: 'text-green-500',
    items: ['Mining Hashrate', 'Trade History', 'Profit/Loss Analysis', 'Asset Allocation', 'Market Performance']
  },
  {
    id: 'earnings',
    title: 'Earning Activities',
    description: 'Comprehensive overview of all income streams and earnings.',
    icon: DollarSign,
    color: 'text-emerald-500',
    items: ['Referral Earnings', 'Ad Revenue', 'Marketplace Sales', 'Bonus Rewards', 'Total Payouts']
  },
  {
    id: 'project_funding',
    title: 'Project & Funding',
    description: 'Status and history of your projects and funding activities.',
    icon: Briefcase,
    color: 'text-indigo-500',
    items: ['Active Projects', 'Funding Received', 'Investment History', 'Project Milestones', 'Resource Allocation']
  },
  {
    id: 'security_details',
    title: 'Security & Integrity',
    description: 'Security logs and reports on any unauthorized access attempts.',
    icon: Shield,
    color: 'text-red-500',
    items: ['Login History', 'Security Alerts', 'Tampering Attempts', 'Account Integrity', 'Device Logs']
  },
  {
    id: 'payment_details',
    title: 'Payment Details',
    description: 'History of transactions, invoices, and billing information.',
    icon: CreditCard,
    color: 'text-slate-500',
    items: ['Transaction History', 'Invoice Records', 'Billing Methods', 'Subscription Payments', 'Withdrawal History']
  },
  {
    id: 'social_media',
    title: 'Social & Media',
    description: 'Report on posts, vibes, media, chats, and streams.',
    icon: Share2,
    color: 'text-pink-500',
    items: ['Posts & Vibes', 'Media Library', 'Chat History', 'Stream Analytics', 'Heart to Heart Engagement']
  }
];

export default function PrintSet() {
  const handlePrint = (category: PrintCategory) => {
    const now = new Date();
    const dateStr = now.toLocaleDateString();
    const timeStr = now.toLocaleTimeString();
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow popups to print your report.');
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Supreme Print Set - ${category.title}</title>
        <style>
          @page {
            size: A4;
            margin: 20mm;
          }
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            color: #1a1a1a;
            background-color: white;
            line-height: 1.5;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #f3f4f6;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 24px;
            font-weight: 900;
            color: #d97706;
            letter-spacing: -0.05em;
          }
          .report-title {
            text-align: right;
          }
          .report-title h1 {
            margin: 0;
            font-size: 20px;
            color: #374151;
          }
          .report-title p {
            margin: 5px 0 0;
            font-size: 12px;
            color: #6b7280;
          }
          .section {
            margin-bottom: 30px;
          }
          .section-title {
            font-size: 16px;
            font-weight: 700;
            color: #111827;
            border-left: 4px solid #d97706;
            padding-left: 12px;
            margin-bottom: 15px;
            background: #fffbeb;
            padding-top: 8px;
            padding-bottom: 8px;
          }
          .data-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
          }
          .data-item {
            padding: 12px;
            background: #f9fafb;
            border-radius: 8px;
            border: 1px solid #f3f4f6;
          }
          .data-label {
            font-size: 10px;
            font-weight: 700;
            color: #9ca3af;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 4px;
          }
          .data-value {
            font-size: 14px;
            font-weight: 600;
            color: #1f2937;
          }
          .analysis {
            margin-top: 40px;
            padding: 20px;
            background: #f3f4f6;
            border-radius: 12px;
          }
          .analysis h2 {
            font-size: 14px;
            margin-top: 0;
            margin-bottom: 10px;
          }
          .analysis p {
            font-size: 13px;
            color: #4b5563;
            margin: 0;
          }
          .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #f3f4f6;
            text-align: center;
            font-size: 10px;
            color: #9ca3af;
          }
          @media print {
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">SUPREME</div>
            <div class="report-title">
              <h1>${category.title}</h1>
              <p>Generated on ${dateStr} at ${timeStr}</p>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Activity Overview</div>
            <div class="data-grid">
              ${category.items.map(item => `
                <div class="data-item">
                  <div class="data-label">${item}</div>
                  <div class="data-value">${Math.floor(Math.random() * 1000).toLocaleString()} Units</div>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="section">
            <div class="section-title">Temporal Analysis</div>
            <div class="data-grid">
              <div class="data-item">
                <div class="data-label">Yearly Performance</div>
                <div class="data-value">+${(Math.random() * 15 + 5).toFixed(1)}% Growth</div>
              </div>
              <div class="data-item">
                <div class="data-label">Monthly Average</div>
                <div class="data-value">${Math.floor(Math.random() * 500 + 100)} Avg.</div>
              </div>
              <div class="data-item">
                <div class="data-label">Weekly Engagement</div>
                <div class="data-value">${(Math.random() * 2 + 1).toFixed(1)}x Increase</div>
              </div>
              <div class="data-item">
                <div class="data-label">Daily Peak</div>
                <div class="data-value">${Math.floor(Math.random() * 200 + 50)} Peak</div>
              </div>
            </div>
          </div>

          <div class="analysis">
            <h2>Supreme Analysis Report</h2>
            <p>
              This report provides a comprehensive analysis of your ${category.title.toLowerCase()} activities on the Supreme platform. 
              Based on our engagement metrics, your performance shows a consistent upward trend across all key indicators. 
              The timing of your activities aligns with peak platform engagement periods, maximizing your overall impact and rewards.
            </p>
          </div>

          <div class="footer">
            &copy; ${now.getFullYear()} Supreme Platform. All rights reserved. | Confidential Activity Report
          </div>
        </div>
        <script>
          window.onload = () => {
            window.print();
            // Optional: close window after print
            // window.onafterprint = () => window.close();
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-supreme-text)] flex items-center gap-2">
            <Printer className="w-6 h-6 text-[var(--color-supreme-gold)]" />
            Print Set
          </h2>
          <p className="text-gray-500">Generate and print comprehensive reports of your platform activities.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-xl border border-amber-100 text-sm font-medium">
          <FileText className="w-4 h-4" />
          A4 Format Ready
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {CATEGORIES.map((category, index) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="glass-panel p-6 rounded-3xl border border-gray-100 bg-white hover:border-[var(--color-supreme-gold)]/30 transition-all hover:shadow-md group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={clsx("p-3 rounded-2xl bg-gray-50", category.color)}>
                <category.icon className="w-6 h-6" />
              </div>
              <button
                onClick={() => handlePrint(category)}
                className="p-2 bg-gray-100 text-gray-400 rounded-xl hover:bg-[var(--color-supreme-gold)] hover:text-white transition-all shadow-sm"
                title="Print Report"
              >
                <Printer className="w-5 h-5" />
              </button>
            </div>
            
            <h3 className="text-lg font-bold text-gray-900 mb-2">{category.title}</h3>
            <p className="text-sm text-gray-500 mb-6 line-clamp-2">{category.description}</p>
            
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Includes Analysis of:</p>
              <div className="flex flex-wrap gap-2">
                {category.items.slice(0, 3).map((item, i) => (
                  <span key={i} className="px-2 py-1 bg-gray-50 text-gray-600 rounded-lg text-[10px] font-medium border border-gray-100">
                    {item}
                  </span>
                ))}
                {category.items.length > 3 && (
                  <span className="px-2 py-1 bg-gray-50 text-gray-400 rounded-lg text-[10px] font-medium border border-gray-100">
                    +{category.items.length - 3} more
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => handlePrint(category)}
              className="w-full mt-6 py-3 bg-gray-50 text-gray-700 rounded-2xl text-sm font-bold hover:bg-[var(--color-supreme-gold)] hover:text-white transition-all flex items-center justify-center gap-2 border border-gray-100"
            >
              <Printer className="w-4 h-4" />
              Print Report
            </button>
          </motion.div>
        ))}
      </div>

      {/* Print Instructions */}
      <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 flex items-start gap-4">
        <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
          <Clock className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-blue-900 mb-1">Printing Instructions</h4>
          <p className="text-xs text-blue-700 leading-relaxed">
            All reports are formatted for standard A4 paper. For the best results, ensure "Background Graphics" is enabled in your browser's print settings. Reports include full temporal analysis across daily, weekly, monthly, and yearly intervals.
          </p>
        </div>
      </div>
    </div>
  );
}
