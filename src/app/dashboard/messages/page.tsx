'use client';

import { useState } from 'react';

const conversations = [
  {
    id: '1',
    company: 'TechFlow Solutions',
    lastMessage: 'Thank you for your application. We would like to schedule an interview...',
    time: '2 hours ago',
    unread: true,
    avatar: 'TF',
  },
  {
    id: '2',
    company: 'StartUp Hub PH',
    lastMessage: 'Your interview is confirmed for tomorrow at 2 PM.',
    time: '1 day ago',
    unread: true,
    avatar: 'SH',
  },
  {
    id: '3',
    company: 'Creative Minds Agency',
    lastMessage: 'We have reviewed your portfolio and are impressed with your work.',
    time: '3 days ago',
    unread: false,
    avatar: 'CM',
  },
  {
    id: '4',
    company: 'Digital Ventures',
    lastMessage: 'Thank you for attending the interview. We will get back to you soon.',
    time: '1 week ago',
    unread: false,
    avatar: 'DV',
  },
];

const messages = [
  {
    id: '1',
    sender: 'company',
    text: 'Hello Alex! Thank you for applying to the Senior Frontend Developer position at TechFlow Solutions.',
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
    text: 'Great! How about tomorrow at 2:00 PM? The interview will be conducted via Google Meet and will last approximately 45 minutes.',
    time: '11:45 AM',
  },
  {
    id: '5',
    sender: 'user',
    text: 'That works perfectly for me. I look forward to speaking with you!',
    time: '12:00 PM',
  },
  {
    id: '6',
    sender: 'company',
    text: 'Perfect! I will send you the meeting link shortly. Please be prepared to discuss your experience with React and TypeScript.',
    time: '12:05 PM',
  },
];

export default function MessagesPage() {
  const [selectedChat, setSelectedChat] = useState(conversations[0]);
  const [newMessage, setNewMessage] = useState('');
  const [showChatList, setShowChatList] = useState(true);

  return (
    <div className="h-[calc(100vh-4rem)] lg:h-[calc(100vh-0px)] flex">
      {/* Conversations List */}
      <div className={`${showChatList ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-80 lg:w-96 border-r border-slate-200 bg-white`}>
        {/* Header */}
        <div className="p-4 border-b border-slate-200">
          <h1 className="text-xl font-bold text-slate-800 mb-4">Messages</h1>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search messages..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            />
          </div>
        </div>

        {/* Conversations */}
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
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-slate-600 font-semibold flex-shrink-0">
                {conv.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className={`font-medium truncate ${conv.unread ? 'text-slate-800' : 'text-slate-600'}`}>
                    {conv.company}
                  </h3>
                  <span className="text-xs text-slate-500 flex-shrink-0">{conv.time}</span>
                </div>
                <p className={`text-sm truncate ${conv.unread ? 'text-slate-700 font-medium' : 'text-slate-500'}`}>
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-slate-600 font-semibold">
                {selectedChat.avatar}
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-slate-800">{selectedChat.company}</h2>
                <p className="text-xs text-green-600">Online</p>
              </div>
              <button className="p-2 hover:bg-slate-100 rounded-lg">
                <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
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
                        : 'bg-white text-slate-800 rounded-bl-md shadow-sm'
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
                <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button className="p-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-colors">
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-slate-500">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
