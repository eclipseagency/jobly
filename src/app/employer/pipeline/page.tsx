'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Loader2,
  GripVertical,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  ChevronDown,
  Search,
  Filter,
  MoreVertical,
  ExternalLink,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Star,
  Eye,
} from 'lucide-react';

interface Applicant {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatar: string | null;
  headline: string | null;
  skills: string[];
  jobId: string;
  jobTitle: string;
  company: string;
  status: string;
  appliedAt: string;
  updatedAt: string;
}

interface Stage {
  id: string;
  label: string;
  color: string;
}

interface Job {
  id: string;
  title: string;
  applicantCount: number;
}

const stageColors: Record<string, { bg: string; border: string; text: string; header: string }> = {
  blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', header: 'bg-blue-100' },
  yellow: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', header: 'bg-yellow-100' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', header: 'bg-purple-100' },
  cyan: { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-700', header: 'bg-cyan-100' },
  green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', header: 'bg-green-100' },
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', header: 'bg-emerald-100' },
  red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', header: 'bg-red-100' },
};

export default function PipelinePage() {
  const router = useRouter();
  const { user, isLoggedIn } = useAuth();
  const [pipeline, setPipeline] = useState<Record<string, Applicant[]>>({});
  const [stages, setStages] = useState<Stage[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [draggedItem, setDraggedItem] = useState<Applicant | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/auth/employer/login');
    }
  }, [isLoggedIn, router]);

  // Fetch pipeline data
  useEffect(() => {
    async function fetchPipeline() {
      if (!user?.id || !user?.tenantId) return;
      try {
        const url = selectedJob === 'all'
          ? '/api/employer/applicants/pipeline'
          : `/api/employer/applicants/pipeline?jobId=${selectedJob}`;

        const response = await fetch(url, {
          headers: {
            'x-user-id': user.id,
            'x-tenant-id': user.tenantId,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setPipeline(data.pipeline);
          setStages(data.stages);
          setJobs(data.jobs);
        }
      } catch (err) {
        console.error('Error fetching pipeline:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchPipeline();
  }, [user?.id, user?.tenantId, selectedJob]);

  const handleDragStart = (e: React.DragEvent, applicant: Applicant) => {
    setDraggedItem(applicant);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', applicant.id);
  };

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverStage(stageId);
  };

  const handleDragLeave = () => {
    setDragOverStage(null);
  };

  const handleDrop = async (e: React.DragEvent, newStageId: string) => {
    e.preventDefault();
    setDragOverStage(null);

    if (!draggedItem || !user?.id || !user?.tenantId) return;

    // Find current stage
    const currentStage = Object.keys(pipeline).find((stageId) =>
      pipeline[stageId].some((a) => a.id === draggedItem.id)
    );

    if (currentStage === newStageId) {
      setDraggedItem(null);
      return;
    }

    // Optimistic update
    const newPipeline = { ...pipeline };
    if (currentStage) {
      newPipeline[currentStage] = newPipeline[currentStage].filter(
        (a) => a.id !== draggedItem.id
      );
    }
    newPipeline[newStageId] = [
      { ...draggedItem, status: newStageId },
      ...newPipeline[newStageId],
    ];
    setPipeline(newPipeline);

    setUpdating(draggedItem.id);
    setDraggedItem(null);

    try {
      const response = await fetch('/api/employer/applicants/pipeline', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
          'x-tenant-id': user.tenantId,
        },
        body: JSON.stringify({
          applicationId: draggedItem.id,
          newStatus: newStageId,
        }),
      });

      if (!response.ok) {
        // Revert on error
        setPipeline(pipeline);
      }
    } catch (err) {
      console.error('Error updating status:', err);
      setPipeline(pipeline);
    } finally {
      setUpdating(null);
    }
  };

  const handleQuickAction = async (applicantId: string, newStatus: string) => {
    if (!user?.id || !user?.tenantId) return;

    // Find applicant and current stage
    let applicant: Applicant | undefined;
    let currentStage: string | undefined;

    Object.keys(pipeline).forEach((stageId) => {
      const found = pipeline[stageId].find((a) => a.id === applicantId);
      if (found) {
        applicant = found;
        currentStage = stageId;
      }
    });

    if (!applicant || !currentStage || currentStage === newStatus) return;

    // Optimistic update
    const newPipeline = { ...pipeline };
    newPipeline[currentStage] = newPipeline[currentStage].filter((a) => a.id !== applicantId);
    newPipeline[newStatus] = [{ ...applicant, status: newStatus }, ...newPipeline[newStatus]];
    setPipeline(newPipeline);

    setUpdating(applicantId);

    try {
      const response = await fetch('/api/employer/applicants/pipeline', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
          'x-tenant-id': user.tenantId,
        },
        body: JSON.stringify({
          applicationId: applicantId,
          newStatus,
        }),
      });

      if (!response.ok) {
        setPipeline(pipeline);
      }
    } catch (err) {
      console.error('Error updating status:', err);
      setPipeline(pipeline);
    } finally {
      setUpdating(null);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Filter applicants by search
  const filterApplicants = (applicants: Applicant[]) => {
    if (!searchQuery) return applicants;
    const query = searchQuery.toLowerCase();
    return applicants.filter(
      (a) =>
        a.name.toLowerCase().includes(query) ||
        a.email.toLowerCase().includes(query) ||
        a.jobTitle.toLowerCase().includes(query)
    );
  };

  if (!isLoggedIn) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Hiring Pipeline</h1>
              <p className="text-slate-600 mt-1">
                Drag and drop applicants between stages
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search applicants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div className="relative">
              <select
                value={selectedJob}
                onChange={(e) => setSelectedJob(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white cursor-pointer"
              >
                <option value="all">All Jobs ({jobs.reduce((sum, j) => sum + j.applicantCount, 0)})</option>
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title} ({job.applicantCount})
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Pipeline Board */}
      <div className="p-4 lg:p-8 overflow-x-auto">
        <div className="flex gap-4 min-w-max">
          {stages.map((stage) => {
            const colors = stageColors[stage.color] || stageColors.blue;
            const applicants = filterApplicants(pipeline[stage.id] || []);
            const isDragOver = dragOverStage === stage.id;

            return (
              <div
                key={stage.id}
                className={`w-80 flex-shrink-0 rounded-xl border ${colors.border} ${
                  isDragOver ? 'ring-2 ring-blue-500' : ''
                }`}
                onDragOver={(e) => handleDragOver(e, stage.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, stage.id)}
              >
                {/* Stage Header */}
                <div className={`px-4 py-3 ${colors.header} rounded-t-xl border-b ${colors.border}`}>
                  <div className="flex items-center justify-between">
                    <h3 className={`font-semibold ${colors.text}`}>{stage.label}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-sm font-medium ${colors.bg} ${colors.text}`}>
                      {applicants.length}
                    </span>
                  </div>
                </div>

                {/* Stage Content */}
                <div className={`p-2 ${colors.bg} rounded-b-xl min-h-[400px] space-y-2`}>
                  {applicants.map((applicant) => (
                    <div
                      key={applicant.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, applicant)}
                      className={`bg-white rounded-lg border border-slate-200 p-3 cursor-grab active:cursor-grabbing shadow-sm hover:shadow transition-shadow ${
                        updating === applicant.id ? 'opacity-50' : ''
                      } ${draggedItem?.id === applicant.id ? 'opacity-50' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          <GripVertical className="w-4 h-4 text-slate-300" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {applicant.avatar ? (
                              <img
                                src={applicant.avatar}
                                alt={applicant.name}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                                {getInitials(applicant.name)}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-medium text-slate-900 text-sm truncate">
                                {applicant.name}
                              </p>
                              <p className="text-xs text-slate-500 truncate">
                                {applicant.headline || applicant.email}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                            <Briefcase className="w-3 h-3" />
                            <span className="truncate">{applicant.jobTitle}</span>
                          </div>

                          {applicant.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {applicant.skills.slice(0, 3).map((skill, idx) => (
                                <span
                                  key={idx}
                                  className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-xs rounded"
                                >
                                  {skill.split(':')[0]}
                                </span>
                              ))}
                              {applicant.skills.length > 3 && (
                                <span className="text-xs text-slate-400">
                                  +{applicant.skills.length - 3}
                                </span>
                              )}
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                            <span className="text-xs text-slate-400">
                              {formatDate(applicant.appliedAt)}
                            </span>

                            <div className="flex items-center gap-1">
                              {stage.id !== 'shortlisted' && stage.id !== 'interview' && stage.id !== 'offered' && stage.id !== 'hired' && (
                                <button
                                  onClick={() => handleQuickAction(applicant.id, 'shortlisted')}
                                  className="p-1 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded"
                                  title="Shortlist"
                                >
                                  <Star className="w-4 h-4" />
                                </button>
                              )}
                              {stage.id !== 'rejected' && (
                                <button
                                  onClick={() => handleQuickAction(applicant.id, 'rejected')}
                                  className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                                  title="Reject"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              )}
                              <Link
                                href={`/employer/applicants/${applicant.id}`}
                                className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                                title="View Profile"
                              >
                                <Eye className="w-4 h-4" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {applicants.length === 0 && (
                    <div className="text-center py-8 text-slate-400 text-sm">
                      No applicants
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
