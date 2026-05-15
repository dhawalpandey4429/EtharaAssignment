import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { projectService, Project } from '../services/projectService';
import { taskService, Task } from '../services/taskService';
import { CheckCircle2, Circle, Clock, AlertCircle, Plus, Users, BarChart3 } from 'lucide-react';
import { motion } from 'motion/react';

export function Dashboard() {
  const { profile } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;

    const unsubscribeProjects = projectService.subscribeToUserProjects(profile.uid, setProjects);

    // Query tasks where user is assignee OR creator
    const qTasks = query(
      collection(db, 'tasks'),
      where('projectId', '!=', ''), // Dummy to allow complex queries if needed, but simple is better
    );
    
    // Actually, list tasks is governed by security rules. 
    // We can query all tasks and the rules will filter them, BUT Firestore requires client-side filter to matches rules.
    // Let's query tasks where creatorId == uid as a starter for the dashboard.
    const qCreator = query(collection(db, 'tasks'), where('creatorId', '==', profile.uid));
    const unsubscribeTasks = onSnapshot(qCreator, (snap) => {
      const taskList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
      setTasks(taskList);
      setLoading(false);
    });

    return () => {
      unsubscribeProjects();
      unsubscribeTasks();
    };
  }, [profile]);

  // Aggregate stats
  const stats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    done: tasks.filter(t => t.status === 'done').length,
    overdue: tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done').length,
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Welcome, {profile?.displayName?.split(' ')[0]}</h1>
        <p className="text-text-muted mt-1">Real-time overview of your team's productivity.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Tasks', value: stats.total, icon: BarChart3, color: 'text-indigo-400', bg: 'bg-[#161920]' },
          { label: 'In Progress', value: stats.inProgress, icon: Clock, color: 'text-blue-400', bg: 'bg-[#161920]' },
          { label: 'Completed', value: stats.done, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-[#161920]' },
          { label: 'Overdue', value: stats.overdue, icon: AlertCircle, color: 'text-rose-500', bg: 'bg-[#161920]' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={cn(
              "p-5 rounded-xl border border-border-dark flex flex-col justify-between h-32",
              stat.bg
            )}
          >
            <div className="flex justify-between items-start">
               <p className="text-[10px] text-text-muted font-black uppercase tracking-widest">{stat.label}</p>
               <stat.icon size={16} className={stat.color} />
            </div>
            <h3 className={cn("text-3xl font-bold mt-1", stat.color)}>{stat.value.toString().padStart(2, '0')}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Projects */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Active Projects</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((project) => (
              <motion.div
                key={project.id}
                whileHover={{ y: -4, borderColor: 'rgba(99, 102, 241, 0.4)' }}
                className="bg-card-bg p-5 rounded-xl border border-border-dark transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
                    {project.name.charAt(0)}
                  </div>
                  <div className="flex -space-x-2">
                    {project.memberIds.slice(0, 3).map((m, i) => (
                      <div key={i} className="w-7 h-7 rounded-full bg-border-dark border-2 border-card-bg flex items-center justify-center text-[8px] font-bold">
                        {i + 1}
                      </div>
                    ))}
                  </div>
                </div>
                <h4 className="font-bold text-white group-hover:text-indigo-400 transition-colors">{project.name}</h4>
                <p className="text-xs text-text-muted mt-1 line-clamp-1">{project.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Priority tasks view remains similar but styled */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">Focus</h3>
          <div className="space-y-3">
             {tasks.slice(0, 4).map(task => (
               <div key={task.id} className="bg-card-bg border border-border-dark p-4 rounded-xl flex items-center gap-3">
                 <div className={cn("w-1.5 h-8 rounded-full", task.priority === 'high' ? 'bg-rose-500' : 'bg-blue-500')} />
                 <div>
                    <h5 className="text-xs font-bold text-white mb-0.5">{task.title}</h5>
                    <p className="text-[10px] text-text-muted">{task.status.toUpperCase()}</p>
                 </div>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}
