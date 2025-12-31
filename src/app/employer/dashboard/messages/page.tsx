'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMessaging } from '@/contexts/MessagingContext';

function formatTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function EmployerDashboardMessagesPage() {
  const router = useRouter();
  const { getUserConversations, setCurrentUser } = useMessaging();

  // Set current user as employer
  useEffect(() => {
    setCurrentUser('employer-1', 'employer');
  }, [setCurrentUser]);

  const conversations = getUserConversations();

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Messages</h1>
          <p className="text-slate-500 mt-1">Communicate with applicants</p>
        </div>
        <button
          onClick={() => router.push('/employer/messages')}
          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Open Full Chat
        </button>
      </div>

      {conversations.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <h3 className="font-semibold text-slate-900 mb-2">No messages yet</h3>
          <p className="text-sm text-slate-500">Messages from applicants will appear here</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-200">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => router.push('/employer/messages')}
              className="w-full p-4 hover:bg-slate-50 cursor-pointer transition-colors flex items-center gap-4 text-left"
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-100 to-slate-100 flex items-center justify-center text-primary-700 font-medium">
                  {conv.jobseekerAvatar}
                </div>
                {conv.unreadByEmployer > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {conv.unreadByEmployer}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className={`font-medium ${conv.unreadByEmployer > 0 ? 'text-slate-900' : 'text-slate-700'}`}>
                    {conv.jobseekerName}
                  </h3>
                  <span className="text-xs text-slate-400">{formatTime(conv.lastMessageTime)}</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{conv.jobTitle}</p>
                <p className={`text-sm truncate mt-1 ${conv.unreadByEmployer > 0 ? 'text-slate-700 font-medium' : 'text-slate-500'}`}>
                  {conv.lastMessage || 'No messages yet'}
                </p>
              </div>
              <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
