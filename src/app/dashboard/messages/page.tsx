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

export default function MessagesPage() {
  const { getUserConversations, getConversationMessages, sendMessage, markAsRead, setCurrentUser, currentUserType } = useMessaging();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [showChatList, setShowChatList] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Set current user as jobseeker
  useEffect(() => {
    setCurrentUser('jobseeker-1', 'jobseeker');
  }, [setCurrentUser]);

  const conversations = getUserConversations();
  const filteredConversations = conversations.filter(conv =>
    conv.employerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
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

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedConversationId) {
      sendMessage(selectedConversationId, newMessage);
      setNewMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

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
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center">
              <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-sm text-slate-500">No conversations yet</p>
              <p className="text-xs text-slate-400 mt-1">Apply to jobs to start messaging employers</p>
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
                  selectedConversationId === conv.id ? 'bg-primary-50 border-r-2 border-r-primary-600' : ''
                }`}
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-100 to-slate-100 flex items-center justify-center text-primary-600 font-medium text-sm flex-shrink-0">
                    {conv.employerAvatar}
                  </div>
                  {conv.unreadByJobseeker > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center">
                      {conv.unreadByJobseeker}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h3 className={`text-sm font-medium truncate ${conv.unreadByJobseeker > 0 ? 'text-slate-900' : 'text-slate-700'}`}>
                      {conv.employerName}
                    </h3>
                    <span className="text-xs text-slate-400 flex-shrink-0 ml-2">{formatTime(conv.lastMessageTime)}</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-1">{conv.jobTitle}</p>
                  <p className={`text-sm truncate ${conv.unreadByJobseeker > 0 ? 'text-slate-900 font-medium' : 'text-slate-500'}`}>
                    {conv.lastMessage || 'No messages yet'}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`${!showChatList ? 'flex' : 'hidden'} md:flex flex-col flex-1 bg-slate-50`}>
        {selectedConversation ? (
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
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-100 to-slate-100 flex items-center justify-center text-primary-600 font-medium text-sm">
                {selectedConversation.employerAvatar}
              </div>
              <div className="flex-1">
                <h2 className="font-medium text-slate-900">{selectedConversation.employerName}</h2>
                <p className="text-xs text-slate-500">{selectedConversation.jobTitle}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">Active</span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {conversationMessages.length === 0 ? (
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
                conversationMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.senderType === 'jobseeker' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className="max-w-[80%] sm:max-w-[70%]">
                      <div
                        className={`px-4 py-3 rounded-2xl ${
                          msg.senderType === 'jobseeker'
                            ? 'bg-primary-600 text-white rounded-br-md'
                            : 'bg-white text-slate-900 rounded-bl-md border border-slate-200'
                        }`}
                      >
                        <p className="text-sm">{msg.text}</p>
                      </div>
                      <p className={`text-xs text-slate-400 mt-1 ${msg.senderType === 'jobseeker' ? 'text-right' : ''}`}>
                        {formatMessageTime(msg.timestamp)}
                        {msg.senderType === 'jobseeker' && msg.read && (
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
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  />
                </div>
                <button
                  onClick={handleSendMessage}
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
              <h3 className="font-semibold text-slate-900 mb-2">Your Messages</h3>
              <p className="text-sm text-slate-500">Select a conversation to view messages</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
