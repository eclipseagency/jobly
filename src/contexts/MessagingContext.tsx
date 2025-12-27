'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: 'jobseeker' | 'employer';
  text: string;
  timestamp: Date;
  read: boolean;
}

export interface Conversation {
  id: string;
  jobseekerId: string;
  jobseekerName: string;
  jobseekerAvatar: string;
  employerId: string;
  employerName: string;
  employerAvatar: string;
  jobTitle: string;
  jobId: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadByJobseeker: number;
  unreadByEmployer: number;
  status: 'active' | 'archived';
}

interface MessagingContextType {
  conversations: Conversation[];
  messages: Message[];
  currentUserId: string;
  currentUserType: 'jobseeker' | 'employer';
  setCurrentUser: (id: string, type: 'jobseeker' | 'employer') => void;
  sendMessage: (conversationId: string, text: string) => void;
  markAsRead: (conversationId: string) => void;
  getConversationMessages: (conversationId: string) => Message[];
  getUserConversations: () => Conversation[];
  startConversation: (otherPartyId: string, otherPartyName: string, jobId: string, jobTitle: string) => string;
}

const MessagingContext = createContext<MessagingContextType | undefined>(undefined);

// Sample data for demo
const initialConversations: Conversation[] = [
  {
    id: 'conv-1',
    jobseekerId: 'jobseeker-1',
    jobseekerName: 'Alex Morgan',
    jobseekerAvatar: 'AM',
    employerId: 'employer-1',
    employerName: 'TechFlow Solutions',
    employerAvatar: 'TS',
    jobTitle: 'Senior Frontend Developer',
    jobId: 'job-1',
    lastMessage: 'Thank you for your application. We would like to schedule an interview...',
    lastMessageTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
    unreadByJobseeker: 1,
    unreadByEmployer: 0,
    status: 'active',
  },
  {
    id: 'conv-2',
    jobseekerId: 'jobseeker-1',
    jobseekerName: 'Alex Morgan',
    jobseekerAvatar: 'AM',
    employerId: 'employer-2',
    employerName: 'StartUp Hub PH',
    employerAvatar: 'SH',
    jobTitle: 'Full Stack Engineer',
    jobId: 'job-2',
    lastMessage: 'Your interview is confirmed for tomorrow at 2 PM.',
    lastMessageTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
    unreadByJobseeker: 1,
    unreadByEmployer: 0,
    status: 'active',
  },
  {
    id: 'conv-3',
    jobseekerId: 'jobseeker-2',
    jobseekerName: 'Maria Santos',
    jobseekerAvatar: 'MS',
    employerId: 'employer-1',
    employerName: 'TechFlow Solutions',
    employerAvatar: 'TS',
    jobTitle: 'UI/UX Designer',
    jobId: 'job-3',
    lastMessage: 'I have attached my portfolio as requested.',
    lastMessageTime: new Date(Date.now() - 3 * 60 * 60 * 1000),
    unreadByJobseeker: 0,
    unreadByEmployer: 2,
    status: 'active',
  },
  {
    id: 'conv-4',
    jobseekerId: 'jobseeker-3',
    jobseekerName: 'John Cruz',
    jobseekerAvatar: 'JC',
    employerId: 'employer-1',
    employerName: 'TechFlow Solutions',
    employerAvatar: 'TS',
    jobTitle: 'Backend Developer',
    jobId: 'job-4',
    lastMessage: 'I am available for the interview on Monday.',
    lastMessageTime: new Date(Date.now() - 1 * 60 * 60 * 1000),
    unreadByJobseeker: 0,
    unreadByEmployer: 0,
    status: 'active',
  },
];

const initialMessages: Message[] = [
  // Conversation 1 - TechFlow with Alex
  {
    id: 'msg-1',
    conversationId: 'conv-1',
    senderId: 'employer-1',
    senderType: 'employer',
    text: 'Hello! Thank you for applying to the Senior Frontend Developer position at TechFlow Solutions.',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    read: true,
  },
  {
    id: 'msg-2',
    conversationId: 'conv-1',
    senderId: 'employer-1',
    senderType: 'employer',
    text: 'We have reviewed your application and are impressed with your experience. We would like to schedule an interview with you.',
    timestamp: new Date(Date.now() - 3.5 * 60 * 60 * 1000),
    read: true,
  },
  {
    id: 'msg-3',
    conversationId: 'conv-1',
    senderId: 'jobseeker-1',
    senderType: 'jobseeker',
    text: 'Thank you for considering my application! I would be happy to schedule an interview. What times work best for you?',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    read: true,
  },
  {
    id: 'msg-4',
    conversationId: 'conv-1',
    senderId: 'employer-1',
    senderType: 'employer',
    text: 'Great! How about tomorrow at 2:00 PM? The interview will be via Google Meet.',
    timestamp: new Date(Date.now() - 2.5 * 60 * 60 * 1000),
    read: true,
  },
  {
    id: 'msg-5',
    conversationId: 'conv-1',
    senderId: 'employer-1',
    senderType: 'employer',
    text: 'Thank you for your application. We would like to schedule an interview with you this week.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: false,
  },
  // Conversation 2 - StartUp Hub with Alex
  {
    id: 'msg-6',
    conversationId: 'conv-2',
    senderId: 'employer-2',
    senderType: 'employer',
    text: 'Hi Alex! We received your application for the Full Stack Engineer position.',
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
    read: true,
  },
  {
    id: 'msg-7',
    conversationId: 'conv-2',
    senderId: 'jobseeker-1',
    senderType: 'jobseeker',
    text: 'Thank you for getting back to me! I am very interested in this role.',
    timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000),
    read: true,
  },
  {
    id: 'msg-8',
    conversationId: 'conv-2',
    senderId: 'employer-2',
    senderType: 'employer',
    text: 'Your interview is confirmed for tomorrow at 2 PM.',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    read: false,
  },
  // Conversation 3 - TechFlow with Maria
  {
    id: 'msg-9',
    conversationId: 'conv-3',
    senderId: 'employer-1',
    senderType: 'employer',
    text: 'Hello Maria! Thank you for applying to the UI/UX Designer position.',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    read: true,
  },
  {
    id: 'msg-10',
    conversationId: 'conv-3',
    senderId: 'employer-1',
    senderType: 'employer',
    text: 'Could you please share your portfolio with us?',
    timestamp: new Date(Date.now() - 4.5 * 60 * 60 * 1000),
    read: true,
  },
  {
    id: 'msg-11',
    conversationId: 'conv-3',
    senderId: 'jobseeker-2',
    senderType: 'jobseeker',
    text: 'Of course! Here is my portfolio: www.mariasantos.design',
    timestamp: new Date(Date.now() - 3.5 * 60 * 60 * 1000),
    read: false,
  },
  {
    id: 'msg-12',
    conversationId: 'conv-3',
    senderId: 'jobseeker-2',
    senderType: 'jobseeker',
    text: 'I have attached my portfolio as requested.',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    read: false,
  },
  // Conversation 4 - TechFlow with John
  {
    id: 'msg-13',
    conversationId: 'conv-4',
    senderId: 'employer-1',
    senderType: 'employer',
    text: 'Hi John! We are reviewing applications for the Backend Developer role.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: true,
  },
  {
    id: 'msg-14',
    conversationId: 'conv-4',
    senderId: 'jobseeker-3',
    senderType: 'jobseeker',
    text: 'I am available for the interview on Monday.',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
    read: true,
  },
];

export function MessagingProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>('jobseeker-1');
  const [currentUserType, setCurrentUserType] = useState<'jobseeker' | 'employer'>('jobseeker');

  // Load from localStorage on mount
  useEffect(() => {
    const savedConversations = localStorage.getItem('jobly_conversations');
    const savedMessages = localStorage.getItem('jobly_messages');

    if (savedConversations) {
      const parsed = JSON.parse(savedConversations);
      setConversations(parsed.map((c: Conversation) => ({
        ...c,
        lastMessageTime: new Date(c.lastMessageTime),
      })));
    } else {
      setConversations(initialConversations);
    }

    if (savedMessages) {
      const parsed = JSON.parse(savedMessages);
      setMessages(parsed.map((m: Message) => ({
        ...m,
        timestamp: new Date(m.timestamp),
      })));
    } else {
      setMessages(initialMessages);
    }
  }, []);

  // Save to localStorage when data changes
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem('jobly_conversations', JSON.stringify(conversations));
    }
  }, [conversations]);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('jobly_messages', JSON.stringify(messages));
    }
  }, [messages]);

  const setCurrentUser = (id: string, type: 'jobseeker' | 'employer') => {
    setCurrentUserId(id);
    setCurrentUserType(type);
  };

  const sendMessage = (conversationId: string, text: string) => {
    if (!text.trim()) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      conversationId,
      senderId: currentUserId,
      senderType: currentUserType,
      text: text.trim(),
      timestamp: new Date(),
      read: false,
    };

    setMessages(prev => [...prev, newMessage]);

    // Update conversation
    setConversations(prev => prev.map(conv => {
      if (conv.id === conversationId) {
        return {
          ...conv,
          lastMessage: text.trim(),
          lastMessageTime: new Date(),
          unreadByJobseeker: currentUserType === 'employer' ? conv.unreadByJobseeker + 1 : 0,
          unreadByEmployer: currentUserType === 'jobseeker' ? conv.unreadByEmployer + 1 : 0,
        };
      }
      return conv;
    }));
  };

  const markAsRead = (conversationId: string) => {
    // Mark all messages in conversation as read
    setMessages(prev => prev.map(msg => {
      if (msg.conversationId === conversationId && msg.senderType !== currentUserType) {
        return { ...msg, read: true };
      }
      return msg;
    }));

    // Update unread count
    setConversations(prev => prev.map(conv => {
      if (conv.id === conversationId) {
        return {
          ...conv,
          unreadByJobseeker: currentUserType === 'jobseeker' ? 0 : conv.unreadByJobseeker,
          unreadByEmployer: currentUserType === 'employer' ? 0 : conv.unreadByEmployer,
        };
      }
      return conv;
    }));
  };

  const getConversationMessages = (conversationId: string) => {
    return messages
      .filter(msg => msg.conversationId === conversationId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  };

  const getUserConversations = () => {
    return conversations
      .filter(conv => {
        if (currentUserType === 'jobseeker') {
          return conv.jobseekerId === currentUserId;
        }
        return conv.employerId === currentUserId;
      })
      .sort((a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime());
  };

  const startConversation = (otherPartyId: string, otherPartyName: string, jobId: string, jobTitle: string) => {
    // Determine roles based on current user type
    const isEmployer = currentUserType === 'employer';

    const jobseekerId = isEmployer ? otherPartyId : currentUserId;
    const jobseekerName = isEmployer ? otherPartyName : 'Alex Morgan';
    const employerId = isEmployer ? currentUserId : otherPartyId;
    const employerName = isEmployer ? 'TechCorp Inc.' : otherPartyName;

    // Check if conversation already exists
    const existing = conversations.find(
      c => c.jobseekerId === jobseekerId && c.employerId === employerId && c.jobId === jobId
    );
    if (existing) return existing.id;

    const newConversation: Conversation = {
      id: `conv-${Date.now()}`,
      jobseekerId,
      jobseekerName,
      jobseekerAvatar: jobseekerName.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase(),
      employerId,
      employerName,
      employerAvatar: employerName.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase(),
      jobTitle,
      jobId,
      lastMessage: '',
      lastMessageTime: new Date(),
      unreadByJobseeker: 0,
      unreadByEmployer: 0,
      status: 'active',
    };

    setConversations(prev => [newConversation, ...prev]);
    return newConversation.id;
  };

  return (
    <MessagingContext.Provider value={{
      conversations,
      messages,
      currentUserId,
      currentUserType,
      setCurrentUser,
      sendMessage,
      markAsRead,
      getConversationMessages,
      getUserConversations,
      startConversation,
    }}>
      {children}
    </MessagingContext.Provider>
  );
}

export function useMessaging() {
  const context = useContext(MessagingContext);
  if (context === undefined) {
    throw new Error('useMessaging must be used within a MessagingProvider');
  }
  return context;
}
