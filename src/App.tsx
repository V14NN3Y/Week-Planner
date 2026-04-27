/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Trash2, Plus } from 'lucide-react';
import StarBackground from './components/StarBackground';
import { getSupabase } from './services/supabaseClient';

type Priority = 'haute' | 'moyenne' | 'basse';
type Task = { id: string; text: string; priority: Priority; completed: boolean; day: string };
type Week = Record<string, Task[]>;

const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];

export default function App() {
  const [planner, setPlanner] = useState<Week>(days.reduce((acc, day) => ({ ...acc, [day]: [] }), {}));
  const [newTasks, setNewTasks] = useState<Record<string, {text: string, priority: Priority}>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    setLoading(true);
    const supabase = getSupabase();
    if (!supabase) {
        setLoading(false);
        return;
    }
    const { data, error } = await supabase.from('tasks').select('*');
    if (error) {
        console.error('Error fetching tasks:', error);
    } else {
        const weekData: Week = days.reduce((acc, day) => ({ ...acc, [day]: (data || []).filter(t => t.day === day) }), {});
        setPlanner(weekData);
    }
    setLoading(false);
  }

  const addTask = async (day: string) => {
    const taskInfo = newTasks[day];
    if (!taskInfo || !taskInfo.text.trim()) return;
    
    const supabase = getSupabase();
    if (!supabase) return;

    const newTask = { text: taskInfo.text, priority: taskInfo.priority || 'moyenne', completed: false, day };
    const { data, error } = await supabase.from('tasks').insert([newTask]).select().single();
    
    if (error) {
        console.error('Error adding task:', error);
    } else if (data) {
        setPlanner(prev => ({
            ...prev,
            [day]: [...prev[day], data as Task]
        }));
        setNewTasks(prev => ({ ...prev, [day]: {text: '', priority: 'moyenne'} }));
    }
  };

  const toggleTaskCompletion = async (day: string, taskId: string) => {
    const task = planner[day].find(t => t.id === taskId);
    if (!task) return;

    const supabase = getSupabase();
    if (!supabase) return;

    const { error } = await supabase.from('tasks').update({ completed: !task.completed }).eq('id', taskId);
    if (error) {
        console.error('Error updating task:', error);
    } else {
        setPlanner(prev => ({
            ...prev,
            [day]: prev[day].map(t => t.id === taskId ? { ...t, completed: !t.completed } : t)
        }));
    }
  };

  const updateTaskText = async (day: string, taskId: string, newText: string) => {
    setPlanner(prev => ({
      ...prev,
      [day]: prev[day].map(t => t.id === taskId ? { ...t, text: newText } : t)
    }));
    
    const supabase = getSupabase();
    if (!supabase) return;

    await supabase.from('tasks').update({ text: newText }).eq('id', taskId);
  };

  const updateTaskPriority = async (day: string, taskId: string, newPriority: Priority) => {
    setPlanner(prev => ({
      ...prev,
      [day]: prev[day].map(t => t.id === taskId ? { ...t, priority: newPriority } : t)
    }));
    const supabase = getSupabase();
    if (!supabase) return;
    await supabase.from('tasks').update({ priority: newPriority }).eq('id', taskId);
  };

  const removeTask = async (day: string, taskId: string) => {
    setPlanner(prev => ({
      ...prev,
      [day]: prev[day].filter(t => t.id !== taskId)
    }));
    const supabase = getSupabase();
    if (!supabase) return;
    await supabase.from('tasks').delete().eq('id', taskId);
  };

  return (
    <div id="app" className="min-h-screen p-4 md:p-8">
      <StarBackground />
      <header className="text-center mb-8 relative z-10">
        <h1 className="text-4xl md:text-7xl font-bold text-white flex items-center justify-center gap-4 barbie-title">
          <Sparkles className="w-8 h-8 md:w-16 md:h-16 text-white animate-spin-slow" />
          Week Planner
          <Sparkles className="w-8 h-8 md:w-16 md:h-16 text-white animate-spin-slow-reverse" />
        </h1>
        <p className="text-white mt-1 text-2xl font-bold italic opacity-90">of Madje 💖</p>
        <p className="text-white mt-2 md:mt-4 text-lg md:text-xl font-bold uppercase tracking-widest opacity-90">✨ Profite de ta semaine avec éclat ✨</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 relative z-10">
        {days.map(day => (
          <motion.div
            key={day}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-pink p-4 md:p-6 rounded-3xl shadow-xl flex flex-col"
          >
            <h2 className="text-xl md:text-2xl font-black text-white bg-barbie-pink text-center py-2 rounded-2xl mb-4 shadow-lg">{day.toUpperCase()}</h2>
            
            <div className="flex flex-col gap-2 mb-4">
              <input
                type="text"
                value={newTasks[day]?.text || ''}
                onChange={e => setNewTasks(prev => ({ ...prev, [day]: { ...prev[day], text: e.target.value, priority: prev[day]?.priority || 'moyenne' } }))}
                placeholder="Nouvelle tâche..."
                className="flex-1 p-2 rounded-xl border border-pink-200 bg-pink-50/70 focus:outline-none focus:ring-2 focus:ring-barbie-pink"
              />
              <div className="flex gap-2">
                <select 
                    value={newTasks[day]?.priority || 'moyenne'} 
                    onChange={e => setNewTasks(prev => ({ ...prev, [day]: { ...prev[day], text: prev[day]?.text || '', priority: e.target.value as Priority } }))}
                    className="p-2 rounded-xl bg-pink-100/50 border border-pink-200 text-sm focus:outline-none focus:ring-2 focus:ring-barbie-pink"
                >
                    <option value="haute">Haute</option>
                    <option value="moyenne">Moyenne</option>
                    <option value="basse">Basse</option>
                </select>
                <button
                    onClick={() => addTask(day)}
                    className="flex-grow glitter-button text-white p-2 rounded-xl transition hover:brightness-110 flex items-center justify-center"
                >
                    <Plus size={20} />
                </button>
              </div>
            </div>

            <ul className="space-y-3 flex-grow">
              <AnimatePresence>
                {planner[day].map(task => (
                  <motion.li
                    key={task.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex flex-col gap-2 bg-pink-50/70 p-3 rounded-xl border border-pink-200 shadow-sm"
                  >
                    <div className="flex items-center gap-2">
                        <input 
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => toggleTaskCompletion(day, task.id)}
                            className="accent-barbie-pink"
                        />
                        <input 
                            value={task.text}
                            onChange={e => updateTaskText(day, task.id, e.target.value)}
                            className={`bg-transparent w-full font-semibold text-sm text-gray-900 focus:outline-none ${task.completed ? 'line-through text-gray-500' : ''}`}
                        />
                    </div>
                    <div className="flex justify-between items-center">
                        <select 
                            value={task.priority}
                            onChange={e => updateTaskPriority(day, task.id, e.target.value as Priority)}
                            className="bg-pink-100/50 text-xs px-2 py-1 rounded-lg border border-pink-200"
                        >
                            <option value="haute">🔴</option>
                            <option value="moyenne">🟡</option>
                            <option value="basse">🟢</option>
                        </select>
                        <button
                        onClick={() => removeTask(day, task.id)}
                        className="text-pink-400 hover:text-barbie-pink transition"
                        >
                        <Trash2 size={16} />
                        </button>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

