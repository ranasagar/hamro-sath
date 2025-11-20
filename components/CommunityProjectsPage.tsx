import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lightbulb,
  Vote,
  TrendingUp,
  MapPin,
  Calendar,
  Users,
  Target,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  X,
  Send,
  Filter,
  ArrowUpDown,
  Heart,
  MessageSquare,
  Trophy,
  Sparkles,
  DollarSign,
  Tag,
} from 'lucide-react';
import { useCommunityProjects } from '../hooks/useCivicHub';

interface Project {
  _id: string;
  title: string;
  description: string;
  proposedBy: {
    _id: string;
    name: string;
  };
  ward?: number;
  status: 'proposed' | 'approved' | 'in_progress' | 'completed' | 'rejected';
  votes: number;
  hasVoted?: boolean;
  budget?: number;
  targetDate?: string;
  progress?: number;
  participants?: number;
  category?: string;
  karmaReward?: number;
  createdAt: string;
  comments?: number;
}

const CommunityProjectsPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [wardFilter, setWardFilter] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'votes' | 'budget'>('newest');
  const [showProposeModal, setShowProposeModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const { projects, loading, error, proposeProject, voteOnProject, refreshProjects } =
    useCommunityProjects(statusFilter === 'all' ? undefined : statusFilter, wardFilter);

  // Sort projects
  const sortedProjects = React.useMemo(() => {
    if (!projects) return [];
    const sorted = [...projects];
    
    switch (sortBy) {
      case 'votes':
        return sorted.sort((a, b) => b.votes - a.votes);
      case 'budget':
        return sorted.sort((a, b) => (b.budget || 0) - (a.budget || 0));
      case 'newest':
      default:
        return sorted.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
  }, [projects, sortBy]);

  const handleVote = async (projectId: string) => {
    await voteOnProject(projectId);
    await refreshProjects();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'proposed':
        return 'bg-blue-500';
      case 'approved':
        return 'bg-green-500';
      case 'in_progress':
        return 'bg-yellow-500';
      case 'completed':
        return 'bg-emerald-500';
      case 'rejected':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'proposed':
        return <Lightbulb className="w-4 h-4" />;
      case 'approved':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'in_progress':
        return <Clock className="w-4 h-4" />;
      case 'completed':
        return <Trophy className="w-4 h-4" />;
      case 'rejected':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Lightbulb className="w-4 h-4" />;
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Failed to Load Projects</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={refreshProjects}
              className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl">
                  <Lightbulb className="w-8 h-8 text-white" />
                </div>
                Community Projects
              </h1>
              <p className="text-gray-600 mt-2 ml-1">
                Propose, vote, and collaborate on projects to improve your community
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowProposeModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow"
            >
              <Plus className="w-5 h-5" />
              Propose Project
            </motion.button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-4 shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Lightbulb className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Projects</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {projects?.length || 0}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-4 shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {projects?.filter(p => p.status === 'in_progress').length || 0}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl p-4 shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Trophy className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {projects?.filter(p => p.status === 'completed').length || 0}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl p-4 shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Vote className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Votes</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {projects?.reduce((sum, p) => sum + p.votes, 0) || 0}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Filters and Sort */}
          <div className="bg-white rounded-xl p-4 shadow-md">
            <div className="flex flex-wrap gap-4">
              {/* Status Filter */}
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Status
                </label>
                <div className="flex flex-wrap gap-2">
                  {['all', 'proposed', 'approved', 'in_progress', 'completed'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                        statusFilter === status
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {status === 'all' ? 'All' : status.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4" />
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="newest">Newest First</option>
                  <option value="votes">Most Voted</option>
                  <option value="budget">Highest Budget</option>
                </select>
              </div>

              {/* Ward Filter */}
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Ward
                </label>
                <select
                  value={wardFilter || ''}
                  onChange={(e) => setWardFilter(e.target.value ? Number(e.target.value) : null)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Wards</option>
                  {Array.from({ length: 32 }, (_, i) => i + 1).map((ward) => (
                    <option key={ward} value={ward}>
                      Ward {ward}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-md animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-4 w-2/3"></div>
                <div className="flex gap-2">
                  <div className="h-8 bg-gray-200 rounded flex-1"></div>
                  <div className="h-8 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        ) : sortedProjects.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-md">
            <Lightbulb className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Projects Found</h3>
            <p className="text-gray-600 mb-6">
              {statusFilter !== 'all' || wardFilter
                ? 'Try adjusting your filters'
                : 'Be the first to propose a community project!'}
            </p>
            <button
              onClick={() => setShowProposeModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-shadow"
            >
              Propose Project
            </button>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {sortedProjects.map((project, index) => (
                <ProjectCard
                  key={project._id}
                  project={project}
                  index={index}
                  onVote={handleVote}
                  onViewDetails={setSelectedProject}
                  getStatusColor={getStatusColor}
                  getStatusIcon={getStatusIcon}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Propose Project Modal */}
      <ProposeProjectModal
        isOpen={showProposeModal}
        onClose={() => setShowProposeModal(false)}
        onSubmit={proposeProject}
      />

      {/* Project Detail Modal */}
      <ProjectDetailModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
        onVote={handleVote}
        getStatusColor={getStatusColor}
        getStatusIcon={getStatusIcon}
      />
    </div>
  );
};

// Project Card Component
const ProjectCard: React.FC<{
  project: Project;
  index: number;
  onVote: (id: string) => void;
  onViewDetails: (project: Project) => void;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
}> = ({ project, index, onVote, onViewDetails, getStatusColor, getStatusIcon }) => {
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async () => {
    if (project.hasVoted) return;
    setIsVoting(true);
    await onVote(project._id);
    setIsVoting(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -5, shadow: '0 20px 40px rgba(0,0,0,0.1)' }}
      className="bg-white rounded-xl p-6 shadow-md cursor-pointer group"
      onClick={() => onViewDetails(project)}
    >
      {/* Status Badge */}
      <div className="flex items-center justify-between mb-4">
        <span
          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-white text-xs font-semibold ${getStatusColor(
            project.status
          )}`}
        >
          {getStatusIcon(project.status)}
          {project.status.replace('_', ' ')}
        </span>
        {project.karmaReward && (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-semibold">
            <Sparkles className="w-3 h-3" />
            +{project.karmaReward} Karma
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
        {project.title}
      </h3>

      {/* Description */}
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{project.description}</p>

      {/* Metadata */}
      <div className="flex flex-wrap gap-2 mb-4 text-xs text-gray-500">
        {project.ward && (
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            Ward {project.ward}
          </span>
        )}
        {project.category && (
          <span className="flex items-center gap-1">
            <Tag className="w-3 h-3" />
            {project.category}
          </span>
        )}
        {project.budget && (
          <span className="flex items-center gap-1">
            <DollarSign className="w-3 h-3" />
            NPR {project.budget.toLocaleString()}
          </span>
        )}
        {project.participants && (
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {project.participants} joined
          </span>
        )}
      </div>

      {/* Progress Bar (for in_progress projects) */}
      {project.status === 'in_progress' && project.progress !== undefined && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Progress</span>
            <span className="font-semibold">{project.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${project.progress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-yellow-400 to-orange-500"
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <Vote className="w-4 h-4" />
            {project.votes}
          </span>
          {project.comments !== undefined && (
            <span className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              {project.comments}
            </span>
          )}
        </div>

        {project.status === 'proposed' && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              handleVote();
            }}
            disabled={project.hasVoted || isVoting}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
              project.hasVoted
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg'
            }`}
          >
            {isVoting ? (
              'Voting...'
            ) : project.hasVoted ? (
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                Voted
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                Vote
              </span>
            )}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

// Propose Project Modal
const ProposeProjectModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    ward: '',
    category: '',
    budget: '',
    targetDate: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        ward: formData.ward ? Number(formData.ward) : undefined,
        budget: formData.budget ? Number(formData.budget) : undefined,
      });
      setFormData({
        title: '',
        description: '',
        ward: '',
        category: '',
        budget: '',
        targetDate: '',
      });
      onClose();
    } catch (error) {
      console.error('Failed to propose project:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Lightbulb className="w-7 h-7 text-blue-600" />
            Propose New Project
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Community Park Renovation"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Describe your project idea in detail..."
            />
          </div>

          {/* Ward and Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ward</label>
              <select
                value={formData.ward}
                onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Ward</option>
                {Array.from({ length: 32 }, (_, i) => i + 1).map((ward) => (
                  <option key={ward} value={ward}>
                    Ward {ward}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Category</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="Environment">Environment</option>
                <option value="Education">Education</option>
                <option value="Health">Health</option>
                <option value="Social">Social</option>
                <option value="Technology">Technology</option>
              </select>
            </div>
          </div>

          {/* Budget and Target Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget (NPR)
              </label>
              <input
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 500000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Date
              </label>
              <input
                type="date"
                value={formData.targetDate}
                onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800 flex items-start gap-2">
              <Sparkles className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>
                Proposing projects earns you karma! Well-supported projects get approved faster
                and can earn bonus karma rewards.
              </span>
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                'Submitting...'
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Submit Proposal
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// Project Detail Modal
const ProjectDetailModal: React.FC<{
  project: Project | null;
  onClose: () => void;
  onVote: (id: string) => void;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
}> = ({ project, onClose, onVote, getStatusColor, getStatusIcon }) => {
  const [isVoting, setIsVoting] = useState(false);

  if (!project) return null;

  const handleVote = async () => {
    if (project.hasVoted) return;
    setIsVoting(true);
    await onVote(project._id);
    setIsVoting(false);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-white text-sm font-semibold ${getStatusColor(
                project.status
              )}`}
            >
              {getStatusIcon(project.status)}
              {project.status.replace('_', ' ')}
            </span>
            {project.karmaReward && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm font-semibold">
                <Sparkles className="w-4 h-4" />
                +{project.karmaReward} Karma
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Title */}
          <h2 className="text-3xl font-bold text-gray-800">{project.title}</h2>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {project.ward && (
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-5 h-5" />
                <span>Ward {project.ward}</span>
              </div>
            )}
            {project.category && (
              <div className="flex items-center gap-2 text-gray-600">
                <Tag className="w-5 h-5" />
                <span>{project.category}</span>
              </div>
            )}
            {project.budget && (
              <div className="flex items-center gap-2 text-gray-600">
                <DollarSign className="w-5 h-5" />
                <span>NPR {project.budget.toLocaleString()}</span>
              </div>
            )}
            {project.targetDate && (
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-5 h-5" />
                <span>{new Date(project.targetDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {/* Progress (if in_progress) */}
          {project.status === 'in_progress' && project.progress !== undefined && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex justify-between text-sm text-gray-700 mb-2">
                <span className="font-semibold">Project Progress</span>
                <span className="font-bold text-yellow-600">{project.progress}%</span>
              </div>
              <div className="w-full bg-white rounded-full h-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${project.progress}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-yellow-400 to-orange-500"
                />
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
            <p className="text-gray-600 leading-relaxed">{project.description}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <Vote className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-800">{project.votes}</p>
              <p className="text-sm text-gray-600">Votes</p>
            </div>
            {project.participants !== undefined && (
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-800">{project.participants}</p>
                <p className="text-sm text-gray-600">Participants</p>
              </div>
            )}
            {project.comments !== undefined && (
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <MessageSquare className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-800">{project.comments}</p>
                <p className="text-sm text-gray-600">Comments</p>
              </div>
            )}
          </div>

          {/* Proposed By */}
          <div className="border-t border-gray-200 pt-4">
            <p className="text-sm text-gray-600">
              Proposed by <span className="font-semibold text-gray-800">{project.proposedBy.name}</span>
              {' • '}
              {new Date(project.createdAt).toLocaleDateString()}
            </p>
          </div>

          {/* Action Button */}
          {project.status === 'proposed' && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleVote}
              disabled={project.hasVoted || isVoting}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                project.hasVoted
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg'
              }`}
            >
              {isVoting ? (
                'Voting...'
              ) : project.hasVoted ? (
                <span className="flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-6 h-6" />
                  You've Voted for This Project
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Heart className="w-6 h-6" />
                  Vote for This Project
                </span>
              )}
            </motion.button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default CommunityProjectsPage;
