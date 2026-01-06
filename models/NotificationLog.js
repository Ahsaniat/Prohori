import mongoose from "mongoose";

const notificationLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    body: {
      type: String,
    },
    type: {
      type: String,
      enum: ['functional', 'offer', 'security', 'system', 'chat'],
      default: 'system'
    },
    data: {
      type: Object,
      default: {}
    },
    status: {
      type: String,
      enum: ['sent', 'failed', 'queued', 'skipped'],
      default: 'sent'
    },
    expoTicket: {
      type: Object, // To store the receipt ID or error details from Expo
    },
    failureReason: {
      type: String // To store why it was skipped or failed
    }
  },
  {
    timestamps: true,
  }
);

const NotificationLog = mongoose.model("NotificationLog", notificationLogSchema);
export default NotificationLog;
