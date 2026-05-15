import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { projectService, Project } from '../services/projectService';
import { Plus, UserPlus, Trash2, FolderKanban, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function Projects() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');

  useEffect(() => {
    if (!profile) return;
    const unsubscribe = projectService.subscribeToUserProjects(profile.uid, setProjects);
    return () => unsubscribe();
  }, [profile]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim() || !profile) return;
    
    await projectService.createProject(projectName, projectDesc, profile.uid);
    setProjectName('');
    setProjectDesc('');
    setIsModalOpen(false);
  };

  const handleDeleteProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this project?')) {
      await projectService.deleteProject(id);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">Active Projects</h1>
          <p className="text-text-muted">High-level view of your collaborative workspaces.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
        >
          <Plus size={18} />
          New Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {projects.map((project) => (
            <motion.div
              layout
              key={project.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ y: -4, borderColor: '#4F46E5' }}
              onClick={() => navigate(`/projects/${project.id}`)}
              className="bg-card-bg p-6 rounded-xl border border-border-dark shadow-lg transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-black text-xl">
                  {project.name.charAt(0)}
                </div>
                {project.adminId === profile?.uid && (
                  <button
                    onClick={(e) => handleDeleteProject(project.id, e)}
                    className="p-2 text-[#444655] hover:text-rose-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              <h3 className="text-lg font-bold text-white mb-2 truncate group-hover:text-indigo-400 transition-colors">{project.name}</h3>
              <p className="text-text-muted text-sm line-clamp-2 h-10 mb-6">{project.description || 'No project description available.'}</p>
              
              <div className="pt-4 border-t border-border-dark flex items-center justify-between">
                <div className="flex items-center gap-2 text-text-muted text-[11px] font-bold uppercase tracking-widest">
                  <UserPlus size={14} />
                  {project.memberIds.length} Members
                </div>
                <div className="w-8 h-8 rounded-lg bg-border-dark flex items-center justify-center text-text-muted group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <ArrowRight size={16} />
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {projects.length === 0 && (
          <div className="col-span-full py-20 bg-card-bg rounded-xl border border-dashed border-border-dark flex flex-col items-center justify-center text-center">
            <FolderKanban className="text-border-dark mb-4" size={48} />
            <h3 className="text-lg font-bold text-white">Initiate a workspace</h3>
            <p className="text-text-muted text-sm max-w-xs mt-1">Start by creating a workspace for your team tasks.</p>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 backdrop-blur-md bg-black/60">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card-bg w-full max-w-lg rounded-2xl p-8 shadow-2xl border border-border-dark"
          >
            <h2 className="text-xl font-bold mb-6 text-white">Create New Workspace</h2>
            <form onSubmit={handleCreateProject} className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted mb-2">Workspace Name</label>
                <input
                  autoFocus
                  required
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-[#0D0F14] border border-border-dark text-white focus:outline-none focus:border-indigo-500 transition-all font-medium"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted mb-2">Description</label>
                <textarea
                  value={projectDesc}
                  onChange={(e) => setProjectDesc(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-[#0D0F14] border border-border-dark text-white focus:outline-none focus:border-indigo-500 transition-all font-medium h-24 resize-none"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 rounded-lg font-bold text-text-muted hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-lg font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-all"
                >
                  Confirm
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
