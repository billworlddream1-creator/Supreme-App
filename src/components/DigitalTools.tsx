import React, { useState, useEffect } from 'react';
import { 
  Calculator as CalcIcon, 
  Calendar as CalIcon, 
  FileText, 
  Plus, 
  Trash2, 
  Save,
  ChevronLeft,
  ChevronRight,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import clsx from 'clsx';

export default function DigitalTools() {
  const [activeTool, setActiveTool] = useState<'calculator' | 'calendar' | 'notes'>('calculator');

  return (
    <div className="space-y-6">
      <div className="flex gap-4 p-1 bg-gray-100 rounded-2xl border border-gray-200 w-fit">
        <button
          onClick={() => setActiveTool('calculator')}
          className={clsx(
            "flex items-center gap-2 px-6 py-2 rounded-xl font-bold transition-all",
            activeTool === 'calculator' ? "bg-white text-[var(--color-supreme-text)] shadow-sm" : "text-gray-500 hover:text-gray-700"
          )}
        >
          <CalcIcon className="w-4 h-4" /> Calculator
        </button>
        <button
          onClick={() => setActiveTool('calendar')}
          className={clsx(
            "flex items-center gap-2 px-6 py-2 rounded-xl font-bold transition-all",
            activeTool === 'calendar' ? "bg-white text-[var(--color-supreme-text)] shadow-sm" : "text-gray-500 hover:text-gray-700"
          )}
        >
          <CalIcon className="w-4 h-4" /> Calendar
        </button>
        <button
          onClick={() => setActiveTool('notes')}
          className={clsx(
            "flex items-center gap-2 px-6 py-2 rounded-xl font-bold transition-all",
            activeTool === 'notes' ? "bg-white text-[var(--color-supreme-text)] shadow-sm" : "text-gray-500 hover:text-gray-700"
          )}
        >
          <FileText className="w-4 h-4" /> Notes
        </button>
      </div>

      <div className="min-h-[500px]">
        <AnimatePresence mode="wait">
          {activeTool === 'calculator' && <Calculator key="calc" />}
          {activeTool === 'calendar' && <CalendarTool key="cal" />}
          {activeTool === 'notes' && <NotesTool key="notes" />}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Calculator() {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');

  const handleNumber = (num: string) => {
    setDisplay(prev => prev === '0' ? num : prev + num);
  };

  const handleOperator = (op: string) => {
    setEquation(display + ' ' + op + ' ');
    setDisplay('0');
  };

  const calculate = () => {
    try {
      const result = eval(equation + display);
      setDisplay(String(result));
      setEquation('');
    } catch (e) {
      setDisplay('Error');
    }
  };

  const clear = () => {
    setDisplay('0');
    setEquation('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="max-w-md mx-auto bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden"
    >
      <div className="p-8 bg-gray-900 text-right">
        <div className="text-gray-400 text-sm h-6 mb-1">{equation}</div>
        <div className="text-white text-4xl font-mono font-bold truncate">{display}</div>
      </div>
      <div className="p-6 grid grid-cols-4 gap-3">
        <button onClick={clear} className="col-span-2 p-4 bg-red-50 text-red-600 rounded-2xl font-bold hover:bg-red-100 transition-colors">AC</button>
        <button onClick={() => handleOperator('/')} className="p-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-colors">÷</button>
        <button onClick={() => handleOperator('*')} className="p-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-colors">×</button>
        
        {[7, 8, 9].map(n => (
          <button key={n} onClick={() => handleNumber(String(n))} className="p-4 bg-white border border-gray-100 text-gray-800 rounded-2xl font-bold hover:bg-gray-50 transition-colors shadow-sm">{n}</button>
        ))}
        <button onClick={() => handleOperator('-')} className="p-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-colors">−</button>
        
        {[4, 5, 6].map(n => (
          <button key={n} onClick={() => handleNumber(String(n))} className="p-4 bg-white border border-gray-100 text-gray-800 rounded-2xl font-bold hover:bg-gray-50 transition-colors shadow-sm">{n}</button>
        ))}
        <button onClick={() => handleOperator('+')} className="p-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-colors">+</button>
        
        {[1, 2, 3].map(n => (
          <button key={n} onClick={() => handleNumber(String(n))} className="p-4 bg-white border border-gray-100 text-gray-800 rounded-2xl font-bold hover:bg-gray-50 transition-colors shadow-sm">{n}</button>
        ))}
        <button onClick={calculate} className="row-span-2 p-4 bg-[var(--color-supreme-gold)] text-white rounded-2xl font-bold hover:bg-[var(--color-supreme-gold-light)] transition-colors shadow-lg shadow-[var(--color-supreme-gold)]/20">=</button>
        
        <button onClick={() => handleNumber('0')} className="col-span-2 p-4 bg-white border border-gray-100 text-gray-800 rounded-2xl font-bold hover:bg-gray-50 transition-colors shadow-sm">0</button>
        <button onClick={() => handleNumber('.')} className="p-4 bg-white border border-gray-100 text-gray-800 rounded-2xl font-bold hover:bg-gray-50 transition-colors shadow-sm">.</button>
      </div>
    </motion.div>
  );
}

function CalendarTool() {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();
  
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const totalDays = daysInMonth(year, month);
  const firstDay = firstDayOfMonth(year, month);
  
  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let i = 1; i <= totalDays; i++) calendarDays.push(i);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden"
    >
      <div className="p-6 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-800">{monthNames[month]} {year}</h3>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-2 hover:bg-gray-200 rounded-xl transition-colors"><ChevronLeft className="w-5 h-5 text-gray-600" /></button>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-200 rounded-xl transition-colors"><ChevronRight className="w-5 h-5 text-gray-600" /></button>
        </div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-7 gap-2 mb-4">
          {days.map(day => (
            <div key={day} className="text-center text-xs font-bold text-gray-400 uppercase">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day, i) => (
            <div 
              key={i} 
              className={clsx(
                "aspect-square flex items-center justify-center rounded-2xl text-sm font-bold transition-all",
                day === null ? "opacity-0" : "hover:bg-gray-50 cursor-pointer border border-transparent",
                day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear() 
                  ? "bg-[var(--color-supreme-gold)] text-white shadow-lg shadow-[var(--color-supreme-gold)]/30" 
                  : "text-gray-700"
              )}
            >
              {day}
            </div>
          ))}
        </div>
      </div>
      <div className="p-6 bg-gray-50 border-t border-gray-100">
        <h4 className="text-sm font-bold text-gray-500 uppercase mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4" /> Upcoming Events
        </h4>
        <div className="space-y-3">
          <div className="p-3 bg-white rounded-xl border border-gray-200 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-sm font-bold text-gray-700">Client Meeting</span>
            </div>
            <span className="text-xs text-gray-400">10:00 AM</span>
          </div>
          <div className="p-3 bg-white rounded-xl border border-gray-200 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-purple-500" />
              <span className="text-sm font-bold text-gray-700">Project Deadline</span>
            </div>
            <span className="text-xs text-gray-400">5:00 PM</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function NotesTool() {
  const [notes, setNotes] = useState<{id: string, title: string, content: string, date: string}[]>(() => {
    const saved = localStorage.getItem('supreme_notes');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editNote, setEditNote] = useState({ title: '', content: '' });

  useEffect(() => {
    localStorage.setItem('supreme_notes', JSON.stringify(notes));
  }, [notes]);

  const addNote = () => {
    const newNote = {
      id: Math.random().toString(36).substring(7),
      title: 'New Note',
      content: '',
      date: new Date().toLocaleDateString()
    };
    setNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id);
    setEditNote({ title: newNote.title, content: newNote.content });
    setIsEditing(true);
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(n => n.id !== id));
    if (activeNoteId === id) setActiveNoteId(null);
  };

  const saveNote = () => {
    if (!activeNoteId) return;
    setNotes(notes.map(n => n.id === activeNoteId ? { ...n, ...editNote } : n));
    setIsEditing(false);
  };

  const activeNote = notes.find(n => n.id === activeNoteId);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]"
    >
      <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-gray-800">My Notes</h3>
          <button onClick={addNote} className="p-2 bg-[var(--color-supreme-gold)] text-white rounded-xl hover:bg-[var(--color-supreme-gold-light)] transition-all shadow-md">
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notes.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p className="text-sm">No notes yet</p>
            </div>
          ) : (
            notes.map(note => (
              <div 
                key={note.id}
                onClick={() => {
                  setActiveNoteId(note.id);
                  setEditNote({ title: note.title, content: note.content });
                  setIsEditing(false);
                }}
                className={clsx(
                  "p-4 rounded-2xl border transition-all cursor-pointer group",
                  activeNoteId === note.id ? "bg-indigo-50 border-indigo-200" : "bg-white border-gray-100 hover:border-gray-200"
                )}
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-bold text-gray-800 truncate pr-4">{note.title}</h4>
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded text-red-500 transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2 mb-2">{note.content || 'No content...'}</p>
                <span className="text-[10px] text-gray-400 font-bold uppercase">{note.date}</span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="md:col-span-2 bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden flex flex-col">
        {activeNote ? (
          <>
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              {isEditing ? (
                <input 
                  type="text" 
                  value={editNote.title}
                  onChange={(e) => setEditNote({ ...editNote, title: e.target.value })}
                  className="bg-transparent text-xl font-bold text-gray-800 outline-none border-b-2 border-[var(--color-supreme-gold)]"
                />
              ) : (
                <h3 className="text-xl font-bold text-gray-800">{activeNote.title}</h3>
              )}
              <div className="flex gap-2">
                {isEditing ? (
                  <button onClick={saveNote} className="px-4 py-2 bg-green-600 text-white rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-green-700 transition-all">
                    <Save className="w-4 h-4" /> Save
                  </button>
                ) : (
                  <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-all">
                    Edit Note
                  </button>
                )}
              </div>
            </div>
            <div className="flex-1 p-8">
              {isEditing ? (
                <textarea 
                  value={editNote.content}
                  onChange={(e) => setEditNote({ ...editNote, content: e.target.value })}
                  className="w-full h-full text-gray-700 resize-none outline-none leading-relaxed"
                  placeholder="Start typing your note..."
                />
              ) : (
                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {activeNote.content || <span className="text-gray-300 italic">No content in this note.</span>}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mb-4">
              <FileText className="w-10 h-10 opacity-20" />
            </div>
            <h3 className="text-lg font-bold text-gray-600">Select a note to view</h3>
            <p className="text-sm max-w-xs mt-2">Choose a note from the sidebar or create a new one to get started.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
