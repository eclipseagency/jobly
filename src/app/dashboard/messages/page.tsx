'use client';

import { useState } from 'react';

const conversations = [
  {
    id: '1',
    company: 'TechFlow Solutions',
    lastMessage: 'Thank you for your application. We would like to schedule an interview...',
    time: '2 hours ago',
    unread: true,
  },
  {
    id: '2',
    company: 'StartUp Hub PH',
    lastMessage: 'Your interview is confirmed for tomorrow at 2 PM.',
    time: '1 day ago',
    unread: true,
  },
  {
    id: '3',
    company: 'Creative Minds Agency',
    lastMessage: 'We have reviewed your portfolio and are impressed with your work.',
    time: '3 days ago',
    unread: false,
  },
  {
    id: '4',
    company: 'Digital Ventures',
    lastMessage: 'Thank you for attending the interview. We will get back to you soon.',
    time: '1 week ago',
    unread: false,
  },
];

const messages = [
  {
    id: '1',
    sender: 'company',
    text: 'Hello! Thank you for applying to the Senior Frontend Developer position at TechFlow Solutions.',
    time: '10:30 AM',
  },
  {
    id: '2',
    sender: 'company',
    text: 'We have reviewed your application and are impressed with your experience. We would like to schedule an interview with you.',
    time: '10:31 AM',
  },
  {
    id: '3',
    sender: 'user',
    text: 'Thank you for considering my application! I would be happy to schedule an interview. What times work best for you?',
    time: '11:15 AM',
  },
  {
    id: '4',
    sender: 'company',
    text: 'Great! How about tomorrow at 2:00 PM? The interview will be via Google Meet.',
    time: '11:45 AM',
  },
  {
    id: '5',
    sender: 'user',
    text: 'That works perfectly for me. I look forward to speaking with you!',
    time: '12:00 PM',
  },
];

export default function MessagesPage() {
  const [selectedChat, setSelectedChat] = useState(conversations[0]);
  const [newMessage, setNewMessage] = useState('');
  const [showChatList, setShowChatList] = useState(true);

  return (
    <div className="h-[calc(100vh-4rem)] lg:h-screen flex">
      {/* Conversations List */}
      <div className={`${showChatList ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-80 border-r border-slate-200 bg-white`}>
        <div className="p-4 border-b border-slate-100">
          <h1 className="text-lg font-semibold text-slate-900 mb-3">Messages</h1>
          <input
            type="text"
            placeholder="Search messages..."
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => {
                setSelectedChat(conv);
                setShowChatList(false);
              }}
              className={`w-full p-4 flex items-start gap-3 hover:bg-slate-50 transition-colors text-left ${
                selectedChat?.id === conv.id ? 'bg-primary-50 border-r-2 border-primary-600' : ''
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-medium text-sm flex-shrink-0">
                {conv.company.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className={`text-sm font-medium truncate ${conv.unread ? 'text-slate-900' : 'text-slate-600'}`}>
                    {conv.company}
                  </h3>
                  <span className="text-xs text-slate-400 flex-shrink-0">{conv.time}</span>
                </div>
                <p className={`text-sm truncate ${conv.unread ? 'text-slate-700' : 'text-slate-500'}`}>
                  {conv.lastMessage}
                </p>
              </div>
              {conv.unread && (
                <div className="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0 mt-2" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`${!showChatList ? 'flex' : 'hidden'} md:flex flex-col flex-1 bg-slate-50`}>
        {selectedChat ? (
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
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-medium text-sm">
                {selectedChat.company.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex-1">
                <h2 className="font-medium text-slate-900">{selectedChat.company}</h2>
                <p className="text-xs text-green-600">Online</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] sm:max-w-[70%] px-4 py-3 rounded-2xl ${
                      msg.sender === 'user'
                        ? 'bg-primary-600 text-white rounded-br-md'
                        : 'bg-white text-slate-900 rounded-bl-md border border-slate-200'
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                    <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-primary-200' : 'text-slate-400'}`}>
                      {msg.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 bg-white border-t border-slate-200">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button className="p-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors">
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
              <svg className="w-12 h-12 text-slate-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-slate-500">Select a conversation</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
