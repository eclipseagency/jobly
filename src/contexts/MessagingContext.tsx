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

// Initial empty state for production - data will be loaded from API or created at runtime

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
      try {
        const parsed = JSON.parse(savedConversations);
        setConversations(parsed.map((c: Conversation) => ({
          ...c,
          lastMessageTime: new Date(c.lastMessageTime),
        })));
      } catch (error) {
        console.error('Failed to parse conversations:', error);
        setConversations([]);
      }
    }

    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        setMessages(parsed.map((m: Message) => ({
          ...m,
          timestamp: new Date(m.timestamp),
        })));
      } catch (error) {
        console.error('Failed to parse messages:', error);
        setMessages([]);
      }
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
