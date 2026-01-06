import { Knock } from '@knocklabs/node';
import User from '../models/User.js';
import NotificationLog from '../models/NotificationLog.js';

let knockInstance = null;

const getKnock = () => {
  if (!knockInstance) {
    if (!process.env.KNOCK_API_KEY) {
      console.warn("Knock API Key is missing!");
    }
    knockInstance = new Knock({ apiKey: process.env.KNOCK_API_KEY });
  }
  return knockInstance;
};

class NotificationService {
  
  /**
   * Send a notification to a single user using Knock.
   * 
   * @param {string} userId - The ID of the user.
   * @param {string} title - The title of the notification.
   * @param {string} body - The body text of the notification.
   * @param {object} data - Custom data payload.
   */
  async sendToUser(userId, title, body, data = {}) {
    let status = 'sent';
    let failureReason = null;
    let runId = null;

    try {
      const knock = getKnock();
      
      // 1. Identify the user in Knock (ensure they exist)
      const user = await User.findById(userId);
      if (!user) {
        console.warn(`NotificationService: User ${userId} not found.`);
        return;
      }

      // Sync user to Knock using update (upsert)
      try {
          // The installed SDK version uses .update() for upserting users
          await knock.users.update(userId, {
            name: user.name,
            email: user.email,
          });
      } catch (idError) {
          console.warn(`NotificationService: Failed to identify/update user ${userId}`, idError.message);
      }

      // 2. Trigger the workflow

      
      const workflowKey = data.workflowKey || 'ai-analysis';

      const result = await knock.workflows.trigger(workflowKey, {
        recipients: [userId],
        data: {
          title,
          body,
          ...data,
        },
      });

      runId = result.workflow_run_id;
      console.log(`NotificationService: Sent to ${userId} via Knock`, result);

    } catch (error) {
      status = 'failed';
      failureReason = error.message;
      console.error(`NotificationService: Error sending to user ${userId}`, error);
    }

    // 3. Log to DB (Legacy logging)
    try {
      await NotificationLog.create({
        user: userId,
        title,
        body,
        type: data.type || 'system',
        data: { ...data, knockRunId: runId },
        status,
        failureReason,
        expoTicket: runId // stored in expoTicket for backward compatibility if needed
      });
    } catch (logError) {
      console.error('NotificationService: Failed to create log', logError);
    }

    return runId;
  }

  /**
   * Send a batch notification to multiple users.
   * 
   * @param {Array<{userId: string}>} recipients - Array of user objects (must have userId).
   * @param {string} title - The title of the notification.
   * @param {string} body - The body text.
   * @param {object} data - Custom data payload.
   */
  async sendBatch(recipients, title, body, data = {}) {
    // Flatten recipients to just IDs
    const userIds = recipients.map(r => r.userId).filter(Boolean);
    
    if (userIds.length === 0) return;

    try {
        const knock = getKnock();
        const workflowKey = data.workflowKey || 'ai-analysis';

        // Knock supports bulk triggers, but the Node SDK `workflows.trigger` 
        // takes a list of recipients which creates a separate workflow run for each,
        // OR we can use valid bulk API if supported. 
        // Actually, passing multiple recipients to `trigger` fans out.
        
        const result = await knock.workflows.trigger(workflowKey, {
            recipients: userIds,
            data: {
                title,
                body,
                ...data,
            },
        });

        console.log(`NotificationService: Batch sent to ${userIds.length} users via Knock`, result);
        
        // Log batch (simplified)
        const logs = userIds.map(userId => ({
            user: userId,
            title,
            body,
            type: data.type || 'offer',
            data: { ...data, knockRunId: result.workflow_run_id },
            status: 'sent',
        }));

        await NotificationLog.insertMany(logs);

        return result;

    } catch (error) {
        console.error("NotificationService: Error sending batch", error);
        // Log failure
        const logs = userIds.map(userId => ({
            user: userId,
            title,
            body,
            type: data.type || 'offer',
            data,
            status: 'failed',
            failureReason: error.message
        }));
        await NotificationLog.insertMany(logs);
    }
  }
}

export default new NotificationService();