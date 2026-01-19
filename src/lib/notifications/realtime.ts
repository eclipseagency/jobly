/**
 * Real-time Notification Service
 *
 * This module handles sending real-time notifications to users.
 * It uses Server-Sent Events (SSE) for real-time updates.
 */

import { prisma } from '@/lib/db';

// In-memory store for active connections (for single-server setup)
// For production with multiple servers, use Redis pub/sub
const activeConnections = new Map<string, Set<ReadableStreamDefaultController>>();

export function addConnection(userId: string, controller: ReadableStreamDefaultController) {
  if (!activeConnections.has(userId)) {
    activeConnections.set(userId, new Set());
  }
  activeConnections.get(userId)!.add(controller);
}

export function removeConnection(userId: string, controller: ReadableStreamDefaultController) {
  const connections = activeConnections.get(userId);
  if (connections) {
    connections.delete(controller);
    if (connections.size === 0) {
      activeConnections.delete(userId);
    }
  }
}

export function broadcastToUser(userId: string, data: object) {
  const connections = activeConnections.get(userId);
  if (connections) {
    const message = `data: ${JSON.stringify(data)}\n\n`;
    connections.forEach((controller) => {
      try {
        controller.enqueue(message);
      } catch {
        connections.delete(controller);
      }
    });
  }
}

export function isUserOnline(userId: string): boolean {
  const connections = activeConnections.get(userId);
  return connections ? connections.size > 0 : false;
}

// Notification types
export type NotificationType =
  | 'application_status'
  | 'new_application'
  | 'new_message'
  | 'interview_scheduled'
  | 'job_alert'
  | 'profile_view'
  | 'system';

interface CreateNotificationOptions {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  sendRealtime?: boolean;
}

/**
 * Create a notification and optionally send it in real-time
 */
export async function createNotification({
  userId,
  type,
  title,
  message,
  data = {},
  sendRealtime = true,
}: CreateNotificationOptions) {
  // Create notification in database
  const notification = await prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      data,
    },
  });

  // Send real-time update if user is online
  if (sendRealtime) {
    broadcastToUser(userId, {
      type: 'notification',
      notification: {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data,
        read: notification.read,
        createdAt: notification.createdAt.toISOString(),
      },
    });
  }

  return notification;
}

/**
 * Send application status update notification
 */
export async function notifyApplicationStatusChange(
  userId: string,
  applicationId: string,
  jobTitle: string,
  company: string,
  newStatus: string
) {
  return createNotification({
    userId,
    type: 'application_status',
    title: 'Application Status Updated',
    message: `Your application for ${jobTitle} at ${company} has been moved to ${newStatus}`,
    data: {
      applicationId,
      jobTitle,
      company,
      status: newStatus,
    },
  });
}

/**
 * Send new application notification to employer
 */
export async function notifyNewApplication(
  employerUserId: string,
  applicationId: string,
  jobTitle: string,
  applicantName: string
) {
  return createNotification({
    userId: employerUserId,
    type: 'new_application',
    title: 'New Application Received',
    message: `${applicantName} applied for ${jobTitle}`,
    data: {
      applicationId,
      jobTitle,
      applicantName,
    },
  });
}

/**
 * Send new message notification
 */
export async function notifyNewMessage(
  userId: string,
  senderId: string,
  senderName: string,
  messagePreview: string
) {
  return createNotification({
    userId,
    type: 'new_message',
    title: 'New Message',
    message: `${senderName}: ${messagePreview.substring(0, 50)}${messagePreview.length > 50 ? '...' : ''}`,
    data: {
      senderId,
      senderName,
    },
  });
}

/**
 * Send interview scheduled notification
 */
export async function notifyInterviewScheduled(
  userId: string,
  jobTitle: string,
  company: string,
  interviewDate: Date,
  interviewType: string
) {
  return createNotification({
    userId,
    type: 'interview_scheduled',
    title: 'Interview Scheduled',
    message: `You have a ${interviewType} interview for ${jobTitle} at ${company}`,
    data: {
      jobTitle,
      company,
      interviewDate: interviewDate.toISOString(),
      interviewType,
    },
  });
}

/**
 * Send job alert notification
 */
export async function notifyJobAlert(
  userId: string,
  matchingJobsCount: number,
  alertName: string
) {
  return createNotification({
    userId,
    type: 'job_alert',
    title: 'New Jobs Matching Your Criteria',
    message: `${matchingJobsCount} new job${matchingJobsCount > 1 ? 's' : ''} match your "${alertName}" alert`,
    data: {
      matchingJobsCount,
      alertName,
    },
  });
}
