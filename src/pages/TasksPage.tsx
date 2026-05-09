import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { db, auth } from '../lib/firebase';
import { collection, query, getDocs, doc, setDoc, updateDoc, deleteDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { CheckSquare, Plus, Clock, CheckCircle2, Circle, Search, Trash2, Calendar } from 'lucide-react';
import { handleFirestoreError, OperationType } from '@/src/lib/firestoreErrorHandler';
import { User, Task } from '@/src/types';

interface TasksPageProps {
  userLevel: string;
}

export default function TasksPage({ userLevel }: TasksPageProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'todo' | 'in-progress' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortByPriority, setSortByPriority] = useState(false);
  
  const [isAdding, setIsAdding] = useState(false);
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    assigneeId: '',
    dueDate: '',
  });

  const [savingTask, setSavingTask] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) return;
    
    // Fetch users for assignment
    const fetchUsers = async () => {
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        const usersData = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
        setUsers(usersData);
      } catch (err) {
         console.error("Failed to fetch users for tasks", err);
      }
    };
    fetchUsers();

    // Listen to tasks
    const unsubscribe = onSnapshot(collection(db, 'tasks'), (snapshot) => {
      const fetchedTasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
      
      // Sort tasks by created date desc
      fetchedTasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setTasks(fetchedTasks);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'tasks');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleCreateTask = async () => {
    if (!newTask.title || !newTask.assigneeId || !auth.currentUser) return;
    setSavingTask(true);
    
    try {
      const selectedUser = users.find(u => u.id === newTask.assigneeId);
      const taskId = doc(collection(db, 'tasks')).id;
      
      const taskData: Task = {
        id: taskId,
        title: newTask.title,
        description: newTask.description || '',
        status: newTask.status as 'todo' | 'in-progress' | 'completed',
        priority: newTask.priority as 'low' | 'medium' | 'high',
        assigneeId: newTask.assigneeId,
        assigneeName: selectedUser?.name || selectedUser?.email || '',
        createdBy: auth.currentUser.uid,
        createdByName: auth.currentUser.displayName || auth.currentUser.email || '',
        createdAt: new Date().toISOString(),
        dueDate: newTask.dueDate || undefined,
      };

      await setDoc(doc(db, 'tasks', taskId), taskData);
      
      setIsAdding(false);
      setNewTask({ title: '', description: '', status: 'todo', priority: 'medium', assigneeId: '', dueDate: '' });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'tasks');
    } finally {
      setSavingTask(false);
    }
  };

  const handleUpdateStatus = async (taskId: string, newStatus: 'todo' | 'in-progress' | 'completed') => {
    try {
      await updateDoc(doc(db, 'tasks', taskId), { status: newStatus });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'tasks');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'tasks');
    }
  };

  const filteredTasks = tasks.filter(t => {
    if (filter !== 'all' && t.status !== filter) return false;
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase()) && !t.assigneeName?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  if (sortByPriority) {
    const priorityWeight = { high: 3, medium: 2, low: 1, undefined: 0 };
    filteredTasks.sort((a, b) => priorityWeight[b.priority || 'medium'] - priorityWeight[a.priority || 'medium']);
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header className="flex justify-between items-end gap-6 border-b border-indigo-900/10 pb-8 pt-4">
        <div>
           <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold uppercase tracking-widest mb-4">
             <CheckSquare className="w-4 h-4" /> Task Management
           </div>
           <h2 className="text-4xl font-serif font-bold text-[#0f172a] italic">Recruitment Tasks</h2>
           <p className="text-[#0f172a]/50 mt-1 max-w-xl">Create, assign, and track your recruitment team's deliverables and to-dos.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-[#0f172a] hover:bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold transition-colors flex items-center gap-2 uppercase tracking-widest text-sm shadow-xl shadow-indigo-900/10"
        >
          <Plus className="w-4 h-4" /> New Task
        </button>
      </header>
      
      {isAdding && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-3xl border border-indigo-100 shadow-xl shadow-indigo-900/5 mb-8 relative"
        >
          <h3 className="text-xl font-serif font-bold text-[#0f172a] mb-6">Create New Task</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-full">
               <label className="block text-xs font-bold uppercase tracking-widest text-[#0f172a]/40 mb-2">Title</label>
               <input 
                 autoFocus
                 type="text" 
                 value={newTask.title} 
                 onChange={e => setNewTask({...newTask, title: e.target.value})} 
                 placeholder="e.g. Schedule interview with Candidate X" 
                 className="w-full bg-slate-50 border border-slate-200 outline-none p-4 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500/20"
               />
            </div>
            <div className="col-span-full">
               <label className="block text-xs font-bold uppercase tracking-widest text-[#0f172a]/40 mb-2">Description</label>
               <textarea 
                 value={newTask.description} 
                 onChange={e => setNewTask({...newTask, description: e.target.value})} 
                 placeholder="Provide details about the task..." 
                 className="w-full bg-slate-50 border border-slate-200 outline-none p-4 rounded-xl font-medium min-h-[100px] focus:ring-2 focus:ring-indigo-500/20"
               />
            </div>
            <div>
               <label className="block text-xs font-bold uppercase tracking-widest text-[#0f172a]/40 mb-2">Priority</label>
               <select 
                 value={newTask.priority} 
                 onChange={e => setNewTask({...newTask, priority: e.target.value as 'low' | 'medium' | 'high'})} 
                 className="w-full bg-slate-50 border border-slate-200 outline-none p-4 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500/20 appearance-none"
               >
                 <option value="low">Low</option>
                 <option value="medium">Medium</option>
                 <option value="high">High</option>
               </select>
            </div>
            <div>
               <label className="block text-xs font-bold uppercase tracking-widest text-[#0f172a]/40 mb-2">Assign To</label>
               <select 
                 value={newTask.assigneeId} 
                 onChange={e => setNewTask({...newTask, assigneeId: e.target.value})} 
                 className="w-full bg-slate-50 border border-slate-200 outline-none p-4 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500/20 appearance-none"
               >
                 <option value="" disabled>Select User...</option>
                 {users.map(u => (
                   <option key={u.id} value={u.id}>{u.name || u.email}</option>
                 ))}
               </select>
            </div>
            <div>
               <label className="block text-xs font-bold uppercase tracking-widest text-[#0f172a]/40 mb-2">Due Date</label>
               <input 
                 type="date" 
                 value={newTask.dueDate} 
                 onChange={e => setNewTask({...newTask, dueDate: e.target.value})} 
                 className="w-full bg-slate-50 border border-slate-200 outline-none p-4 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500/20 text-[#0f172a]/70"
               />
            </div>
          </div>
          <div className="mt-8 flex items-center justify-end gap-3 border-t border-slate-100 pt-6">
             <button 
               onClick={() => { setIsAdding(false); setNewTask({ title: '', description: '', status: 'todo', priority: 'medium', assigneeId: '', dueDate: '' }); }}
               className="px-6 py-3 font-bold text-[#0f172a]/40 hover:text-[#0f172a]/70 transition-colors uppercase tracking-widest text-sm"
             >
               Cancel
             </button>
             <button 
               onClick={handleCreateTask}
               disabled={!newTask.title || !newTask.assigneeId || savingTask}
               className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-bold transition-colors uppercase tracking-widest text-sm flex items-center gap-2"
             >
               {savingTask ? 'Saving...' : 'Create Task'}
             </button>
          </div>
        </motion.div>
      )}

      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
         <div className="flex flex-wrap items-center gap-4">
           <div className="flex bg-white rounded-xl shadow-sm border border-slate-200 p-1 w-max">
             <button onClick={() => setFilter('all')} className={`px-4 py-2 text-sm font-bold uppercase tracking-wider rounded-lg transition-colors ${filter === 'all' ? 'bg-[#0f172a] text-white' : 'text-[#0f172a]/50 hover:bg-slate-50'}`}>All</button>
             <button onClick={() => setFilter('todo')} className={`px-4 py-2 text-sm font-bold uppercase tracking-wider rounded-lg transition-colors ${filter === 'todo' ? 'bg-indigo-100 text-indigo-700' : 'text-[#0f172a]/50 hover:bg-slate-50'}`}>To Do</button>
             <button onClick={() => setFilter('in-progress')} className={`px-4 py-2 text-sm font-bold uppercase tracking-wider rounded-lg transition-colors ${filter === 'in-progress' ? 'bg-amber-100 text-amber-700' : 'text-[#0f172a]/50 hover:bg-slate-50'}`}>In Progress</button>
             <button onClick={() => setFilter('completed')} className={`px-4 py-2 text-sm font-bold uppercase tracking-wider rounded-lg transition-colors ${filter === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'text-[#0f172a]/50 hover:bg-slate-50'}`}>Completed</button>
           </div>
           
           <div className="flex bg-white rounded-xl shadow-sm border border-slate-200 p-1 w-max">
             <select 
                value={priorityFilter} 
                onChange={(e) => setPriorityFilter(e.target.value as any)}
                className="px-4 py-2 text-sm font-bold uppercase tracking-wider rounded-lg outline-none bg-transparent text-[#0f172a]/70 cursor-pointer"
             >
                <option value="all">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
             </select>
           </div>
           
           <button 
             onClick={() => setSortByPriority(!sortByPriority)}
             className={`px-4 py-2.5 text-sm font-bold uppercase tracking-wider rounded-xl border transition-colors ${sortByPriority ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-slate-200 text-[#0f172a]/50 hover:bg-slate-50'}`}
           >
             Sort by Priority
           </button>
         </div>
         <div className="relative w-full md:w-72">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0f172a]/30" />
           <input 
             type="text" 
             placeholder="Search tasks..." 
             value={searchQuery}
             onChange={e => setSearchQuery(e.target.value)}
             className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 outline-none bg-white focus:ring-2 focus:ring-indigo-500/20 font-medium text-sm"
           />
         </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 border-dashed">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
             <CheckSquare className="w-8 h-8 text-slate-300" />
          </div>
          <p className="text-xl font-bold text-[#0f172a]/40">No tasks found</p>
          <p className="text-[#0f172a]/30 mt-2">Create a new task to assign work to your team.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredTasks.map(task => (
            <motion.div 
              key={task.id}
              whileHover={{ x: 4 }}
              className={`p-6 bg-white rounded-2xl border transition-all flex flex-col md:flex-row gap-6 items-start md:items-center justify-between ${task.status === 'completed' ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200 shadow-sm hover:shadow-md'}`}
            >
               <div className="flex-1">
                 <div className="flex items-center gap-3 mb-2">
                    {task.status === 'todo' && <Circle className="w-5 h-5 text-indigo-300 cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => handleUpdateStatus(task.id, 'in-progress')} />}
                    {task.status === 'in-progress' && <Clock className="w-5 h-5 text-amber-500 cursor-pointer hover:text-amber-600 transition-colors" onClick={() => handleUpdateStatus(task.id, 'completed')} />}
                    {task.status === 'completed' && <CheckCircle2 className="w-5 h-5 text-emerald-500 cursor-pointer hover:text-emerald-600 transition-colors" onClick={() => handleUpdateStatus(task.id, 'todo')} />}
                    <h3 className={`text-lg font-bold ${task.status === 'completed' ? 'line-through text-[#0f172a]/40' : 'text-[#0f172a]'}`}>{task.title}</h3>
                     {task.priority && (
                       <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ml-2 ${
                         task.priority === 'high' ? 'bg-rose-100 text-rose-700' :
                         task.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                         'bg-sky-100 text-sky-700'
                       }`}>
                         {task.priority}
                       </span>
                     )}
                 </div>
                 {task.description && (
                   <p className="text-[#0f172a]/60 pl-8 text-sm mb-3 line-clamp-2 max-w-3xl">{task.description}</p>
                 )}
                 <div className="flex flex-wrap items-center gap-4 pl-8 mt-2">
                   <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-md text-xs font-bold text-[#0f172a]/60">
                     <span className="w-4 h-4 rounded bg-indigo-200 text-indigo-700 flex items-center justify-center text-[10px] uppercase">{task.assigneeName?.[0]}</span>
                     {task.assigneeName}
                   </div>
                   {task.dueDate && (
                     <div className="flex items-center gap-1.5 text-xs font-bold text-[#0f172a]/40 uppercase tracking-widest">
                       <Calendar className="w-3.5 h-3.5" /> Due {new Date(task.dueDate).toLocaleDateString()}
                     </div>
                   )}
                 </div>
               </div>
               
               <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0 pl-8 md:pl-0 border-t md:border-t-0 border-slate-100 pt-4 md:pt-0">
                  <select 
                    value={task.status}
                    onChange={(e) => handleUpdateStatus(task.id, e.target.value as any)}
                    className={`text-xs font-bold uppercase tracking-widest px-3 py-2 rounded-lg outline-none cursor-pointer border ${
                      task.status === 'todo' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 
                      task.status === 'in-progress' ? 'bg-amber-50 text-amber-700 border-amber-100' : 
                      'bg-emerald-50 text-emerald-700 border-emerald-100'
                    }`}
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                  <button 
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-2 text-rose-300 hover:text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
               </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
