'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
  Users,
  Plus,
  Shield,
  ShieldCheck,
  Eye,
  Edit2,
  Trash2,
  MoreVertical,
  Mail,
  Clock,
  CheckCircle2,
  XCircle,
  UserPlus,
  Crown,
  RefreshCw,
  Loader2,
  X,
  AlertCircle,
} from 'lucide-react';

interface TeamMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatar: string | null;
  role: string;
  isActive: boolean;
  joinedAt: string;
  lastActiveAt: string | null;
  isOwner: boolean;
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  expiresAt: string;
}

const roleLabels: Record<string, string> = {
  EMPLOYER_OWNER: 'Owner',
  EMPLOYER_ADMIN: 'Admin',
  EMPLOYER_RECRUITER: 'Recruiter',
  EMPLOYER_VIEWER: 'Viewer',
};

const roleColors: Record<string, { bg: string; text: string }> = {
  EMPLOYER_OWNER: { bg: 'bg-purple-100', text: 'text-purple-700' },
  EMPLOYER_ADMIN: { bg: 'bg-blue-100', text: 'text-blue-700' },
  EMPLOYER_RECRUITER: { bg: 'bg-green-100', text: 'text-green-700' },
  EMPLOYER_VIEWER: { bg: 'bg-slate-100', text: 'text-slate-700' },
};

const roleIcons: Record<string, React.ReactNode> = {
  EMPLOYER_OWNER: <Crown className="w-4 h-4" />,
  EMPLOYER_ADMIN: <ShieldCheck className="w-4 h-4" />,
  EMPLOYER_RECRUITER: <Shield className="w-4 h-4" />,
  EMPLOYER_VIEWER: <Eye className="w-4 h-4" />,
};

export default function TeamManagementPage() {
  const router = useRouter();
  const { user, isLoggedIn } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'EMPLOYER_RECRUITER',
  });

  const [editForm, setEditForm] = useState({
    role: 'EMPLOYER_RECRUITER',
  });

  // Check if current user is admin or owner
  const currentMember = members.find((m) => m.userId === user?.id);
  const canManageTeam = currentMember?.role === 'EMPLOYER_OWNER' || currentMember?.role === 'EMPLOYER_ADMIN';
  const isOwner = currentMember?.isOwner;

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/auth/employer/login');
    }
  }, [isLoggedIn, router]);

  // Fetch team data
  useEffect(() => {
    async function fetchTeam() {
      if (!user?.id || !user?.tenantId) return;
      try {
        const response = await fetch('/api/employer/team', {
          headers: {
            'x-user-id': user.id,
            'x-tenant-id': user.tenantId,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setMembers(data.members);
          setInvitations(data.invitations);
        }
      } catch (err) {
        console.error('Error fetching team:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchTeam();
  }, [user?.id, user?.tenantId]);

  const handleInvite = async () => {
    if (!user?.id || !user?.tenantId || !inviteForm.email) return;

    setSaving(true);
    try {
      const response = await fetch('/api/employer/team', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
          'x-tenant-id': user.tenantId,
        },
        body: JSON.stringify(inviteForm),
      });

      if (response.ok) {
        const data = await response.json();
        setInvitations((prev) => [data.invitation, ...prev]);
        setShowInviteModal(false);
        setInviteForm({ email: '', role: 'EMPLOYER_RECRUITER' });
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to send invitation');
      }
    } catch (err) {
      console.error('Error inviting:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateRole = async () => {
    if (!user?.id || !user?.tenantId || !selectedMember) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/employer/team/${selectedMember.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
          'x-tenant-id': user.tenantId,
        },
        body: JSON.stringify({ role: editForm.role }),
      });

      if (response.ok) {
        const data = await response.json();
        setMembers((prev) =>
          prev.map((m) => (m.id === selectedMember.id ? { ...m, role: data.member.role } : m))
        );
        setShowEditModal(false);
        setSelectedMember(null);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update role');
      }
    } catch (err) {
      console.error('Error updating role:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!user?.id || !user?.tenantId || !confirm('Remove this team member?')) return;

    try {
      const response = await fetch(`/api/employer/team/${memberId}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': user.id,
          'x-tenant-id': user.tenantId,
        },
      });

      if (response.ok) {
        setMembers((prev) => prev.filter((m) => m.id !== memberId));
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to remove member');
      }
    } catch (err) {
      console.error('Error removing member:', err);
    }
    setActiveDropdown(null);
  };

  const handleCancelInvitation = async (invitationId: string) => {
    if (!user?.id || !user?.tenantId) return;

    try {
      const response = await fetch(`/api/employer/team/invitations/${invitationId}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': user.id,
          'x-tenant-id': user.tenantId,
        },
      });

      if (response.ok) {
        setInvitations((prev) => prev.filter((i) => i.id !== invitationId));
      }
    } catch (err) {
      console.error('Error canceling invitation:', err);
    }
  };

  const handleResendInvitation = async (invitationId: string) => {
    if (!user?.id || !user?.tenantId) return;

    try {
      const response = await fetch(`/api/employer/team/invitations/${invitationId}`, {
        method: 'POST',
        headers: {
          'x-user-id': user.id,
          'x-tenant-id': user.tenantId,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setInvitations((prev) =>
          prev.map((i) => (i.id === invitationId ? data.invitation : i))
        );
        alert('Invitation resent successfully');
      }
    } catch (err) {
      console.error('Error resending invitation:', err);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
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
    <div className="min-h-screen bg-slate-50 p-4 lg:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Team Management</h1>
            <p className="text-slate-600 mt-1">
              Manage your team members and their permissions
            </p>
          </div>
          {canManageTeam && (
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              <UserPlus className="w-5 h-5" />
              Invite Member
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-500 text-sm">Total Members</span>
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{members.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-500 text-sm">Admins</span>
              <ShieldCheck className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {members.filter((m) => ['EMPLOYER_OWNER', 'EMPLOYER_ADMIN'].includes(m.role)).length}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-500 text-sm">Recruiters</span>
              <Shield className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {members.filter((m) => m.role === 'EMPLOYER_RECRUITER').length}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-500 text-sm">Pending Invites</span>
              <Mail className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{invitations.length}</p>
          </div>
        </div>

        {/* Pending Invitations */}
        {invitations.length > 0 && canManageTeam && (
          <div className="bg-white rounded-xl border border-slate-200 mb-6">
            <div className="p-4 border-b border-slate-200">
              <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-500" />
                Pending Invitations
              </h2>
            </div>
            <div className="divide-y divide-slate-100">
              {invitations.map((invitation) => {
                const roleStyle = roleColors[invitation.role] || roleColors.EMPLOYER_VIEWER;
                const isExpired = new Date(invitation.expiresAt) < new Date();

                return (
                  <div key={invitation.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                        <Mail className="w-5 h-5 text-slate-400" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{invitation.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`px-2 py-0.5 text-xs font-medium rounded ${roleStyle.bg} ${roleStyle.text}`}
                          >
                            {roleLabels[invitation.role]}
                          </span>
                          <span className="text-xs text-slate-500">
                            Sent {formatDate(invitation.createdAt)}
                          </span>
                          {isExpired && (
                            <span className="text-xs text-red-600 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" /> Expired
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleResendInvitation(invitation.id)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Resend invitation"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleCancelInvitation(invitation.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Cancel invitation"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Team Members */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="p-4 border-b border-slate-200">
            <h2 className="font-semibold text-slate-900">Team Members</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {members.map((member) => {
              const roleStyle = roleColors[member.role] || roleColors.EMPLOYER_VIEWER;
              const canEdit = canManageTeam && !member.isOwner && member.userId !== user?.id;
              const canEditAdmin = isOwner && member.role === 'EMPLOYER_ADMIN';

              return (
                <div key={member.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {member.avatar ? (
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                        {getInitials(member.name)}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-slate-900">{member.name}</p>
                        {member.isOwner && (
                          <span title="Owner">
                            <Crown className="w-4 h-4 text-yellow-500" />
                          </span>
                        )}
                        {member.userId === user?.id && (
                          <span className="text-xs text-slate-500">(You)</span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500">{member.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className={`${roleStyle.text}`}>{roleIcons[member.role]}</span>
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded ${roleStyle.bg} ${roleStyle.text}`}
                      >
                        {roleLabels[member.role]}
                      </span>
                    </div>

                    {(canEdit || canEditAdmin) && (
                      <div className="relative">
                        <button
                          onClick={() =>
                            setActiveDropdown(activeDropdown === member.id ? null : member.id)
                          }
                          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {activeDropdown === member.id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setActiveDropdown(null)}
                            />
                            <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-20">
                              <button
                                onClick={() => {
                                  setSelectedMember(member);
                                  setEditForm({ role: member.role });
                                  setShowEditModal(true);
                                  setActiveDropdown(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                              >
                                <Edit2 className="w-4 h-4" />
                                Change Role
                              </button>
                              <button
                                onClick={() => handleRemoveMember(member.id)}
                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                Remove from Team
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Role Permissions Info */}
        <div className="mt-8 bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Role Permissions</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-purple-900">Owner</span>
              </div>
              <p className="text-sm text-purple-700">
                Full access to all features. Can manage billing, delete company, and transfer ownership.
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-900">Admin</span>
              </div>
              <p className="text-sm text-blue-700">
                Manage team, jobs, and applicants. Can invite and remove members (except other admins).
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-900">Recruiter</span>
              </div>
              <p className="text-sm text-green-700">
                Create and manage job postings. Review and process applications. Message candidates.
              </p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-5 h-5 text-slate-600" />
                <span className="font-medium text-slate-900">Viewer</span>
              </div>
              <p className="text-sm text-slate-700">
                Read-only access to jobs and applicants. Cannot create, edit, or take actions.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Invite Team Member</h2>
              <button
                onClick={() => setShowInviteModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  placeholder="colleague@company.com"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Role *
                </label>
                <select
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {isOwner && <option value="EMPLOYER_ADMIN">Admin</option>}
                  <option value="EMPLOYER_RECRUITER">Recruiter</option>
                  <option value="EMPLOYER_VIEWER">Viewer</option>
                </select>
              </div>
            </div>

            <div className="border-t border-slate-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setShowInviteModal(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleInvite}
                disabled={saving || !inviteForm.email}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Send Invitation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {showEditModal && selectedMember && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Change Role</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedMember(null);
                }}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="p-6">
              <p className="text-slate-600 mb-4">
                Change role for <span className="font-medium">{selectedMember.name}</span>
              </p>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  New Role
                </label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ role: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {isOwner && <option value="EMPLOYER_ADMIN">Admin</option>}
                  <option value="EMPLOYER_RECRUITER">Recruiter</option>
                  <option value="EMPLOYER_VIEWER">Viewer</option>
                </select>
              </div>
            </div>

            <div className="border-t border-slate-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedMember(null);
                }}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateRole}
                disabled={saving || editForm.role === selectedMember.role}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Update Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
