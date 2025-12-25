'use client';

export default function EmployerMessagesPage() {
  const conversations = [
    { id: 1, name: 'Maria Santos', lastMessage: 'Thank you for considering my application!', time: '2 min ago', unread: 2, avatar: 'MS' },
    { id: 2, name: 'John Cruz', lastMessage: 'I am available for the interview on Monday.', time: '1 hour ago', unread: 0, avatar: 'JC' },
    { id: 3, name: 'Ana Reyes', lastMessage: 'Looking forward to hearing from you.', time: '3 hours ago', unread: 1, avatar: 'AR' },
    { id: 4, name: 'Miguel Torres', lastMessage: 'Yes, I have 5 years of React experience.', time: 'Yesterday', unread: 0, avatar: 'MT' },
  ];

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Messages</h1>
        <p className="text-slate-500 mt-1">Communicate with applicants</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-200">
        {conversations.map((conv) => (
          <div key={conv.id} className="p-4 hover:bg-slate-50 cursor-pointer transition-colors flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium">
                {conv.avatar}
              </div>
              {conv.unread > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {conv.unread}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className={`font-medium ${conv.unread > 0 ? 'text-slate-900' : 'text-slate-700'}`}>{conv.name}</h3>
                <span className="text-xs text-slate-400">{conv.time}</span>
              </div>
              <p className={`text-sm truncate ${conv.unread > 0 ? 'text-slate-700 font-medium' : 'text-slate-500'}`}>
                {conv.lastMessage}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
