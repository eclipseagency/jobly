'use client';

import { useState } from 'react';

const conversations = [
  {
    id: '1',
    name: 'Maria Santos',
    avatar: 'MS',
    lastMessage: 'Thank you for considering my application. I am very excited about the opportunity.',
    timestamp: '10:30 AM',
    unread: 2,
    job: 'Senior Frontend Developer',
    status: 'Active',
  },
  {
    id: '2',
    name: 'John Reyes',
    avatar: 'JR',
    lastMessage: 'Yes, I am available for an interview next week. Please let me know the schedule.',
    timestamp: '9:15 AM',
    unread: 0,
    job: 'Full Stack Engineer',
    status: 'Active',
  },
  {
    id: '3',
    name: 'Ana Cruz',
    avatar: 'AC',
    lastMessage: 'I have attached my portfolio as requested. Looking forward to your feedback.',
    timestamp: 'Yesterday',
    unread: 1,
    job: 'Product Designer',
    status: 'Interview Scheduled',
  },
  {
    id: '4',
    name: 'Miguel Lopez',
    avatar: 'ML',
    lastMessage: 'Could you provide more details about the tech stack used in the project?',
    timestamp: 'Yesterday',
    unread: 0,
    job: 'DevOps Engineer',
    status: 'Active',
  },
  {
    id: '5',
    name: 'Sarah Garcia',
    avatar: 'SG',
    lastMessage: 'The technical assessment has been completed. Please review when you have time.',
    timestamp: '2 days ago',
    unread: 0,
    job: 'Senior Frontend Developer',
    status: 'Shortlisted',
  },
];

const sampleMessages = [
  { id: 1, sender: 'applicant', text: 'Good morning! I recently applied for the Senior Frontend Developer position and wanted to follow up on my application.', time: '10:15 AM' },
  { id: 2, sender: 'employer', text: 'Hello Maria! Thank you for reaching out. We have reviewed your application and are impressed with your experience.', time: '10:20 AM' },
  { id: 3, sender: 'employer', text: 'We would like to invite you for an initial interview. Are you available next week?', time: '10:21 AM' },
  { id: 4, sender: 'applicant', text: 'Thank you for considering my application. I am very excited about the opportunity.', time: '10:30 AM' },
  { id: 5, sender: 'applicant', text: 'Yes, I am available next week. Tuesday or Wednesday would work best for me.', time: '10:31 AM' },
];

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState(conversations[0]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.job.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // Handle send message logic
      setNewMessage('');
    }
  };

  return (
    <div className="h-[calc(100vh-64px)] lg:h-screen flex">
      {/* Conversations List */}
      <div className="w-full lg:w-80 xl:w-96 border-r border-slate-200 bg-white flex flex-col">
        <div className="p-4 border-b border-slate-100">
          <h1 className="text-xl font-bold text-slate-900 mb-4">Messages</h1>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setSelectedConversation(conv)}
              className={`w-full p-4 flex items-start gap-3 hover:bg-slate-50 transition-colors text-left ${
                selectedConversation?.id === conv.id ? 'bg-primary-50' : ''
              }`}
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-100 to-slate-100 flex items-center justify-center text-primary-600 font-medium">
                  {conv.avatar}
                </div>
                {conv.unread > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center">
                    {conv.unread}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-medium truncate ${conv.unread > 0 ? 'text-slate-900' : 'text-slate-700'}`}>
                    {conv.name}
                  </span>
                  <span className="text-xs text-slate-400 flex-shrink-0 ml-2">{conv.timestamp}</span>
                </div>
                <p className="text-xs text-slate-500 mb-1">{conv.job}</p>
                <p className={`text-sm truncate ${conv.unread > 0 ? 'text-slate-900 font-medium' : 'text-slate-500'}`}>
                  {conv.lastMessage}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="hidden lg:flex flex-1 flex-col bg-slate-50">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-100 to-slate-100 flex items-center justify-center text-primary-600 font-medium">
                  {selectedConversation.avatar}
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900">{selectedConversation.name}</h2>
                  <p className="text-sm text-slate-500">{selectedConversation.job}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                  {selectedConversation.status}
                </span>
                <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {sampleMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'employer' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-md ${message.sender === 'employer' ? 'order-1' : ''}`}>
                    <div
                      className={`px-4 py-3 rounded-2xl ${
                        message.sender === 'employer'
                          ? 'bg-primary-600 text-white rounded-br-md'
                          : 'bg-white text-slate-900 rounded-bl-md border border-slate-200'
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                    </div>
                    <p className={`text-xs text-slate-400 mt-1 ${message.sender === 'employer' ? 'text-right' : ''}`}>
                      {message.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-slate-200 p-4">
              <div className="flex items-end gap-3">
                <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>
                <div className="flex-1">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    rows={1}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  className="p-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <button className="text-xs text-slate-500 hover:text-slate-700 px-2 py-1 rounded hover:bg-slate-100">
                  Schedule Interview
                </button>
                <button className="text-xs text-slate-500 hover:text-slate-700 px-2 py-1 rounded hover:bg-slate-100">
                  Send Job Offer
                </button>
                <button className="text-xs text-slate-500 hover:text-slate-700 px-2 py-1 rounded hover:bg-slate-100">
                  Request Documents
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
              <h3 className="font-semibold text-slate-900 mb-2">Select a conversation</h3>
              <p className="text-sm text-slate-500">Choose a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
