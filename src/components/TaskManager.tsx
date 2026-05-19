import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Reorder, useDragControls } from 'motion/react';
import { 
  CheckCircle2, 
  Circle, 
  Trash2, 
  Plus, 
  Calendar, 
  Flag, 
  Filter, 
  ArrowUpDown, 
  Edit2, 
  X, 
  Save,
  AlertTriangle,
  GripVertical
} from 'lucide-react';
import { clsx } from 'clsx';

interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  createdAt: number;
  reward?: number;
  rewardClaimed?: boolean;
}

type FilterType = 'all' | 'active' | 'completed';
type SortType = 'date' | 'priority' | 'manual';

import { useWallet } from '../context/WalletContext';

function TaskItem({ 
  task, 
  sort, 
  filter, 
  toggleComplete, 
  handleKeyDown, 
  handleEdit, 
  setDeleteId 
}: { 
  task: Task; 
  sort: SortType; 
  filter: FilterType; 
  toggleComplete: (id: string) => void; 
  handleKeyDown: (e: React.KeyboardEvent, id: string) => void; 
  handleEdit: (task: Task) => void; 
  setDeleteId: (id: string) => void; 
}) {
  const dragControls = useDragControls();
  const isDraggable = sort === 'manual' && filter === 'all';

  const getDueDateStatus = (dueDate?: string) => {
    if (!dueDate) return null;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'overdue';
    if (diffDays === 0) return 'today';
    if (diffDays <= 2) return 'soon';
    return 'future';
  };

  const status = getDueDateStatus(task.dueDate);

  return (
    <Reorder.Item
      value={task}
      dragListener={false}
      dragControls={dragControls}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ 
        opacity: task.completed ? 0.7 : 1, 
        y: 0,
        scale: task.completed ? 0.98 : 1,
        backgroundColor: task.completed ? "#F9FAFB" : 
                         status === 'overdue' ? "#FFF5F5" : 
                         status === 'today' ? "#FFFBEB" : "#FFFFFF"
      }}
      whileDrag={{ 
        scale: 1.02, 
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        zIndex: 50
      }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={clsx(
        "group flex items-start gap-3 p-4 rounded-xl border transition-shadow",
        task.completed ? "border-gray-100" : 
        status === 'overdue' ? "border-red-200 shadow-sm" :
        status === 'today' ? "border-amber-200 shadow-sm" :
        "border-gray-200 hover:border-[var(--color-supreme-gold)]/30",
        !task.completed && !isDraggable && "hover:shadow-md"
      )}
      role="listitem"
    >
      <div className="flex items-center gap-2 shrink-0">
        {isDraggable && (
          <div 
            className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 transition-colors p-1 -ml-1 rounded hover:bg-gray-100"
            onPointerDown={(e) => dragControls.start(e)}
            style={{ touchAction: 'none' }}
          >
            <GripVertical className="w-4 h-4" />
          </div>
        )}
        <button 
          onClick={() => toggleComplete(task.id)}
          onKeyDown={(e) => handleKeyDown(e, task.id)}
          className={clsx(
            "mt-0.5 shrink-0 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-supreme-gold)] rounded-full",
            task.completed ? "text-green-500" : "text-gray-300 hover:text-[var(--color-supreme-gold)]"
          )}
          aria-label={task.completed ? "Mark as incomplete" : "Mark as complete"}
          aria-pressed={task.completed}
        >
          {task.completed ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
        </button>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className={clsx("font-medium truncate pr-2", task.completed && "text-gray-400 line-through")}>
            {task.title}
          </h3>
          <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
            <button 
              onClick={() => handleEdit(task)} 
              className="text-gray-400 hover:text-blue-500 focus:outline-none focus:text-blue-500"
              aria-label={`Edit task: ${task.title}`}
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setDeleteId(task.id)} 
              className="text-gray-400 hover:text-red-500 focus:outline-none focus:text-red-500"
              aria-label={`Delete task: ${task.title}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {task.description && (
          <p className={clsx("text-sm mt-1 line-clamp-2", task.completed ? "text-gray-300" : "text-gray-500")}>
            {task.description}
          </p>
        )}

        <div className="flex items-center gap-3 mt-3">
          <span className={clsx(
            "text-xs px-2 py-0.5 rounded-full font-medium border",
            task.priority === 'high' ? "bg-red-50 text-red-600 border-red-100" :
            task.priority === 'medium' ? "bg-yellow-50 text-yellow-600 border-yellow-100" :
            "bg-blue-50 text-blue-600 border-blue-100"
          )}>
            {task.priority}
          </span>
          {task.reward && task.reward > 0 && (
            <span className={clsx(
              "text-xs px-2 py-0.5 rounded-full font-bold border",
              task.rewardClaimed ? "bg-green-50 text-green-600 border-green-100" : "bg-amber-50 text-amber-600 border-amber-100"
            )}>
              ${task.reward.toFixed(2)} {task.rewardClaimed ? 'Earned' : 'Reward'}
            </span>
          )}
          {task.dueDate && (
            <span className={clsx(
              "flex items-center gap-1 text-xs font-medium",
              task.completed ? "text-gray-300" :
              status === 'overdue' ? "text-red-600" :
              status === 'today' ? "text-amber-600" :
              status === 'soon' ? "text-blue-600" :
              "text-gray-400"
            )}>
              <Calendar className="w-3 h-3" />
              {task.dueDate}
              {!task.completed && status === 'overdue' && " (Overdue)"}
              {!task.completed && status === 'today' && " (Due Today)"}
            </span>
          )}
        </div>
      </div>
    </Reorder.Item>
  );
}

export default function TaskManager() {
  const { receivePayment } = useWallet();
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem('supreme-tasks');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load tasks:', e);
    }
    return [
      { id: '1', title: 'Review quarterly goals', description: 'Check progress on Q3 OKRs', completed: false, priority: 'high', dueDate: '2024-10-15', createdAt: Date.now(), reward: 25 },
      { id: '2', title: 'Update client presentation', completed: true, priority: 'medium', createdAt: Date.now() - 100000, reward: 15, rewardClaimed: true },
      { id: '3', title: 'Team sync', description: 'Weekly standup meeting', completed: false, priority: 'low', dueDate: '2024-10-12', createdAt: Date.now() - 200000, reward: 10 },
    ];
  });

  useEffect(() => {
    localStorage.setItem('supreme-tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Request notification permission and check for reminders
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const checkReminders = () => {
      if (!("Notification" in window) || Notification.permission !== "granted") return;

      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      
      tasks.forEach(task => {
        if (task.completed || !task.dueDate) return;
        
        // Only notify for tasks due today that haven't been notified in this session
        if (task.dueDate === todayStr) {
          const notifiedKey = `notified-${task.id}-${todayStr}`;
          if (!sessionStorage.getItem(notifiedKey)) {
            new Notification("Task Reminder", {
              body: `Task "${task.title}" is due today!`,
              icon: "/favicon.ico"
            });
            sessionStorage.setItem(notifiedKey, 'true');
          }
        }
      });
    };

    // Check immediately and then every hour
    checkReminders();
    const interval = setInterval(checkReminders, 3600000);
    return () => clearInterval(interval);
  }, [tasks]);

  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('manual');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [reward, setReward] = useState<string>('0');

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority('medium');
    setDueDate('');
    setReward('0');
    setIsAdding(false);
    setEditingId(null);
  };

  const handleAdd = () => {
    if (!title.trim()) return;
    const newTask: Task = {
      id: Date.now().toString(),
      title,
      description,
      priority,
      dueDate,
      completed: false,
      createdAt: Date.now(),
      reward: parseFloat(reward) || 0,
      rewardClaimed: false
    };
    setTasks([newTask, ...tasks]);
    resetForm();
  };

  const handleEdit = (task: Task) => {
    setTitle(task.title);
    setDescription(task.description || '');
    setPriority(task.priority);
    setDueDate(task.dueDate || '');
    setReward(task.reward?.toString() || '0');
    setEditingId(task.id);
    setIsAdding(true);
  };

  const handleUpdate = () => {
    if (!title.trim() || !editingId) return;
    setTasks(tasks.map(t => t.id === editingId ? { ...t, title, description, priority, dueDate, reward: parseFloat(reward) || 0 } : t));
    resetForm();
  };

  const handleDelete = () => {
    if (deleteId) {
      setTasks(tasks.filter(t => t.id !== deleteId));
      setDeleteId(null);
    }
  };

  const toggleComplete = (id: string) => {
    let rewardToAward: { amount: number, title: string } | null = null;

    setTasks(prevTasks => {
      return prevTasks.map(t => {
        if (t.id === id) {
          const isNowCompleted = !t.completed;
          
          // If it's being completed for the first time and has a reward
          if (isNowCompleted && !t.rewardClaimed && t.reward && t.reward > 0) {
            rewardToAward = { amount: t.reward, title: t.title };
            return { ...t, completed: true, rewardClaimed: true };
          }
          
          return { ...t, completed: isNowCompleted };
        }
        return t;
      });
    });

    if (rewardToAward) {
      receivePayment(rewardToAward.amount, `Task Completion: ${rewardToAward.title}`, 'Task Reward');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleComplete(id);
    }
  };

  const filteredTasks = tasks
    .filter(t => {
      if (filter === 'active') return !t.completed;
      if (filter === 'completed') return t.completed;
      return true;
    })
    .sort((a, b) => {
      if (sort === 'manual') return 0; // Keep current array order
      if (sort === 'priority') {
        const pMap = { high: 3, medium: 2, low: 1 };
        return pMap[b.priority] - pMap[a.priority];
      }
      return b.createdAt - a.createdAt;
    });

  return (
    <div className="glass-panel p-6 rounded-2xl border border-gray-200 bg-white/80 shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-[var(--color-supreme-text)]">Tasks</h2>
          <p className="text-gray-500 text-sm">Manage your daily objectives</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsAdding(true); }}
          className="px-4 py-2 bg-[var(--color-supreme-gold)] text-white rounded-xl font-medium hover:bg-[var(--color-supreme-gold-light)] transition-colors flex items-center gap-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-supreme-gold)] focus:ring-offset-2"
          aria-label="Create new task"
        >
          <Plus className="w-4 h-4" /> New Task
        </button>
      </div>

      {/* Filters & Sort */}
      <div className="flex flex-wrap items-center gap-3 mb-6 pb-4 border-b border-gray-100" role="toolbar" aria-label="Task filters and sorting">
        <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-200" role="group" aria-label="Filter tasks">
          {(['all', 'active', 'completed'] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={clsx(
                "px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-supreme-gold)]",
                filter === f ? "bg-white text-[var(--color-supreme-text)] shadow-sm" : "text-gray-500 hover:text-gray-700"
              )}
              aria-pressed={filter === f}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="h-6 w-px bg-gray-200 mx-2 hidden sm:block"></div>
        <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-200" role="group" aria-label="Sort tasks">
          {(['manual', 'date', 'priority'] as SortType[]).map((s) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={clsx(
                "px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-supreme-gold)]",
                sort === s ? "bg-white text-[var(--color-supreme-text)] shadow-sm" : "text-gray-500 hover:text-gray-700"
              )}
              aria-pressed={sort === s}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <Reorder.Group 
        axis="y" 
        values={tasks} 
        onReorder={setTasks}
        className="space-y-3" 
        role="list"
      >
        <AnimatePresence mode="popLayout">
          {filteredTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              sort={sort}
              filter={filter}
              toggleComplete={toggleComplete}
              handleKeyDown={handleKeyDown}
              handleEdit={handleEdit}
              setDeleteId={setDeleteId}
            />
          ))}
        </AnimatePresence>
        
        {filteredTasks.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p>No tasks found</p>
          </div>
        )}
      </Reorder.Group>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-[var(--color-supreme-text)]">
                  {editingId ? 'Edit Task' : 'New Task'}
                </h3>
                <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="What needs to be done?"
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-[var(--color-supreme-gold)] focus:ring-1 focus:ring-[var(--color-supreme-gold)] outline-none"
                    autoFocus
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add details..."
                    rows={3}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-[var(--color-supreme-gold)] focus:ring-1 focus:ring-[var(--color-supreme-gold)] outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as any)}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-[var(--color-supreme-gold)] focus:ring-1 focus:ring-[var(--color-supreme-gold)] outline-none bg-white"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reward ($)</label>
                    <input
                      type="number"
                      value={reward}
                      onChange={(e) => setReward(e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-[var(--color-supreme-gold)] focus:ring-1 focus:ring-[var(--color-supreme-gold)] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-[var(--color-supreme-gold)] focus:ring-1 focus:ring-[var(--color-supreme-gold)] outline-none"
                  />
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                <button onClick={resetForm} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition-colors">
                  Cancel
                </button>
                <button 
                  onClick={editingId ? handleUpdate : handleAdd}
                  className="px-6 py-2 bg-[var(--color-supreme-gold)] text-white font-bold rounded-lg hover:bg-[var(--color-supreme-gold-light)] transition-colors shadow-sm flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {editingId ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {deleteId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden p-6 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Task?</h3>
              <p className="text-gray-500 mb-6">Are you sure you want to delete this task? This action cannot be undone.</p>
              
              <div className="flex gap-3 justify-center">
                <button 
                  onClick={() => setDeleteId(null)}
                  className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-sm"
                >
                  Delete Task
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
