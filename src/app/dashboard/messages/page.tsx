'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/components/ui/Toast';

interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  createdAt: string;
  isRead: boolean;
  sender: {
    id: string;
    name: string;
    avatar: string | null;
  };
}

interface Thread {
  partnerId: string;
  partner: {
    id: string;
    name: string;
    avatar: string | null;
    title: string | null;
    company?: {
      id: string;
      name: string;
      logo: string | null;
    } | null;
  };
  lastMessage: {
    id: string;
    content: string;
    createdAt: string;
    senderId: string;
  } | null;
  unreadCount: number;
  jobTitle?: string;
  companyName?: string;
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
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

function formatMessageTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
}

export default function MessagesPage() {
  const { error: showError } = useToast();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [showChatList, setShowChatList] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingThreads, setIsLoadingThreads] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch conversation threads
  const fetchThreads = useCallback(async () => {
    try {
      const response = await fetch('/api/messages');
      if (!response.ok) throw new Error('Failed to fetch threads');
      const data = await response.json();
      setThreads(data.threads || []);
    } catch (error) {
      console.error('Error fetching threads:', error);
    } finally {
      setIsLoadingThreads(false);
    }
  }, []);

  // Fetch messages for selected conversation
  const fetchMessages = useCallback(async (partnerId: string) => {
    setIsLoadingMessages(true);
    try {
      const response = await fetch(`/api/messages?partnerId=${partnerId}`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      setMessages(data.messages || []);

      // Update unread count in threads list
      setThreads(prev => prev.map(t =>
        t.partnerId === partnerId ? { ...t, unreadCount: 0 } : t
      ));
    } catch (error) {
      console.error('Error fetching messages:', error);
      showError('Failed to load messages');
    } finally {
      setIsLoadingMessages(false);
    }
  }, [showError]);

  // Initial load
  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  // Poll for new messages every 10 seconds
  useEffect(() => {
    pollingIntervalRef.current = setInterval(() => {
      fetchThreads();
      if (selectedPartnerId) {
        fetchMessages(selectedPartnerId);
      }
    }, 10000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [fetchThreads, fetchMessages, selectedPartnerId]);

  // Load messages when selecting a conversation
  useEffect(() => {
    if (selectedPartnerId) {
      fetchMessages(selectedPartnerId);
    }
  }, [selectedPartnerId, fetchMessages]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Filter threads by search
  const filteredThreads = threads.filter(thread => {
    const searchLower = searchQuery.toLowerCase();
    return (
      thread.partner?.name?.toLowerCase().includes(searchLower) ||
      thread.companyName?.toLowerCase().includes(searchLower) ||
      thread.jobTitle?.toLowerCase().includes(searchLower)
    );
  });

  const selectedThread = threads.find(t => t.partnerId === selectedPartnerId);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedPartnerId || isSending) return;

    setIsSending(true);
    const messageContent = newMessage.trim();
    setNewMessage('');

    // Optimistic update
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      senderId: 'current-user',
      recipientId: selectedPartnerId,
      content: messageContent,
      createdAt: new Date().toISOString(),
      isRead: false,
      sender: { id: 'current-user', name: 'You', avatar: null },
    };
    setMessages(prev => [...prev, optimisticMessage]);

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: selectedPartnerId,
          content: messageContent,
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      const data = await response.json();

      // Replace optimistic message with real one
      setMessages(prev => prev.map(m =>
        m.id === optimisticMessage.id ? data.message : m
      ));

      // Update thread's last message
      setThreads(prev => prev.map(t =>
        t.partnerId === selectedPartnerId
          ? {
              ...t,
              lastMessage: {
                id: data.message.id,
                content: messageContent,
                createdAt: data.message.createdAt,
                senderId: data.message.senderId,
              }
            }
          : t
      ));

    } catch (error) {
      console.error('Error sending message:', error);
      showError('Failed to send message');
      // Remove optimistic message on failure
      setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
      setNewMessage(messageContent);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Loading skeleton for threads
  const ThreadsSkeleton = () => (
    <div className="space-y-1">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="p-4 flex items-start gap-3 animate-pulse">
          <div className="w-12 h-12 rounded-full bg-slate-200" />
          <div className="flex-1">
            <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
            <div className="h-3 bg-slate-200 rounded w-1/2 mb-2" />
            <div className="h-3 bg-slate-200 rounded w-full" />
          </div>
        </div>
      ))}
    </div>
  );

  // Loading skeleton for messages
  const MessagesSkeleton = () => (
    <div className="space-y-4 p-4">
      {[1, 2, 3].map(i => (
        <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
          <div className={`w-2/3 animate-pulse ${i % 2 === 0 ? 'text-right' : ''}`}>
            <div className={`h-16 rounded-2xl ${i % 2 === 0 ? 'bg-primary-200' : 'bg-slate-200'}`} />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="h-[calc(100vh-4rem)] lg:h-screen flex">
      {/* Conversations List */}
      <div className={`${showChatList ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-80 lg:w-96 border-r border-slate-200 bg-white`}>
        <div className="p-4 border-b border-slate-100">
          <h1 className="text-lg font-semibold text-slate-900 mb-3">Messages</h1>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoadingThreads ? (
            <ThreadsSkeleton />
          ) : filteredThreads.length === 0 ? (
            <div className="p-8 text-center">
              <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-sm text-slate-500">No conversations yet</p>
              <p className="text-xs text-slate-400 mt-1">Apply to jobs to start messaging employers</p>
            </div>
          ) : (
            filteredThreads.map((thread) => (
              <button
                key={thread.partnerId}
                onClick={() => {
                  setSelectedPartnerId(thread.partnerId);
                  setShowChatList(false);
                }}
                className={`w-full p-4 flex items-start gap-3 hover:bg-slate-50 transition-colors text-left border-b border-slate-100 ${
                  selectedPartnerId === thread.partnerId ? 'bg-primary-50 border-r-2 border-r-primary-600' : ''
                }`}
              >
                <div className="relative">
                  {thread.partner?.company?.logo || thread.partner?.avatar ? (
                    <img
                      src={thread.partner.company?.logo || thread.partner.avatar || ''}
                      alt={thread.partner?.name || 'Company'}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-100 to-slate-100 flex items-center justify-center text-primary-600 font-medium text-sm flex-shrink-0">
                      {getInitials(thread.companyName || thread.partner?.name || 'E')}
                    </div>
                  )}
                  {thread.unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center">
                      {thread.unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h3 className={`text-sm font-medium truncate ${thread.unreadCount > 0 ? 'text-slate-900' : 'text-slate-700'}`}>
                      {thread.companyName || thread.partner?.name || 'Unknown'}
                    </h3>
                    {thread.lastMessage && (
                      <span className="text-xs text-slate-400 flex-shrink-0 ml-2">
                        {formatTime(thread.lastMessage.createdAt)}
                      </span>
                    )}
                  </div>
                  {thread.jobTitle && (
                    <p className="text-xs text-slate-500 mb-1 truncate">{thread.jobTitle}</p>
                  )}
                  <p className={`text-sm truncate ${thread.unreadCount > 0 ? 'text-slate-900 font-medium' : 'text-slate-500'}`}>
                    {thread.lastMessage?.content || 'No messages yet'}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`${!showChatList ? 'flex' : 'hidden'} md:flex flex-col flex-1 bg-slate-50`}>
        {selectedThread ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-white border-b border-slate-200 flex items-center gap-3">
              <button
                onClick={() => setShowChatList(true)}
                className="md:hidden p-2 hover:bg-slate-100 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              {selectedThread.partner?.company?.logo || selectedThread.partner?.avatar ? (
                <img
                  src={selectedThread.partner.company?.logo || selectedThread.partner.avatar || ''}
                  alt={selectedThread.partner?.name || 'Company'}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-100 to-slate-100 flex items-center justify-center text-primary-600 font-medium text-sm">
                  {getInitials(selectedThread.companyName || selectedThread.partner?.name || 'E')}
                </div>
              )}
              <div className="flex-1">
                <h2 className="font-medium text-slate-900">
                  {selectedThread.companyName || selectedThread.partner?.name}
                </h2>
                {selectedThread.jobTitle && (
                  <p className="text-xs text-slate-500">{selectedThread.jobTitle}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">Active</span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {isLoadingMessages ? (
                <MessagesSkeleton />
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p className="text-sm text-slate-500">No messages yet</p>
                    <p className="text-xs text-slate-400 mt-1">Start the conversation!</p>
                  </div>
                </div>
              ) : (
                messages.map((msg) => {
                  const isOwnMessage = msg.senderId !== selectedPartnerId;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className="max-w-[80%] sm:max-w-[70%]">
                        <div
                          className={`px-4 py-3 rounded-2xl ${
                            isOwnMessage
                              ? 'bg-primary-600 text-white rounded-br-md'
                              : 'bg-white text-slate-900 rounded-bl-md border border-slate-200'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        </div>
                        <p className={`text-xs text-slate-400 mt-1 ${isOwnMessage ? 'text-right' : ''}`}>
                          {formatMessageTime(msg.createdAt)}
                          {isOwnMessage && msg.isRead && (
                            <span className="ml-2 text-primary-400">Read</span>
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 bg-white border-t border-slate-200">
              <div className="flex items-end gap-3">
                <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>
                <div className="flex-1">
                  <textarea
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    disabled={isSending}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none disabled:opacity-50"
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || isSending}
                  className="p-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
                >
                  {isSending ? (
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
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
              <h3 className="font-semibold text-slate-900 mb-2">Your Messages</h3>
              <p className="text-sm text-slate-500">Select a conversation to view messages</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
