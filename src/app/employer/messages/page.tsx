'use client';

import { useState, useEffect, useRef } from 'react';
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

function formatMessageTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export default function EmployerMessagesPage() {
  const { getUserConversations, getConversationMessages, sendMessage, markAsRead, setCurrentUser } = useMessaging();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [showChatList, setShowChatList] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showQuickActions, setShowQuickActions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Set current user as employer
  useEffect(() => {
    setCurrentUser('employer-1', 'employer');
  }, [setCurrentUser]);

  const conversations = getUserConversations();
  const filteredConversations = conversations.filter(conv =>
    conv.jobseekerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.jobTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);
  const conversationMessages = selectedConversationId ? getConversationMessages(selectedConversationId) : [];

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationMessages]);

  // Mark messages as read when selecting conversation
  useEffect(() => {
    if (selectedConversationId) {
      markAsRead(selectedConversationId);
    }
  }, [selectedConversationId, markAsRead]);

  // Select first conversation on load
  useEffect(() => {
    if (conversations.length > 0 && !selectedConversationId) {
      setSelectedConversationId(conversations[0].id);
    }
  }, [conversations, selectedConversationId]);

  const handleSendMessage = (text?: string) => {
    const messageText = text || newMessage;
    if (messageText.trim() && selectedConversationId) {
      sendMessage(selectedConversationId, messageText);
      setNewMessage('');
      setShowQuickActions(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickActions = [
    { label: 'Schedule Interview', message: 'We would like to schedule an interview with you. Are you available this week?' },
    { label: 'Request Documents', message: 'Could you please provide the following documents: updated resume, portfolio, and references?' },
    { label: 'Send Offer', message: 'Congratulations! We are pleased to offer you the position. Please find the offer details attached.' },
    { label: 'Follow Up', message: 'Hi! We wanted to follow up on your application status. Are you still interested in this position?' },
  ];

  return (
    <div className="h-[calc(100vh-4rem)] lg:h-screen flex">
      {/* Conversations List */}
      <div className={`${showChatList ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-80 lg:w-96 border-r border-slate-200 bg-white`}>
        <div className="p-4 border-b border-slate-100">
          <h1 className="text-xl font-bold text-slate-900 mb-4">Messages</h1>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search applicants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center">
              <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
              <p className="text-sm text-slate-500">No messages yet</p>
              <p className="text-xs text-slate-400 mt-1">Messages from applicants will appear here</p>
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => {
                  setSelectedConversationId(conv.id);
                  setShowChatList(false);
                }}
                className={`w-full p-4 flex items-start gap-3 hover:bg-slate-50 transition-colors text-left border-b border-slate-100 ${
                  selectedConversationId === conv.id ? 'bg-primary-50' : ''
                }`}
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-100 to-slate-100 flex items-center justify-center text-primary-600 font-medium">
                    {conv.jobseekerAvatar}
                  </div>
                  {conv.unreadByEmployer > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center">
                      {conv.unreadByEmployer}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-medium truncate ${conv.unreadByEmployer > 0 ? 'text-slate-900' : 'text-slate-700'}`}>
                      {conv.jobseekerName}
                    </span>
                    <span className="text-xs text-slate-400 flex-shrink-0 ml-2">{formatTime(conv.lastMessageTime)}</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-1">{conv.jobTitle}</p>
                  <p className={`text-sm truncate ${conv.unreadByEmployer > 0 ? 'text-slate-900 font-medium' : 'text-slate-500'}`}>
                    {conv.lastMessage || 'No messages yet'}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`${!showChatList ? 'flex' : 'hidden'} md:flex flex-1 flex-col bg-slate-50`}>
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-slate-200 px-4 lg:px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowChatList(true)}
                  className="md:hidden p-2 hover:bg-slate-100 rounded-lg"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-100 to-slate-100 flex items-center justify-center text-primary-600 font-medium">
                  {selectedConversation.jobseekerAvatar}
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900">{selectedConversation.jobseekerName}</h2>
                  <p className="text-sm text-slate-500">{selectedConversation.jobTitle}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                  Active
                </span>
                <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4">
              {conversationMessages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p className="text-sm text-slate-500">No messages yet</p>
                    <p className="text-xs text-slate-400 mt-1">Start a conversation with this applicant</p>
                  </div>
                </div>
              ) : (
                conversationMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderType === 'employer' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className="max-w-md">
                      <div
                        className={`px-4 py-3 rounded-2xl ${
                          message.senderType === 'employer'
                            ? 'bg-primary-600 text-white rounded-br-md'
                            : 'bg-white text-slate-900 rounded-bl-md border border-slate-200'
                        }`}
                      >
                        <p className="text-sm">{message.text}</p>
                      </div>
                      <p className={`text-xs text-slate-400 mt-1 ${message.senderType === 'employer' ? 'text-right' : ''}`}>
                        {formatMessageTime(message.timestamp)}
                        {message.senderType === 'employer' && message.read && (
                          <span className="ml-2 text-primary-400">Read</span>
                        )}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-slate-200 p-4">
              {/* Quick Actions */}
              {showQuickActions && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => handleSendMessage(action.message)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex items-end gap-3">
                <button
                  onClick={() => setShowQuickActions(!showQuickActions)}
                  className={`p-2 rounded-lg transition-colors ${showQuickActions ? 'bg-primary-100 text-primary-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </button>
                <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>
                <div className="flex-1">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    rows={1}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  />
                </div>
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!newMessage.trim()}
                  className="p-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h3 className="font-semibold text-slate-900 mb-2">Applicant Messages</h3>
              <p className="text-sm text-slate-500">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
