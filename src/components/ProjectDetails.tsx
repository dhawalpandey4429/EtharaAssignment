import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { taskService, Task, TaskStatus } from '../services/taskService';
import { projectService, Project } from '../services/projectService';
import { Plus, MoreVertical, Calendar, User, Search, Filter, ChevronRight, UserPlus, Shield, X } from 'lucide-react';
import { motion, Reorder } from 'motion/react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

export function ProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const navigate = useNavigate();
  
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [memberEmail, setMemberEmail] = useState('');

  useEffect(() => {
    if (!id || !profile) return;
    
    // Subscribe to tasks
    const unsubscribeTasks = taskService.subscribeToProjectTasks(id, setTasks);
    
    // Fetch project details (real-time not strictly needed for details, but helpful)
    const unsubscribeProject = projectService.subscribeToUserProjects(profile.uid, (projs) => {
      const p = projs.find(pj => pj.id === id);
      if (p) {
        setProject(p);
      } else {
        // Not found or not a member
        navigate('/projects');
      }
    });

    return () => {
      unsubscribeTasks();
      unsubscribeProject();
    };
  }, [id, profile]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !id || !profile) return;
    
    await taskService.createTask({
      projectId: id,
      title: newTaskTitle,
      status: 'todo',
      priority: 'medium',
      assigneeId: profile.uid,
    }, profile.uid);
    
    setNewTaskTitle('');
    setIsTaskModalOpen(false);
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberEmail.trim() || !id) return;
    await projectService.addMember(id, memberEmail);
    setMemberEmail('');
    setIsMemberModalOpen(false);
  };

  const updateStatus = async (taskId: string, status: TaskStatus) => {
    await taskService.updateTask(taskId, { status });
  };

  const columns: { title: string; status: TaskStatus; color: string }[] = [
    { title: 'To Do', status: 'todo', color: 'bg-gray-100 text-gray-500' },
    { title: 'In Progress', status: 'in-progress', color: 'bg-blue-50 text-blue-600' },
    { title: 'Completed', status: 'done', color: 'bg-emerald-50 text-emerald-600' },
  ];

  if (!project) return null;

  return (
    <div className="space-y-8 flex flex-col h-full">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-3xl font-black shadow-lg">
            {project.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-white">{project.name}</h1>
              {project.adminId === profile?.uid && (
                <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 text-[9px] font-black uppercase tracking-[0.2em] rounded border border-indigo-500/20">
                  ADMIN
                </span>
              )}
            </div>
            <p className="text-text-muted mt-1 text-sm max-w-xl">{project.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex -space-x-3 pr-4 border-r border-border-dark">
            {project.memberIds.map((m, i) => (
              <div key={m} className="w-8 h-8 rounded-full border-2 border-brand-bg bg-blue-700 flex items-center justify-center text-[10px] font-bold text-white shadow-md">
                {i + 1}
              </div>
            ))}
            <button 
              onClick={() => setIsMemberModalOpen(true)}
              className="w-8 h-8 rounded-full border-2 border-brand-bg bg-border-dark flex items-center justify-center text-text-muted hover:text-white transition-all shadow-md"
            >
              <Plus size={16} />
            </button>
          </div>
          <button
            onClick={() => setIsTaskModalOpen(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all text-sm"
          >
            <Plus size={18} />
            Add Task
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 min-h-0 overflow-hidden">
        {columns.map((col) => (
          <div key={col.status} className="flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-2">
                <div className={cn("w-2 h-2 rounded-full", col.status === 'todo' ? 'bg-slate-500' : col.status === 'in-progress' ? 'bg-blue-500' : 'bg-emerald-500')}></div>
                <h3 className="text-sm font-semibold tracking-tight text-[#9A9BA5]">{col.title}</h3>
                <span className="text-[10px] font-bold text-text-muted ml-1">
                  {tasks.filter(t => t.status === col.status).length}
                </span>
              </div>
            </div>

            <div className="flex-1 bg-[#111218]/50 rounded-2xl p-3 overflow-y-auto space-y-4 no-scrollbar">
              {tasks.filter(t => t.status === col.status).map((task) => (
                <motion.div
                  layout
                  key={task.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "bg-[#161920] p-4 rounded-xl border border-border-dark shadow-sm hover:border-indigo-500/30 transition-all group",
                    col.status === 'done' ? 'opacity-50' : ''
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className={cn(
                      "px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border",
                      task.priority === 'high' ? "bg-rose-500/10 text-rose-500 border-rose-500/20" : task.priority === 'medium' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                    )}>
                      {task.priority || 'medium'}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {col.status !== 'todo' && (
                        <button onClick={() => updateStatus(task.id, 'todo')} className="p-1 hover:bg-white/5 rounded text-[10px] text-text-muted">Todo</button>
                      )}
                      {col.status !== 'in-progress' && (
                        <button onClick={() => updateStatus(task.id, 'in-progress')} className="p-1 hover:bg-blue-500/10 rounded text-[10px] text-blue-400">Start</button>
                      )}
                      {col.status !== 'done' && (
                        <button onClick={() => updateStatus(task.id, 'done')} className="p-1 hover:bg-emerald-500/10 rounded text-[10px] text-emerald-400 font-bold">Done</button>
                      )}
                    </div>
                  </div>
                  
                  <h4 className={cn("font-medium text-sm text-white mb-3", col.status === 'done' ? 'line-through decoration-emerald-500/50' : '')}>{task.title}</h4>
                  
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2 text-[10px] text-text-muted">
                        <Calendar size={12} />
                        {task.dueDate ? format(new Date(task.dueDate), 'MMM d') : 'No due date'}
                     </div>
                     <div className="w-5 h-5 rounded-full bg-indigo-500 border border-white/10"></div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Modals with dark theme */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 backdrop-blur-md bg-black/60">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card-bg w-full max-w-md rounded-2xl p-8 shadow-2xl border border-border-dark"
          >
            <h2 className="text-xl font-bold mb-6 text-white">Add Objective</h2>
            <form onSubmit={handleCreateTask} className="space-y-5">
              <input
                autoFocus
                required
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-[#0D0F14] border border-border-dark text-white focus:outline-none focus:border-indigo-500 transition-all font-medium"
                placeholder="What is the goal?"
              />
              <button
                type="submit"
                className="w-full px-4 py-3 rounded-lg font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
              >
                Create Task
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {isMemberModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 backdrop-blur-md bg-black/60">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card-bg w-full max-w-md rounded-2xl p-8 shadow-2xl border border-border-dark text-center"
          >
            <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center mx-auto mb-6 border border-indigo-500/20">
               <UserPlus size={24} />
            </div>
            <h2 className="text-xl font-bold mb-2 text-white">Project Access</h2>
            <p className="text-text-muted text-sm mb-6">Invite collaborators via email.</p>
            <form onSubmit={handleAddMember} className="space-y-4 text-left">
              <input
                required
                type="email"
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-[#0D0F14] border border-border-dark text-white focus:outline-none focus:border-indigo-500 transition-all font-medium"
                placeholder="team@example.com"
              />
              <div className="flex gap-3">
                 <button type="button" onClick={() => setIsMemberModalOpen(false)} className="flex-1 px-4 py-3 rounded-lg font-bold text-text-muted hover:bg-white/5 transition-all">Cancel</button>
                 <button type="submit" className="flex-1 px-4 py-3 rounded-lg font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20">Invite</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
