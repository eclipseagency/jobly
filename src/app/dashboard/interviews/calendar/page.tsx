'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Building2,
  Video,
  Phone,
  User,
  Check,
  X,
  Loader2,
} from 'lucide-react';

interface Interview {
  id: string;
  type: string;
  message: string | null;
  proposedDates: string[] | null;
  status: string;
  respondedAt: string | null;
  responseMessage: string | null;
  expiresAt: string | null;
  createdAt: string;
  employer: {
    id: string;
    name: string | null;
    avatar: string | null;
    tenant: {
      name: string;
      logo: string | null;
    } | null;
  };
  job: {
    id: string;
    title: string;
    location: string | null;
  } | null;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  interviews: Interview[];
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function InterviewCalendarPage() {
  const router = useRouter();
  const { user, isLoggedIn } = useAuth();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/auth/employee/login');
    }
  }, [isLoggedIn, router]);

  // Fetch interviews
  useEffect(() => {
    async function fetchInterviews() {
      if (!user?.id) return;
      try {
        const response = await fetch('/api/employee/interviews', {
          headers: { 'x-user-id': user.id },
        });
        if (response.ok) {
          const data = await response.json();
          setInterviews(data.interviews || []);
        }
      } catch (err) {
        console.error('Error fetching interviews:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchInterviews();
  }, [user?.id]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDayOfMonth.getDay();

    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Previous month days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        interviews: getInterviewsForDate(date),
      });
    }

    // Current month days
    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      const date = new Date(year, month, day);
      const dateOnly = new Date(date);
      dateOnly.setHours(0, 0, 0, 0);

      days.push({
        date,
        isCurrentMonth: true,
        isToday: dateOnly.getTime() === today.getTime(),
        interviews: getInterviewsForDate(date),
      });
    }

    // Next month days to fill the grid
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        interviews: getInterviewsForDate(date),
      });
    }

    return days;
  }, [currentDate, interviews]);

  // Get interviews for a specific date
  function getInterviewsForDate(date: Date): Interview[] {
    const dateStr = date.toISOString().split('T')[0];

    return interviews.filter(interview => {
      // Check proposed dates
      if (interview.proposedDates) {
        return interview.proposedDates.some(pd => {
          const proposedDate = new Date(pd);
          return proposedDate.toISOString().split('T')[0] === dateStr;
        });
      }
      // Check created date as fallback
      const createdDate = new Date(interview.createdAt);
      return createdDate.toISOString().split('T')[0] === dateStr;
    });
  }

  // Navigation
  const goToPreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Format time
  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-700';
      case 'declined':
        return 'bg-red-100 text-red-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'expired':
        return 'bg-slate-100 text-slate-500';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  // Get selected date interviews
  const selectedDateInterviews = selectedDate ? getInterviewsForDate(selectedDate) : [];

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Interview Calendar</h1>
            <p className="text-slate-600 mt-1">View and manage your scheduled interviews</p>
          </div>
          <Link
            href="/dashboard/interviews"
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            List View
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm">
            {/* Calendar Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold text-slate-900">
                  {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <button
                  onClick={goToToday}
                  className="px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  Today
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={goToPreviousMonth}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-slate-600" />
                </button>
                <button
                  onClick={goToNextMonth}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-slate-600" />
                </button>
              </div>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 border-b border-slate-200">
              {DAYS.map(day => (
                <div key={day} className="py-3 text-center text-sm font-medium text-slate-500">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            {loading ? (
              <div className="p-12 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="grid grid-cols-7">
                {calendarDays.map((day, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedDate(day.date)}
                    className={`min-h-[100px] p-2 border-b border-r border-slate-100 text-left transition-colors hover:bg-slate-50 ${
                      !day.isCurrentMonth ? 'bg-slate-50/50' : ''
                    } ${day.isToday ? 'bg-blue-50' : ''} ${
                      selectedDate?.toDateString() === day.date.toDateString()
                        ? 'ring-2 ring-blue-500 ring-inset'
                        : ''
                    }`}
                  >
                    <span
                      className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm ${
                        day.isToday
                          ? 'bg-blue-600 text-white font-semibold'
                          : day.isCurrentMonth
                          ? 'text-slate-900'
                          : 'text-slate-400'
                      }`}
                    >
                      {day.date.getDate()}
                    </span>

                    {/* Interview indicators */}
                    {day.interviews.length > 0 && (
                      <div className="mt-1 space-y-1">
                        {day.interviews.slice(0, 2).map(interview => (
                          <div
                            key={interview.id}
                            className={`text-xs px-1.5 py-0.5 rounded truncate ${getStatusColor(interview.status)}`}
                          >
                            {interview.job?.title || 'Interview'}
                          </div>
                        ))}
                        {day.interviews.length > 2 && (
                          <div className="text-xs text-slate-500 px-1.5">
                            +{day.interviews.length - 2} more
                          </div>
                        )}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selected Date Panel */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="p-4 border-b border-slate-200">
              <h3 className="font-semibold text-slate-900">
                {selectedDate ? formatDate(selectedDate) : 'Select a date'}
              </h3>
            </div>

            <div className="p-4">
              {!selectedDate ? (
                <p className="text-sm text-slate-500 text-center py-8">
                  Click on a date to view interviews
                </p>
              ) : selectedDateInterviews.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">
                  No interviews scheduled for this date
                </p>
              ) : (
                <div className="space-y-4">
                  {selectedDateInterviews.map(interview => (
                    <div
                      key={interview.id}
                      onClick={() => setSelectedInterview(interview)}
                      className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        {interview.employer.tenant?.logo ? (
                          <img
                            src={interview.employer.tenant.logo}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-blue-600" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-slate-900 truncate">
                            {interview.job?.title || 'Interview'}
                          </h4>
                          <p className="text-sm text-slate-500">
                            {interview.employer.tenant?.name || interview.employer.name}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`px-2 py-0.5 text-xs font-medium rounded ${getStatusColor(interview.status)}`}>
                              {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
                            </span>
                            {interview.proposedDates && interview.proposedDates.length > 0 && (
                              <span className="text-xs text-slate-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatTime(interview.proposedDates[0])}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Interview Detail Modal */}
        {selectedInterview && (
          <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-lg w-full">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-900">Interview Details</h2>
                  <button
                    onClick={() => setSelectedInterview(null)}
                    className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {/* Company Info */}
                <div className="flex items-center gap-4">
                  {selectedInterview.employer.tenant?.logo ? (
                    <img
                      src={selectedInterview.employer.tenant.logo}
                      alt=""
                      className="w-14 h-14 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Building2 className="w-7 h-7 text-blue-600" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {selectedInterview.job?.title || 'Interview'}
                    </h3>
                    <p className="text-slate-600">
                      {selectedInterview.employer.tenant?.name || selectedInterview.employer.name}
                    </p>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">Status:</span>
                  <span className={`px-2 py-0.5 text-sm font-medium rounded ${getStatusColor(selectedInterview.status)}`}>
                    {selectedInterview.status.charAt(0).toUpperCase() + selectedInterview.status.slice(1)}
                  </span>
                </div>

                {/* Proposed Times */}
                {selectedInterview.proposedDates && selectedInterview.proposedDates.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-700 mb-2">Proposed Times</h4>
                    <div className="space-y-2">
                      {selectedInterview.proposedDates.map((date, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                          <Calendar className="w-4 h-4" />
                          {new Date(date).toLocaleString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true,
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Message */}
                {selectedInterview.message && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-700 mb-2">Message</h4>
                    <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                      {selectedInterview.message}
                    </p>
                  </div>
                )}

                {/* Location */}
                {selectedInterview.job?.location && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <MapPin className="w-4 h-4" />
                    {selectedInterview.job.location}
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
                <button
                  onClick={() => setSelectedInterview(null)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Close
                </button>
                {selectedInterview.status === 'pending' && (
                  <Link
                    href="/dashboard/interviews"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                  >
                    Respond
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
