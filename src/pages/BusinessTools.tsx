import React, { useState, useRef } from 'react';
import { 
  Briefcase, 
  Users, 
  CheckSquare, 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  ChevronRight,
  MoreVertical,
  Calendar,
  Layout,
  PieChart,
  Settings,
  Mail,
  Cloud,
  Send,
  Paperclip,
  Save,
  FileSpreadsheet,
  FileIcon,
  Download,
  X,
  Trash2,
  Type,
  Image as ImageIcon,
  MousePointer2,
  Layers,
  History,
  Share2,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  CheckCircle2,
  Copy
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import clsx from 'clsx';
import FeatureLoader from '../components/FeatureLoader';
import WysiwygEditor from '../components/WysiwygEditor';

import DigitalTools from '../components/DigitalTools';

type ToolTab = 'crm' | 'projects' | 'invoicing' | 'email' | 'cloud' | 'utilities';

interface CloudFile {
  id: string;
  name: string;
  type: 'Word' | 'Excel' | 'Publisher';
  date: string;
  size: string;
  icon: any;
  color: string;
  content: any;
}

export default function BusinessTools() {
  const [activeTab, setActiveTab] = useState<ToolTab>('crm');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showNewEntryModal, setShowNewEntryModal] = useState(false);
  const [newEntryType, setNewEntryType] = useState('client');
  const [newEntryData, setNewEntryData] = useState({
    name: '',
    email: '',
    budget: '',
    description: '',
    date: '',
    docType: 'word' as 'word' | 'excel' | 'publisher'
  });

  const [files, setFiles] = useState<CloudFile[]>(() => {
    const saved = localStorage.getItem('supreme-cloud-files');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Re-assign icons because they are functions/components and can't be stringified
        return parsed.map((f: any) => ({
          ...f,
          icon: f.type === 'Word' ? FileText : f.type === 'Excel' ? FileSpreadsheet : FileIcon
        }));
      } catch (e) {
        console.error('Failed to parse saved files:', e);
      }
    }
    return [
      { id: '1', name: 'Q3 Financial Report', type: 'Excel', date: 'Oct 24, 2023', size: '2.4 MB', icon: FileSpreadsheet, color: 'text-green-600', content: [['Revenue', '1000'], ['Expenses', '500'], ['Profit', '500']] },
      { id: '2', name: 'Marketing Campaign Draft', type: 'Word', date: 'Oct 22, 2023', size: '1.1 MB', icon: FileText, color: 'text-blue-600', content: '<h1>Marketing Strategy</h1><p>Our goal is to increase brand awareness by 20% in the next quarter.</p>' },
      { id: '3', name: 'November Newsletter', type: 'Publisher', date: 'Oct 20, 2023', size: '5.8 MB', icon: FileIcon, color: 'text-purple-600', content: [{ id: '1', type: 'text', x: 50, y: 50, text: 'Supreme Newsletter', fontSize: '24px', color: '#000000', width: 300, height: 50 }, { id: '2', type: 'image', x: 50, y: 150, src: 'https://picsum.photos/seed/newsletter/400/200', width: 400, height: 200 }] },
    ];
  });

  React.useEffect(() => {
    const filesToSave = files.map(({ icon, ...rest }) => rest);
    localStorage.setItem('supreme-cloud-files', JSON.stringify(filesToSave));
  }, [files]);

  React.useEffect(() => {
    if (activeTab === 'cloud') {
      setNewEntryType('document');
    } else if (activeTab === 'crm') {
      setNewEntryType('client');
    } else if (activeTab === 'projects') {
      setNewEntryType('project');
    }
  }, [activeTab]);

  const handleCreateDocument = (name: string, type: 'word' | 'excel' | 'publisher') => {
    const newFile: CloudFile = {
      id: Math.random().toString(36).substring(7),
      name: name,
      type: type === 'word' ? 'Word' : type === 'excel' ? 'Excel' : 'Publisher',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      size: '0 KB',
      icon: type === 'word' ? FileText : type === 'excel' ? FileSpreadsheet : FileIcon,
      color: type === 'word' ? 'text-blue-600' : type === 'excel' ? 'text-green-600' : 'text-purple-600',
      content: type === 'word' ? '' : type === 'excel' ? [['', ''], ['', '']] : []
    };
    setFiles(prev => [newFile, ...prev]);
  };

  const handleAddNewEntry = () => {
    if (newEntryType === 'document' && newEntryData.name) {
      handleCreateDocument(newEntryData.name, newEntryData.docType);
      setActiveTab('cloud');
    } else if (newEntryType === 'task' && newEntryData.description) {
      const newTask = {
        id: Date.now().toString(),
        title: newEntryData.description,
        description: '',
        priority: 'medium',
        dueDate: newEntryData.date,
        completed: false,
        createdAt: Date.now(),
        reward: 0,
        rewardClaimed: false
      };
      
      try {
        const savedTasks = localStorage.getItem('supreme-tasks');
        const tasks = savedTasks ? JSON.parse(savedTasks) : [];
        localStorage.setItem('supreme-tasks', JSON.stringify([newTask, ...tasks]));
        // Optional: Show a toast or notification
      } catch (e) {
        console.error('Failed to save task:', e);
      }
    }
    
    setShowNewEntryModal(false);
    setNewEntryData({ name: '', email: '', budget: '', description: '', date: '', docType: 'word' });
  };

  return (
    <FeatureLoader text="Business Suite">
      <div className="max-w-7xl mx-auto space-y-8 pb-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-[var(--color-supreme-text)]">Supreme Business Suite</h1>
            <p className="text-gray-500">Manage your clients, projects, and finances in one place.</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowSettingsModal(true)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2"
            >
              <Settings className="w-4 h-4" /> Settings
            </button>
            <button 
              onClick={() => {
                setNewEntryType(activeTab === 'cloud' ? 'document' : activeTab === 'crm' ? 'client' : activeTab === 'projects' ? 'project' : 'client');
                setShowNewEntryModal(true);
              }}
              className="px-4 py-2 bg-[var(--color-supreme-gold)] text-white rounded-xl font-bold hover:bg-[var(--color-supreme-gold-light)] transition-all shadow-md flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> New Entry
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-4 p-1 bg-gray-100 rounded-2xl border border-gray-200 w-full overflow-x-auto hide-scrollbar">
          <button
            onClick={() => setActiveTab('crm')}
            className={clsx(
              "flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap",
              activeTab === 'crm' ? "bg-white text-[var(--color-supreme-text)] shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            <Users className="w-4 h-4" /> CRM
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={clsx(
              "flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap",
              activeTab === 'projects' ? "bg-white text-[var(--color-supreme-text)] shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            <Layout className="w-4 h-4" /> Projects
          </button>
          <button
            onClick={() => setActiveTab('invoicing')}
            className={clsx(
              "flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap",
              activeTab === 'invoicing' ? "bg-white text-[var(--color-supreme-text)] shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            <FileText className="w-4 h-4" /> Invoicing
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className={clsx(
              "flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap",
              activeTab === 'email' ? "bg-white text-[var(--color-supreme-text)] shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            <Mail className="w-4 h-4" /> Email Marketing
          </button>
          <button
            onClick={() => setActiveTab('cloud')}
            className={clsx(
              "flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap",
              activeTab === 'cloud' ? "bg-white text-[var(--color-supreme-text)] shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            <Cloud className="w-4 h-4" /> Cloud Management
          </button>
          <button
            onClick={() => setActiveTab('utilities')}
            className={clsx(
              "flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap",
              activeTab === 'utilities' ? "bg-white text-[var(--color-supreme-text)] shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            <CheckSquare className="w-4 h-4" /> Utilities
          </button>
        </div>

        {/* Content Area */}
        <div className="min-h-[600px]">
          <AnimatePresence mode="wait">
            {activeTab === 'crm' && <CRMSection key="crm" />}
            {activeTab === 'projects' && <ProjectsSection key="projects" />}
            {activeTab === 'invoicing' && <InvoicingSection key="invoicing" />}
            {activeTab === 'email' && <EmailMarketingSection key="email" />}
            {activeTab === 'cloud' && <CloudManagementSection key="cloud" files={files} setFiles={setFiles} onNewDoc={handleCreateDocument} />}
            {activeTab === 'utilities' && <DigitalTools key="utilities" />}
          </AnimatePresence>
        </div>
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettingsModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                  <Settings className="w-5 h-5" /> Business Settings
                </h2>
                <button onClick={() => setShowSettingsModal(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Company Name</label>
                  <input type="text" defaultValue="Supreme Inc." className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-supreme-gold)] outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Default Currency</label>
                  <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-supreme-gold)] outline-none bg-white">
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Tax Rate (%)</label>
                  <input type="number" defaultValue="10" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-supreme-gold)] outline-none" />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div>
                    <h4 className="font-bold text-gray-800">Email Notifications</h4>
                    <p className="text-xs text-gray-500">Receive alerts for new invoices</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-supreme-gold)]"></div>
                  </label>
                </div>
              </div>
              <div className="p-6 border-t border-gray-100 flex justify-end gap-4 bg-gray-50">
                <button onClick={() => setShowSettingsModal(false)} className="px-6 py-3 font-bold text-gray-600 hover:bg-gray-200 rounded-xl transition-colors">Cancel</button>
                <button onClick={() => setShowSettingsModal(false)} className="px-6 py-3 font-bold text-white bg-[var(--color-supreme-gold)] hover:bg-[var(--color-supreme-gold-light)] rounded-xl transition-colors">Save Changes</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* New Entry Modal */}
      <AnimatePresence>
        {showNewEntryModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                  <Plus className="w-5 h-5" /> Quick Add Entry
                </h2>
                <button onClick={() => setShowNewEntryModal(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Entry Type</label>
                  <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
                    <button 
                      onClick={() => setNewEntryType('client')}
                      className={clsx("flex-1 py-2 text-sm font-bold rounded-lg transition-colors", newEntryType === 'client' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700")}
                    >
                      Client
                    </button>
                    <button 
                      onClick={() => setNewEntryType('project')}
                      className={clsx("flex-1 py-2 text-sm font-bold rounded-lg transition-colors", newEntryType === 'project' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700")}
                    >
                      Project
                    </button>
                    <button 
                      onClick={() => setNewEntryType('task')}
                      className={clsx("flex-1 py-2 text-sm font-bold rounded-lg transition-colors", newEntryType === 'task' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700")}
                    >
                      Task
                    </button>
                    <button 
                      onClick={() => setNewEntryType('document')}
                      className={clsx("flex-1 py-2 text-sm font-bold rounded-lg transition-colors", newEntryType === 'document' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700")}
                    >
                      Document
                    </button>
                  </div>
                </div>

                {newEntryType === 'client' && (
                  <>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Client Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Acme Corp" 
                        value={newEntryData.name}
                        onChange={(e) => setNewEntryData({ ...newEntryData, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-supreme-gold)] outline-none" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                      <input 
                        type="email" 
                        placeholder="contact@acme.com" 
                        value={newEntryData.email}
                        onChange={(e) => setNewEntryData({ ...newEntryData, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-supreme-gold)] outline-none" 
                      />
                    </div>
                  </>
                )}

                {newEntryType === 'project' && (
                  <>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Project Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Website Redesign" 
                        value={newEntryData.name}
                        onChange={(e) => setNewEntryData({ ...newEntryData, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-supreme-gold)] outline-none" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Budget ($)</label>
                      <input 
                        type="number" 
                        placeholder="5000" 
                        value={newEntryData.budget}
                        onChange={(e) => setNewEntryData({ ...newEntryData, budget: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-supreme-gold)] outline-none" 
                      />
                    </div>
                  </>
                )}

                {newEntryType === 'task' && (
                  <>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Task Description</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Follow up with client" 
                        value={newEntryData.description}
                        onChange={(e) => setNewEntryData({ ...newEntryData, description: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-supreme-gold)] outline-none" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Due Date</label>
                      <input 
                        type="date" 
                        value={newEntryData.date}
                        onChange={(e) => setNewEntryData({ ...newEntryData, date: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-supreme-gold)] outline-none" 
                      />
                    </div>
                  </>
                )}

                {newEntryType === 'document' && (
                  <>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Document Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Project Proposal" 
                        value={newEntryData.name}
                        onChange={(e) => setNewEntryData({ ...newEntryData, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-supreme-gold)] outline-none" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Type</label>
                      <select 
                        value={newEntryData.docType}
                        onChange={(e) => setNewEntryData({ ...newEntryData, docType: e.target.value as any })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-supreme-gold)] outline-none bg-white"
                      >
                        <option value="word">Word Document</option>
                        <option value="excel">Excel Spreadsheet</option>
                        <option value="publisher">Publisher Layout</option>
                      </select>
                    </div>
                  </>
                )}
              </div>
              <div className="p-6 border-t border-gray-100 flex justify-end gap-4 bg-gray-50">
                <button onClick={() => setShowNewEntryModal(false)} className="px-6 py-3 font-bold text-gray-600 hover:bg-gray-200 rounded-xl transition-colors">Cancel</button>
                <button 
                  onClick={handleAddNewEntry} 
                  className="px-6 py-3 font-bold text-white bg-[var(--color-supreme-gold)] hover:bg-[var(--color-supreme-gold-light)] rounded-xl transition-colors"
                >
                  Add {newEntryType.charAt(0).toUpperCase() + newEntryType.slice(1)}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </FeatureLoader>
  );
}

function CRMSection() {
  const clients = [
    { id: '1', name: 'Global Tech Solutions', contact: 'Sarah Jenkins', status: 'Active', value: '$12,500', lastContact: '2 days ago' },
    { id: '2', name: 'Elite Real Estate', contact: 'Michael Chen', status: 'Lead', value: '$5,000', lastContact: '5 hours ago' },
    { id: '3', name: 'Vanguard Creative', contact: 'Emma Wilson', status: 'Active', value: '$8,200', lastContact: '1 week ago' },
    { id: '4', name: 'Apex Logistics', contact: 'David Miller', status: 'Inactive', value: '$0', lastContact: '1 month ago' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-gray-200 bg-white">
          <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Total Clients</h3>
          <p className="text-3xl font-bold text-[var(--color-supreme-text)]">124</p>
          <div className="mt-2 flex items-center gap-1 text-green-600 text-sm font-bold">
            <TrendingUp className="w-4 h-4" /> +8% this month
          </div>
        </div>
        <div className="glass-panel p-6 rounded-2xl border border-gray-200 bg-white">
          <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Active Leads</h3>
          <p className="text-3xl font-bold text-[var(--color-supreme-text)]">42</p>
          <div className="mt-2 flex items-center gap-1 text-blue-600 text-sm font-bold">
            <Users className="w-4 h-4" /> 12 new this week
          </div>
        </div>
        <div className="glass-panel p-6 rounded-2xl border border-gray-200 bg-white">
          <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Pipeline Value</h3>
          <p className="text-3xl font-bold text-[var(--color-supreme-text)]">$84,200</p>
          <div className="mt-2 flex items-center gap-1 text-purple-600 text-sm font-bold">
            <PieChart className="w-4 h-4" /> 65% conversion rate
          </div>
        </div>
      </div>

      <div className="glass-panel border border-gray-200 rounded-2xl bg-white overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-gray-800">Recent Clients</h3>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input type="text" placeholder="Search clients..." className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-supreme-gold)]" />
            </div>
            <button className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50"><Filter className="w-4 h-4 text-gray-500" /></button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Client Name</th>
                <th className="px-6 py-4">Contact Person</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Value</th>
                <th className="px-6 py-4">Last Contact</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {clients.map(client => (
                <tr key={client.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4 font-bold text-gray-800">{client.name}</td>
                  <td className="px-6 py-4 text-gray-600">{client.contact}</td>
                  <td className="px-6 py-4">
                    <span className={clsx(
                      "px-2 py-1 rounded-full text-[10px] font-bold uppercase",
                      client.status === 'Active' ? "bg-green-100 text-green-700" :
                      client.status === 'Lead' ? "bg-blue-100 text-blue-700" :
                      "bg-gray-100 text-gray-700"
                    )}>
                      {client.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-800">{client.value}</td>
                  <td className="px-6 py-4 text-gray-500 text-sm">{client.lastContact}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600"><MoreVertical className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

function ProjectsSection() {
  const projects = [
    { id: '1', name: 'Website Redesign', client: 'Global Tech', progress: 75, deadline: 'Oct 24, 2024', team: 3 },
    { id: '2', name: 'Mobile App Dev', client: 'Vanguard Creative', progress: 30, deadline: 'Nov 12, 2024', team: 5 },
    { id: '3', name: 'Marketing Campaign', client: 'Elite Real Estate', progress: 90, deadline: 'Oct 15, 2024', team: 2 },
    { id: '4', name: 'Brand Identity', client: 'Apex Logistics', progress: 10, deadline: 'Dec 05, 2024', team: 4 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="space-y-8"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-800">Active Projects</h3>
            <button className="text-[var(--color-supreme-gold)] font-bold text-sm hover:underline">View All</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {projects.map(project => (
              <div key={project.id} className="glass-panel p-6 rounded-2xl border border-gray-200 bg-white hover:border-[var(--color-supreme-gold)]/30 transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold text-gray-900 group-hover:text-[var(--color-supreme-gold)] transition-colors">{project.name}</h4>
                    <p className="text-xs text-gray-500">{project.client}</p>
                  </div>
                  <div className="p-2 bg-gray-50 rounded-lg text-gray-400"><Clock className="w-4 h-4" /></div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-gray-500">Progress</span>
                      <span className="text-[var(--color-supreme-gold)]">{project.progress}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[var(--color-supreme-gold)] rounded-full transition-all duration-500" style={{ width: `${project.progress}%` }} />
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map(i => (
                        <img key={i} src={`https://picsum.photos/seed/p${i}/32`} className="w-8 h-8 rounded-full border-2 border-white" referrerPolicy="no-referrer" />
                      ))}
                      {project.team > 3 && (
                        <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-gray-500">
                          +{project.team - 3}
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-bold text-gray-400">{project.deadline}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-bold text-gray-800">Project Timeline</h3>
          <div className="glass-panel p-6 rounded-2xl border border-gray-200 bg-white space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-4 relative">
                {i !== 3 && <div className="absolute left-2 top-6 bottom-0 w-0.5 bg-gray-100" />}
                <div className="w-4 h-4 rounded-full bg-[var(--color-supreme-gold)] border-4 border-white shadow-sm shrink-0 z-10" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-gray-400 uppercase">Oct {10 + i}, 2024</p>
                  <h4 className="text-sm font-bold text-gray-800">Milestone reached in Project {i}</h4>
                  <p className="text-xs text-gray-500">Design phase completed and approved by client.</p>
                </div>
              </div>
            ))}
            <button className="w-full py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all">
              View Full Timeline
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function InvoicingSection() {
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [newInvoice, setNewInvoice] = useState({ client: '', amount: '', date: '' });
  const [invoices, setInvoices] = useState([
    { id: 'INV-001', client: 'Global Tech', amount: '$4,200', date: 'Oct 01, 2024', status: 'Paid' },
    { id: 'INV-002', client: 'Vanguard Creative', amount: '$1,500', date: 'Oct 05, 2024', status: 'Pending' },
    { id: 'INV-003', client: 'Elite Real Estate', amount: '$2,800', date: 'Oct 08, 2024', status: 'Overdue' },
    { id: 'INV-004', client: 'Apex Logistics', amount: '$5,000', date: 'Oct 10, 2024', status: 'Pending' },
  ]);

  const handleCreateInvoice = () => {
    if (!newInvoice.client || !newInvoice.amount) return;
    const id = `INV-00${invoices.length + 1}`;
    setInvoices([{ id, ...newInvoice, status: 'Pending', amount: `$${newInvoice.amount}` }, ...invoices]);
    setShowInvoiceModal(false);
    setNewInvoice({ client: '', amount: '', date: '' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase mb-1">Total Invoiced</p>
          <p className="text-2xl font-bold text-gray-900">$142,500</p>
        </div>
        <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase mb-1">Outstanding</p>
          <p className="text-2xl font-bold text-blue-600">$12,400</p>
        </div>
        <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase mb-1">Overdue</p>
          <p className="text-2xl font-bold text-red-600">$3,200</p>
        </div>
        <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase mb-1">Avg. Payment Time</p>
          <p className="text-2xl font-bold text-green-600">12 Days</p>
        </div>
      </div>

      <div className="glass-panel border border-gray-200 rounded-2xl bg-white overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-gray-800">Invoices</h3>
          <button 
            onClick={() => setShowInvoiceModal(true)}
            className="px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Create Invoice
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Invoice ID</th>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invoices.map(inv => (
                <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-sm font-bold text-gray-500">{inv.id}</td>
                  <td className="px-6 py-4 font-bold text-gray-800">{inv.client}</td>
                  <td className="px-6 py-4 font-bold text-gray-900">{inv.amount}</td>
                  <td className="px-6 py-4 text-gray-500 text-sm">{inv.date}</td>
                  <td className="px-6 py-4">
                    <span className={clsx(
                      "px-2 py-1 rounded-full text-[10px] font-bold uppercase",
                      inv.status === 'Paid' ? "bg-green-100 text-green-700" :
                      inv.status === 'Pending' ? "bg-blue-100 text-blue-700" :
                      "bg-red-100 text-red-700"
                    )}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600"><ChevronRight className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {showInvoiceModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">Create New Invoice</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Client Name</label>
                  <input 
                    type="text" 
                    value={newInvoice.client}
                    onChange={(e) => setNewInvoice({ ...newInvoice, client: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-supreme-gold)]/50"
                    placeholder="e.g. Acme Corp"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Amount ($)</label>
                  <input 
                    type="number" 
                    value={newInvoice.amount}
                    onChange={(e) => setNewInvoice({ ...newInvoice, amount: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-supreme-gold)]/50"
                    placeholder="e.g. 1500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Due Date</label>
                  <input 
                    type="date" 
                    value={newInvoice.date}
                    onChange={(e) => setNewInvoice({ ...newInvoice, date: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-supreme-gold)]/50"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button 
                  onClick={() => setShowInvoiceModal(false)}
                  className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreateInvoice}
                  className="px-4 py-2 bg-[var(--color-supreme-gold)] text-white font-bold rounded-xl hover:bg-[var(--color-supreme-gold-light)] transition-all"
                >
                  Create Invoice
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function EmailMarketingSection() {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [fromEmail, setFromEmail] = useState('campaigns@supreme-luxury.com');
  const [recipients, setRecipients] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [availableMembers, setAvailableMembers] = useState<any[]>([]);

  const handleBrowseMembers = () => {
    // Generate random members each time
    const randomMembers = Array.from({ length: 20 }, (_, i) => ({
      id: Math.random().toString(36).substring(7),
      name: `Premium Member ${Math.floor(Math.random() * 1000) + 100}`,
      email: `member.${Math.floor(Math.random() * 1000)}@supreme-alliance.com`
    }));
    setAvailableMembers(randomMembers);
    setShowMembersModal(true);
  };

  const toggleRecipient = (email: string) => {
    if (recipients.includes(email)) {
      setRecipients(recipients.filter(r => r !== email));
    } else if (recipients.length < 10) {
      setRecipients([...recipients, email]);
    }
  };

  const handleGenerateEmail = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setSubject('Exclusive Invitation: Unlock Your Potential with Supreme Gold Privilege');
      setContent('Dear Distinguished Colleague,\n\nWe are delighted to extend a bespoke invitation to enhance your operational capability using Supreme\'s elite toolkit. As an esteemed professional in our ecosystem, you have priority access to refined solutions designed for high-performance enterprises.\n\nWarmest regards,\nThe Supreme Advisory Board');
      setIsGenerating(false);
    }, 1200);
  };

  const handleSendCampaign = () => {
    if (!recipients.length) {
      alert('Please select at least one recipient member from the list.');
      return;
    }
    if (!subject.trim() || !content.trim()) {
      alert('Subject heading and body message content are required.');
      return;
    }
    alert(`Success: Marketing Campaign dispatched successfully to ${recipients.length} elite partners!`);
    setSubject('');
    setContent('');
    setRecipients([]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-display font-medium text-[var(--color-supreme-text)]">Email Marketing Campaigns</h2>
        <div className="flex gap-2.5">
          <button 
            type="button"
            onClick={() => alert('Draft saved successfully to local workshop!')}
            className="px-4 py-2 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Save Draft
          </button>
          <button 
            type="button"
            onClick={handleSendCampaign}
            className="px-4 py-2 bg-[var(--color-supreme-gold)] text-white rounded-xl font-bold hover:bg-[var(--color-supreme-gold-light)] transition-all shadow-md flex items-center gap-2"
          >
            <Send className="w-4 h-4" /> Dispatch Campaign
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Sender Alias</label>
              <input 
                type="text" 
                value={fromEmail}
                onChange={(e) => setFromEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[var(--color-supreme-gold)]"
              />
              <p className="text-[11px] text-gray-400 mt-1">This address will be visible as the campaign dispatcher.</p>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">To (Maximum 10 Elite Recipients)</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={recipients.join(', ')}
                  readOnly
                  placeholder="Invite recipients from database list..." 
                  className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 focus:outline-none text-sm font-medium"
                />
                <button 
                  type="button"
                  onClick={handleBrowseMembers}
                  className="px-5 py-2.5 bg-gray-900 border border-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all text-sm"
                >
                  Browse List
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Subject Heading</label>
              <input 
                type="text" 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter campaign subject line" 
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[var(--color-supreme-gold)]"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Custom Message Body</label>
              <div className="border border-gray-250 rounded-xl overflow-hidden bg-white">
                <div className="bg-gray-50 p-2.5 border-b border-gray-200 flex gap-2">
                  <span className="p-1.5 hover:bg-gray-200 rounded text-gray-600 font-bold select-none cursor-pointer">B</span>
                  <span className="p-1.5 hover:bg-gray-200 rounded text-gray-600 italic select-none cursor-pointer text-sm">I</span>
                  <span className="p-1.5 hover:bg-gray-100 rounded text-gray-600 underline select-none cursor-pointer text-sm">U</span>
                  <div className="w-px h-6 bg-gray-300 mx-1 self-center"></div>
                  <button 
                    type="button"
                    onClick={() => alert('Attachments can be included with premium subscription tier.')}
                    className="p-1.5 hover:bg-gray-200 rounded text-gray-600 flex items-center gap-1 text-sm font-bold"
                  >
                    <Paperclip className="w-4 h-4" /> Attach File
                  </button>
                </div>
                <textarea 
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={9}
                  className="w-full p-4 focus:outline-none resize-none text-sm leading-relaxed"
                  placeholder="Design your customized campaign email draft here..."
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-[var(--color-supreme-gold)]/10 text-[var(--color-supreme-gold)] flex items-center justify-center">
                ✨
              </span>
              Intelligent Generator
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">Let Supreme\'s AI assets draft professional and high-impact letters based on your description prompt.</p>
            <textarea 
              rows={3}
              placeholder="E.g., Write an advisory follow-up offering priority luxury partnership privileges."
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[var(--color-supreme-gold)] text-xs resize-none"
            ></textarea>
            <button 
              type="button"
              onClick={handleGenerateEmail}
              disabled={isGenerating}
              className="w-full py-2.5 bg-gray-950 text-white rounded-xl font-bold hover:bg-gray-800 transition-all disabled:opacity-50 text-xs"
            >
              {isGenerating ? 'Drafting copy...' : 'Generate Copy'}
            </button>
          </div>

          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <h3 className="font-bold text-gray-900 text-sm">Layout Presets</h3>
            <div className="grid grid-cols-2 gap-3">
              <button 
                type="button"
                className="p-3.5 border-2 border-[var(--color-supreme-gold)] rounded-xl bg-gradient-to-br from-white to-[#FFF9E6] text-left transition-all"
              >
                <div className="font-bold text-xs text-gray-900">Gold Accent</div>
                <div className="text-[10px] text-gray-500 mt-1">Sovereign Alliance</div>
              </button>
              <button 
                type="button"
                onClick={() => alert('Preset applied successfully.')}
                className="p-3.5 border border-gray-200 rounded-xl bg-white text-left hover:border-gray-300 transition-all"
              >
                <div className="font-bold text-xs text-gray-900">Premium Minimal</div>
                <div className="text-[10px] text-gray-500 mt-1">Clean Typo</div>
              </button>
              <button 
                type="button"
                onClick={() => alert('Preset applied successfully.')}
                className="p-3.5 border border-gray-200 rounded-xl bg-gray-900 text-left hover:border-gray-700 transition-all"
              >
                <div className="font-bold text-xs text-white">Classic Dark</div>
                <div className="text-[10px] text-gray-400 mt-1">Sleek Obsidian</div>
              </button>
              <button 
                type="button"
                onClick={() => alert('Preset applied successfully.')}
                className="p-3.5 border border-gray-200 rounded-xl bg-blue-50 text-left hover:border-blue-200 transition-all"
              >
                <div className="font-bold text-xs text-blue-900">Corporate</div>
                <div className="text-[10px] text-blue-600/70 mt-1">Executive Glass</div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showMembersModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl max-h-[75vh] flex flex-col"
            >
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900">Select Directory Contacts</h3>
                <span className="text-xs font-bold text-[var(--color-supreme-gold)] bg-[var(--color-supreme-gold)]/10 px-2.5 py-1 rounded-full">{recipients.length}/10 Selected</span>
              </div>
              <div className="flex-1 overflow-y-auto pr-1 space-y-2 max-h-[40vh]">
                {availableMembers.map(member => (
                  <div key={member.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="font-bold text-xs text-gray-900">{member.name}</p>
                      <p className="text-[11px] text-gray-400">{member.email}</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => toggleRecipient(member.email)}
                      disabled={!recipients.includes(member.email) && recipients.length >= 10}
                      className={clsx(
                        "px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-bold transition-all",
                        recipients.includes(member.email) && "bg-[var(--color-supreme-gold)] text-white hover:bg-[var(--color-supreme-gold-light)]"
                      )}
                    >
                      {recipients.includes(member.email) ? 'Selected' : 'Select'}
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-end">
                <button 
                  type="button"
                  onClick={() => setShowMembersModal(false)}
                  className="px-6 py-2.5 bg-gray-950 text-white rounded-xl font-bold hover:bg-gray-800 transition-all text-xs shadow-md"
                >
                  Confirm Selection
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function CloudManagementSection({ files, setFiles, onNewDoc }: { files: CloudFile[], setFiles: React.Dispatch<React.SetStateAction<CloudFile[]>>, onNewDoc: (name: string, type: 'word' | 'excel' | 'publisher') => void }) {
  const [showNewDocModal, setShowNewDocModal] = useState(false);
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState<'word' | 'excel' | 'publisher'>('word');
  const [activeFile, setActiveFile] = useState<CloudFile | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const handleCreateDocument = () => {
    if (!docName) return;
    
    // Create a temporary file object to open immediately
    const newFile: CloudFile = {
      id: Math.random().toString(36).substring(7),
      name: docName,
      type: docType === 'word' ? 'Word' : docType === 'excel' ? 'Excel' : 'Publisher',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      size: '0 KB',
      icon: docType === 'word' ? FileText : docType === 'excel' ? FileSpreadsheet : FileIcon,
      color: docType === 'word' ? 'text-blue-600' : docType === 'excel' ? 'text-green-600' : 'text-purple-600',
      content: docType === 'word' ? '' : docType === 'excel' ? [['', '', '', '', ''], ['', '', '', '', ''], ['', '', '', '', ''], ['', '', '', '', ''], ['', '', '', '', '']] : []
    };
    
    // Update parent state
    setFiles(prev => [newFile, ...prev]);
    
    // Close modal and open editor
    setShowNewDocModal(false);
    setDocName('');
    setActiveFile(newFile);
    setIsEditorOpen(true);
  };

  const openEditor = (file: CloudFile) => {
    setActiveFile(file);
    setIsEditorOpen(true);
  };

  const saveFileContent = (id: string, newContent: any) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, content: newContent } : f));
    if (activeFile?.id === id) {
      setActiveFile(prev => prev ? { ...prev, content: newContent } : null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-display font-bold text-[var(--color-supreme-text)]">Cloud Management</h2>
        <button 
          onClick={() => setShowNewDocModal(true)}
          className="px-4 py-2 bg-[var(--color-supreme-gold)] text-white rounded-xl font-bold hover:bg-[var(--color-supreme-gold-light)] transition-all shadow-md flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> New Document
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase mb-1">Storage Used</p>
          <div className="flex items-end gap-2">
            <p className="text-2xl font-bold text-gray-900">12.4 GB</p>
            <p className="text-sm text-gray-400 mb-1">/ 50 GB</p>
          </div>
          <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-[var(--color-supreme-gold)] w-[25%]" />
          </div>
        </div>
        <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase mb-1">Total Files</p>
          <p className="text-2xl font-bold text-blue-600">{files.length + 25}</p>
          <p className="text-xs text-gray-400 mt-1">Across all categories</p>
        </div>
        <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase mb-1">Shared Docs</p>
          <p className="text-2xl font-bold text-purple-600">8</p>
          <p className="text-xs text-gray-400 mt-1">Active collaborations</p>
        </div>
        <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase mb-1">Cloud Sync</p>
          <div className="flex items-center gap-2 text-green-600">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <p className="text-sm font-bold">Active</p>
          </div>
          <p className="text-xs text-gray-400 mt-1">Last sync: Just now</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          onClick={() => {
            setDocType('word');
            setShowNewDocModal(true);
          }}
          className="glass-panel p-6 rounded-2xl hover:shadow-lg transition-all cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-gray-900 mb-2">Word Editor</h3>
          <p className="text-sm text-gray-500 mb-4">Create and edit rich text documents with advanced formatting tools.</p>
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
              {files.filter(f => f.type === 'Word').length} Files
            </span>
            <button className="text-gray-400 group-hover:text-[var(--color-supreme-gold)]"><ChevronRight className="w-5 h-5" /></button>
          </div>
        </div>

        <div 
          onClick={() => {
            setDocType('excel');
            setShowNewDocModal(true);
          }}
          className="glass-panel p-6 rounded-2xl hover:shadow-lg transition-all cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-gray-900 mb-2">Excel Editor</h3>
          <p className="text-sm text-gray-500 mb-4">Manage spreadsheets, analyze data, and create charts seamlessly.</p>
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md">
              {files.filter(f => f.type === 'Excel').length} Files
            </span>
            <button className="text-gray-400 group-hover:text-[var(--color-supreme-gold)]"><ChevronRight className="w-5 h-5" /></button>
          </div>
        </div>

        <div 
          onClick={() => {
            setDocType('publisher');
            setShowNewDocModal(true);
          }}
          className="glass-panel p-6 rounded-2xl hover:shadow-lg transition-all cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <FileIcon className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-gray-900 mb-2">Publisher</h3>
          <p className="text-sm text-gray-500 mb-4">Design professional layouts, newsletters, and marketing materials.</p>
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-md">
              {files.filter(f => f.type === 'Publisher').length} Files
            </span>
            <button className="text-gray-400 group-hover:text-[var(--color-supreme-gold)]"><ChevronRight className="w-5 h-5" /></button>
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden mt-8">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-lg text-gray-900">Recent Files</h3>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search files..." 
                className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-supreme-gold)]/50"
              />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-xs uppercase tracking-wider text-gray-500 font-bold">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Last Modified</th>
                <th className="px-6 py-4">Size</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {files.map((file, i) => (
                <tr 
                  key={file.id} 
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => openEditor(file)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <file.icon className={`w-5 h-5 ${file.color}`} />
                      <span className="font-bold text-gray-900">{file.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm">{file.type}</td>
                  <td className="px-6 py-4 text-gray-500 text-sm">{file.date}</td>
                  <td className="px-6 py-4 text-gray-500 text-sm">{file.size}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); /* Download logic */ }}
                        className="p-2 hover:bg-gray-200 rounded-lg text-gray-500 transition-colors" 
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); /* More actions */ }}
                        className="p-2 hover:bg-gray-200 rounded-lg text-gray-500 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isEditorOpen && activeFile && (
          <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-md flex items-center justify-center p-0 md:p-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full h-full max-w-6xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Editor Header */}
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className={clsx("p-2 rounded-lg", activeFile.color.replace('text-', 'bg-').replace('600', '100'))}>
                    <activeFile.icon className={clsx("w-5 h-5", activeFile.color)} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 leading-none">{activeFile.name}</h3>
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mt-1">{activeFile.type} Editor</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setIsEditorOpen(false)}
                    className="px-4 py-2 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-all flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" /> Save & Close
                  </button>
                  <button 
                    onClick={() => setIsEditorOpen(false)}
                    className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Editor Content */}
              <div className="flex-1 overflow-auto bg-gray-100 p-4 md:p-8">
                <div className="max-w-4xl mx-auto bg-white shadow-lg min-h-full rounded-sm overflow-hidden">
                  {activeFile.type === 'Word' && (
                    <WordEditor 
                      content={activeFile.content} 
                      onChange={(val) => saveFileContent(activeFile.id, val)} 
                      onSave={() => setIsEditorOpen(false)}
                      onExit={() => setIsEditorOpen(false)}
                    />
                  )}
                  {activeFile.type === 'Excel' && (
                    <ExcelEditor 
                      data={activeFile.content} 
                      onChange={(val) => saveFileContent(activeFile.id, val)} 
                      onSave={() => setIsEditorOpen(false)}
                      onExit={() => setIsEditorOpen(false)}
                    />
                  )}
                  {activeFile.type === 'Publisher' && (
                    <PublisherEditor 
                      elements={activeFile.content} 
                      onChange={(val) => saveFileContent(activeFile.id, val)} 
                      onSave={() => setIsEditorOpen(false)}
                      onExit={() => setIsEditorOpen(false)}
                    />
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showNewDocModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                  <Plus className="w-5 h-5" /> Create New Document
                </h2>
                <button onClick={() => setShowNewDocModal(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Document Type</label>
                  <div className="grid grid-cols-3 gap-2 p-1 bg-gray-100 rounded-xl">
                    <button 
                      onClick={() => setDocType('word')}
                      className={clsx("py-2 text-xs font-bold rounded-lg transition-colors", docType === 'word' ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700")}
                    >
                      Word
                    </button>
                    <button 
                      onClick={() => setDocType('excel')}
                      className={clsx("py-2 text-xs font-bold rounded-lg transition-colors", docType === 'excel' ? "bg-white text-green-600 shadow-sm" : "text-gray-500 hover:text-gray-700")}
                    >
                      Excel
                    </button>
                    <button 
                      onClick={() => setDocType('publisher')}
                      className={clsx("py-2 text-xs font-bold rounded-lg transition-colors", docType === 'publisher' ? "bg-white text-purple-600 shadow-sm" : "text-gray-500 hover:text-gray-700")}
                    >
                      Publisher
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Document Name</label>
                  <input 
                    type="text" 
                    value={docName}
                    onChange={(e) => setDocName(e.target.value)}
                    placeholder="e.g. Project Proposal" 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-supreme-gold)] outline-none" 
                  />
                </div>
              </div>
              <div className="p-6 border-t border-gray-100 flex justify-end gap-4 bg-gray-50">
                <button onClick={() => setShowNewDocModal(false)} className="px-6 py-3 font-bold text-gray-600 hover:bg-gray-200 rounded-xl transition-colors">Cancel</button>
                <button 
                  onClick={handleCreateDocument}
                  disabled={!docName}
                  className="px-6 py-3 font-bold text-white bg-[var(--color-supreme-gold)] hover:bg-[var(--color-supreme-gold-light)] rounded-xl transition-colors disabled:opacity-50"
                >
                  Create Document
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function WordEditor({ content, onChange, onSave, onExit }: { content: string, onChange: (val: string) => void, onSave: () => void, onExit: () => void }) {
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Document</title>
            <style>
              body { font-family: sans-serif; padding: 40px; }
              img { max-width: 100%; }
            </style>
          </head>
          <body>
            ${content}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-2 border-b border-gray-100 bg-gray-50 flex gap-2 justify-between items-center">
        <div className="flex gap-2">
          <button 
            onClick={handlePrint}
            className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold hover:bg-gray-50 flex items-center gap-1"
          >
            <Download className="w-3 h-3" /> Print / PDF
          </button>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={onSave}
            className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 flex items-center gap-1"
          >
            <Save className="w-3 h-3" /> Save
          </button>
          <button 
            onClick={onExit}
            className="px-4 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-bold hover:bg-gray-800 flex items-center gap-1"
          >
            <X className="w-3 h-3" /> Exit
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto flex flex-col p-2">
        <WysiwygEditor 
          value={content} 
          onChange={onChange}
          placeholder="Start writing your document..."
        />
      </div>
    </div>
  );
}

function ExcelEditor({ data, onChange, onSave, onExit }: { data: string[][], onChange: (val: string[][]) => void, onSave: () => void, onExit: () => void }) {
  const [activeCell, setActiveCell] = useState<{r: number, c: number} | null>(null);
  const [formulaValue, setFormulaValue] = useState('');
  const [fontFamily, setFontFamily] = useState('sans-serif');
  const [fontSize, setFontSize] = useState('14px');

  const evaluateFormula = (val: string, depth = 0): string => {
    if (depth > 10) return '#REF!';
    if (val.startsWith('=')) {
      const formula = val.substring(1).toUpperCase();
      
      // Helper to get range values
      const getRangeValues = (range: string) => {
        const [start, end] = range.split(':');
        if (!start || !end) return [];
        const startCol = start.charCodeAt(0) - 65;
        const startRow = parseInt(start.substring(1)) - 1;
        const endCol = end.charCodeAt(0) - 65;
        const endRow = parseInt(end.substring(1)) - 1;
        
        const values: number[] = [];
        for (let r = Math.min(startRow, endRow); r <= Math.max(startRow, endRow); r++) {
          for (let c = Math.min(startCol, endCol); c <= Math.max(startCol, endCol); c++) {
            const rawVal = data[r]?.[c] || '';
            const cellVal = parseFloat(rawVal.startsWith('=') ? evaluateFormula(rawVal, depth + 1) : rawVal) || 0;
            values.push(cellVal);
          }
        }
        return values;
      };

      if (formula.startsWith('SUM(') && formula.endsWith(')')) {
        const vals = getRangeValues(formula.substring(4, formula.length - 1));
        return vals.reduce((a, b) => a + b, 0).toString();
      }
      if (formula.startsWith('AVERAGE(') && formula.endsWith(')')) {
        const vals = getRangeValues(formula.substring(8, formula.length - 1));
        return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2) : '0';
      }
      if (formula.startsWith('MAX(') && formula.endsWith(')')) {
        const vals = getRangeValues(formula.substring(4, formula.length - 1));
        return vals.length ? Math.max(...vals).toString() : '0';
      }
      if (formula.startsWith('MIN(') && formula.endsWith(')')) {
        const vals = getRangeValues(formula.substring(4, formula.length - 1));
        return vals.length ? Math.min(...vals).toString() : '0';
      }

      // Simple arithmetic fallback
      try {
        // Replace cell references like A1, B2 with their values
        const withValues = formula.replace(/[A-Z][0-9]+/g, (match) => {
          const col = match.charCodeAt(0) - 65;
          const row = parseInt(match.substring(1)) - 1;
          const rawVal = data[row]?.[col] || '0';
          return rawVal.startsWith('=') ? evaluateFormula(rawVal, depth + 1) : rawVal;
        });
        const sanitized = withValues.replace(/[^-+*/().0-9]/g, '');
        return eval(sanitized).toString();
      } catch (e) {
        return '#ERROR!';
      }
    }
    return val;
  };

  const updateCell = (r: number, c: number, val: string) => {
    const newData = [...data];
    newData[r] = [...newData[r]];
    newData[r][c] = val;
    onChange(newData);
  };

  const handleFormulaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeCell) {
      updateCell(activeCell.r, activeCell.c, formulaValue);
    }
  };

  const addRow = () => onChange([...data, Array(data[0]?.length || 1).fill('')]);
  const addCol = () => onChange(data.length > 0 ? data.map(row => [...row, '']) : [['']]);
  const deleteRow = () => {
    if (activeCell && data.length > 1) {
      const newData = data.filter((_, i) => i !== activeCell.r);
      onChange(newData);
      setActiveCell(null);
    }
  };
  const deleteCol = () => {
    if (activeCell && data[0]?.length > 1) {
      const newData = data.map(row => row.filter((_, i) => i !== activeCell.c));
      onChange(newData);
      setActiveCell(null);
    }
  };

  const handleCellSelect = (r: number, c: number) => {
    setActiveCell({ r, c });
    setFormulaValue(data[r][c]);
  };

  const fonts = [
    'Arial', 'Comic Sans MS', 'Courier New', 'Georgia', 'Helvetica', 'Lucida Sans Unicode', 'Tahoma', 'Times New Roman', 'Trebuchet MS', 'Verdana', 
    'Impact', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Oswald', 'Raleway', 'Merriweather', 'Nunito', 'Playfair Display', 
    'Ubuntu', 'Poppins', 'Rubik', 'Work Sans', 'Fira Sans'
  ];
  const sizes = ['8px', '10px', '12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '36px', '48px', '64px', '72px'];

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white">
      <div className="p-2 border-b border-gray-100 bg-gray-50 flex gap-2 justify-between items-center flex-wrap">
        <div className="flex gap-2 items-center flex-wrap">
          <select 
            value={fontFamily} 
            onChange={(e) => setFontFamily(e.target.value)}
            className="px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-xs outline-none"
          >
            {fonts.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          <select 
            value={fontSize} 
            onChange={(e) => setFontSize(e.target.value)}
            className="px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-xs outline-none"
          >
            {sizes.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={onSave}
            className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 flex items-center gap-1"
          >
            <Save className="w-3 h-3" /> Save
          </button>
          <button 
            onClick={onExit}
            className="px-4 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-bold hover:bg-gray-800 flex items-center gap-1"
          >
            <X className="w-3 h-3" /> Exit
          </button>
        </div>
      </div>
      <div className="p-2 border-b border-gray-100 bg-gray-50 flex gap-2 items-center flex-wrap">
        <div className="px-3 py-1 bg-white border border-gray-300 rounded text-xs font-mono min-w-[60px] text-center">
          {activeCell ? `${String.fromCharCode(65 + activeCell.c)}${activeCell.r + 1}` : '--'}
        </div>
        <div className="flex-1 min-w-[200px] flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-1">
          <span className="text-xs font-bold text-gray-400 italic">fx</span>
          <form onSubmit={handleFormulaSubmit} className="flex-1">
            <input 
              type="text" 
              value={formulaValue}
              onChange={(e) => setFormulaValue(e.target.value)}
              placeholder="Enter value or formula (e.g. =SUM(A1:B5))"
              className="w-full text-sm outline-none bg-transparent"
            />
          </form>
        </div>
        <div className="flex gap-1">
          <button onClick={addRow} className="p-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold hover:bg-gray-50 flex items-center gap-1" title="Add Row">
            <Plus className="w-3 h-3" /> Row
          </button>
          <button onClick={addCol} className="p-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold hover:bg-gray-50 flex items-center gap-1" title="Add Column">
            <Plus className="w-3 h-3" /> Col
          </button>
          <button 
            onClick={deleteRow} 
            disabled={!activeCell}
            className="p-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold hover:bg-red-50 text-red-600 disabled:opacity-50" 
            title="Delete Row"
          >
            <Trash2 className="w-3 h-3" />
          </button>
          <button 
            onClick={deleteCol} 
            disabled={!activeCell}
            className="p-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold hover:bg-red-50 text-red-600 disabled:opacity-50" 
            title="Delete Column"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse table-fixed min-w-full" style={{ fontFamily, fontSize }}>
          <thead>
            <tr>
              <th className="w-12 bg-gray-50 border border-gray-200" />
              {data[0]?.map((_, i) => (
                <th key={i} className="bg-gray-50 border border-gray-200 px-4 py-2 text-xs font-bold text-gray-400 uppercase w-32">
                  {String.fromCharCode(65 + i)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, r) => (
              <tr key={r}>
                <td className="bg-gray-50 border border-gray-200 text-center text-xs font-bold text-gray-400">{r + 1}</td>
                {row.map((cell, c) => (
                  <td 
                    key={c} 
                    className={clsx(
                      "border border-gray-200 p-0 transition-all relative",
                      activeCell?.r === r && activeCell?.c === c ? "ring-2 ring-[var(--color-supreme-gold)] ring-inset z-10 bg-[var(--color-supreme-gold)]/5" : "hover:bg-gray-50"
                    )}
                    onClick={() => handleCellSelect(r, c)}
                  >
                    {activeCell?.r === r && activeCell?.c === c ? (
                      <input
                        autoFocus
                        type="text"
                        value={formulaValue}
                        onChange={(e) => {
                          setFormulaValue(e.target.value);
                          updateCell(r, c, e.target.value);
                        }}
                        className="w-full h-full px-3 py-2 text-sm min-h-[36px] outline-none bg-transparent"
                        style={{ fontSize: 'inherit' }}
                      />
                    ) : (
                      <div className="w-full px-3 py-2 text-sm min-h-[36px] overflow-hidden whitespace-nowrap text-ellipsis" style={{ fontSize: 'inherit' }}>
                        {cell.startsWith('=') ? evaluateFormula(cell) : cell}
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-2 bg-gray-50 border-t border-gray-100 flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4">
        <span>Ready</span>
        <span>Sum: {data.flat().reduce((acc, val) => acc + (parseFloat(val) || 0), 0)}</span>
      </div>
    </div>
  );
}

function PublisherEditor({ elements, onChange, onSave, onExit }: { elements: any[], onChange: (val: any[]) => void, onSave: () => void, onExit: () => void }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [canvasBg, setCanvasBg] = useState('#ffffff');
  const canvasRef = useRef<HTMLDivElement>(null);
  const elementsRef = useRef(elements);

  React.useEffect(() => {
    elementsRef.current = elements;
  }, [elements]);

  const addText = () => {
    const newEl = { id: Math.random().toString(36).substring(7), type: 'text', x: 100, y: 100, text: 'New Text Block', fontSize: '24px', color: '#000000', width: 200, height: 50, zIndex: elementsRef.current.length + 1 };
    onChange([...elementsRef.current, newEl]);
    setSelectedId(newEl.id);
  };

  const addImage = () => {
    const newEl = { id: Math.random().toString(36).substring(7), type: 'image', x: 150, y: 150, src: 'https://picsum.photos/seed/pub/400/300', width: 200, height: 150, zIndex: elementsRef.current.length + 1 };
    onChange([...elementsRef.current, newEl]);
    setSelectedId(newEl.id);
  };

  const updateElement = (id: string, updates: any) => {
    onChange(elementsRef.current.map(el => el.id === id ? { ...el, ...updates } : el));
  };

  const bringToFront = () => {
    if (!selectedId) return;
    const maxZ = Math.max(0, ...elementsRef.current.map(el => el.zIndex || 0));
    updateElement(selectedId, { zIndex: maxZ + 1 });
  };

  const sendToBack = () => {
    if (!selectedId) return;
    const minZ = Math.min(0, ...elementsRef.current.map(el => el.zIndex || 0));
    updateElement(selectedId, { zIndex: minZ - 1 });
  };

  const duplicateElement = () => {
    if (!selectedId) return;
    const el = elementsRef.current.find(e => e.id === selectedId);
    if (el) {
      const newEl = { ...el, id: Math.random().toString(36).substring(7), x: el.x + 20, y: el.y + 20, zIndex: elementsRef.current.length + 1 };
      onChange([...elementsRef.current, newEl]);
      setSelectedId(newEl.id);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const elementsHtml = elementsRef.current.map(el => {
        if (el.type === 'text') {
          return `<div style="position: absolute; left: ${el.x}px; top: ${el.y}px; width: ${el.width}px; height: ${el.height}px; font-size: ${el.fontSize}; color: ${el.color}; z-index: ${el.zIndex || 0}; font-family: ${el.fontFamily || 'sans-serif'}; font-weight: bold; white-space: pre-wrap; padding: 8px;">${el.text}</div>`;
        } else {
          return `<img src="${el.src}" style="position: absolute; left: ${el.x}px; top: ${el.y}px; width: ${el.width}px; height: ${el.height}px; z-index: ${el.zIndex || 0}; object-fit: cover;" />`;
        }
      }).join('');

      printWindow.document.write(`
        <html>
          <head>
            <title>Print Publication</title>
            <style>
              body { margin: 0; padding: 0; }
              .canvas { width: 595px; height: 842px; background: ${canvasBg}; position: relative; overflow: hidden; }
            </style>
          </head>
          <body>
            <div class="canvas">
              ${elementsHtml}
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  const handleDrag = (e: React.MouseEvent, id: string) => {
    if (!canvasRef.current) return;
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const element = elementsRef.current.find(el => el.id === id);
    if (!element) return;

    const offsetX = e.clientX - canvasRect.left - element.x;
    const offsetY = e.clientY - canvasRect.top - element.y;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const x = moveEvent.clientX - canvasRect.left - offsetX;
      const y = moveEvent.clientY - canvasRect.top - offsetY;
      updateElement(id, { x, y });
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleResize = (e: React.MouseEvent, id: string, direction: string) => {
    e.stopPropagation();
    const element = elementsRef.current.find(el => el.id === id);
    if (!element) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = element.width || 100;
    const startHeight = element.height || 50;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      
      let newWidth = startWidth;
      let newHeight = startHeight;

      if (direction.includes('right')) newWidth = Math.max(20, startWidth + deltaX);
      if (direction.includes('bottom')) newHeight = Math.max(20, startHeight + deltaY);
      
      updateElement(id, { width: newWidth, height: newHeight });
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const selectedElement = elements.find(el => el.id === selectedId);

  const fonts = [
    'Arial', 'Comic Sans MS', 'Courier New', 'Georgia', 'Helvetica', 'Lucida Sans Unicode', 'Tahoma', 'Times New Roman', 'Trebuchet MS', 'Verdana', 
    'Impact', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Oswald', 'Raleway', 'Merriweather', 'Nunito', 'Playfair Display', 
    'Ubuntu', 'Poppins', 'Rubik', 'Work Sans', 'Fira Sans'
  ];
  const sizes = ['8px', '10px', '12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '36px', '48px', '64px', '72px'];

  return (
    <div className="flex h-full bg-gray-100">
      {/* Sidebar Tools */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col overflow-y-auto">
        <div className="p-4 border-b border-gray-100 flex gap-2">
          <button 
            onClick={onSave}
            className="flex-1 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 flex items-center justify-center gap-1"
          >
            <Save className="w-3 h-3" /> Save
          </button>
          <button 
            onClick={onExit}
            className="flex-1 py-2 bg-gray-900 text-white rounded-lg text-xs font-bold hover:bg-gray-800 flex items-center justify-center gap-1"
          >
            <X className="w-3 h-3" /> Exit
          </button>
        </div>
        <div className="p-4 border-b border-gray-100">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Canvas</h4>
          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-bold text-gray-500">Background</label>
              <input 
                type="color" 
                value={canvasBg}
                onChange={(e) => setCanvasBg(e.target.value)}
                className="w-full mt-1 h-8 rounded-lg cursor-pointer"
              />
            </div>
            <button onClick={handlePrint} className="w-full py-2 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-2">
              <Download className="w-3 h-3" /> Print / PDF
            </button>
          </div>
        </div>

        <div className="p-4 border-b border-gray-100">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Insert</h4>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={addText} className="p-3 border border-gray-100 rounded-xl hover:bg-gray-50 flex flex-col items-center gap-2 transition-all">
              <Type className="w-5 h-5 text-gray-600" />
              <span className="text-[10px] font-bold">Text</span>
            </button>
            <button onClick={addImage} className="p-3 border border-gray-100 rounded-xl hover:bg-gray-50 flex flex-col items-center gap-2 transition-all">
              <ImageIcon className="w-5 h-5 text-gray-600" />
              <span className="text-[10px] font-bold">Image</span>
            </button>
          </div>
        </div>

        {selectedId && selectedElement && (
          <div className="p-4 space-y-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Properties</h4>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={bringToFront} className="p-2 border border-gray-100 rounded-lg hover:bg-gray-50 text-[10px] font-bold flex items-center justify-center gap-1">
                <Layers className="w-3 h-3" /> Front
              </button>
              <button onClick={sendToBack} className="p-2 border border-gray-100 rounded-lg hover:bg-gray-50 text-[10px] font-bold flex items-center justify-center gap-1">
                <Layers className="w-3 h-3" /> Back
              </button>
              <button onClick={duplicateElement} className="col-span-2 p-2 border border-gray-100 rounded-lg hover:bg-gray-50 text-[10px] font-bold flex items-center justify-center gap-1">
                <Copy className="w-3 h-3" /> Duplicate
              </button>
            </div>
            {selectedElement.type === 'text' ? (
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-500">Content</label>
                  <textarea 
                    value={selectedElement.text}
                    onChange={(e) => updateElement(selectedId, { text: e.target.value })}
                    className="w-full mt-1 p-2 border border-gray-200 rounded-lg text-sm outline-none"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500">Font Family</label>
                  <select 
                    value={selectedElement.fontFamily || 'sans-serif'}
                    onChange={(e) => updateElement(selectedId, { fontFamily: e.target.value })}
                    className="w-full mt-1 p-2 border border-gray-200 rounded-lg text-sm outline-none"
                  >
                    {fonts.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500">Font Size</label>
                  <select 
                    value={selectedElement.fontSize}
                    onChange={(e) => updateElement(selectedId, { fontSize: e.target.value })}
                    className="w-full mt-1 p-2 border border-gray-200 rounded-lg text-sm outline-none"
                  >
                    {sizes.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500">Color</label>
                  <input 
                    type="color" 
                    value={selectedElement.color}
                    onChange={(e) => updateElement(selectedId, { color: e.target.value })}
                    className="w-full mt-1 h-8 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-500">Image URL</label>
                  <input 
                    type="text" 
                    value={selectedElement.src}
                    onChange={(e) => updateElement(selectedId, { src: e.target.value })}
                    className="w-full mt-1 p-2 border border-gray-200 rounded-lg text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500">Width</label>
                  <input 
                    type="range" 
                    min="50" 
                    max="500"
                    value={selectedElement.width}
                    onChange={(e) => updateElement(selectedId, { width: parseInt(e.target.value) })}
                    className="w-full mt-1"
                  />
                </div>
              </div>
            )}
            <button 
              onClick={() => {
                onChange(elements.filter(e => e.id !== selectedId));
                setSelectedId(null);
              }}
              className="w-full py-2 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition-all flex items-center justify-center gap-2"
            >
              <Trash2 className="w-3 h-3" /> Delete Element
            </button>
          </div>
        )}

        <div className="mt-auto p-4 border-t border-gray-100">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Layers</h4>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {elements.slice().reverse().map(el => (
              <button
                key={el.id}
                onClick={() => setSelectedId(el.id)}
                className={clsx(
                  "w-full flex items-center gap-2 p-2 rounded-lg text-xs transition-all",
                  selectedId === el.id ? "bg-[var(--color-supreme-gold)]/10 text-[var(--color-supreme-gold)] font-bold" : "text-gray-500 hover:bg-gray-50"
                )}
              >
                {el.type === 'text' ? <Type className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                <span className="truncate">{el.type === 'text' ? el.text : 'Image'}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 relative overflow-auto p-12 flex justify-center items-start">
        <div 
          ref={canvasRef}
          className="w-[595px] h-[842px] shadow-2xl relative overflow-hidden border border-gray-200 shrink-0"
          style={{ backgroundColor: canvasBg }}
          onClick={() => setSelectedId(null)}
        >
          {elements.sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0)).map((el) => (
            <div
              key={el.id}
              className={clsx(
                "absolute cursor-move group",
                selectedId === el.id ? "ring-2 ring-[var(--color-supreme-gold)]" : ""
              )}
              style={{ left: el.x, top: el.y, width: el.width, height: el.height, zIndex: el.zIndex || 0 }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedId(el.id);
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                setSelectedId(el.id);
                handleDrag(e, el.id);
              }}
            >
              {selectedId === el.id && (
                <div 
                  className="absolute bottom-0 right-0 w-3 h-3 bg-[var(--color-supreme-gold)] cursor-nwse-resize z-20"
                  onMouseDown={(e) => handleResize(e, el.id, 'bottom-right')}
                />
              )}
              {el.type === 'text' ? (
                <div 
                  className="bg-transparent font-bold outline-none p-2 min-w-[100px] h-full whitespace-pre-wrap"
                  style={{ fontSize: el.fontSize, color: el.color, fontFamily: el.fontFamily || 'sans-serif' }}
                >
                  {el.text}
                </div>
              ) : (
                <img 
                  src={el.src} 
                  className="rounded shadow-sm pointer-events-none w-full h-full object-cover" 
                  referrerPolicy="no-referrer" 
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
