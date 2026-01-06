import asyncHandler from "express-async-handler";
import ChatSession from "../models/chatSession.js";
import ChatMessage from "../models/chatMessage.js";
import AITask from "../models/aiTask.js";
import AISuggestion from "../models/aiSuggestion.js";
import CommonPreferences from "../models/CommonPreferences.js";
import geminiService from "../services/geminiService.js";
import { SUPPORT_DOCUMENTATION } from "../data/supportDocumentation.js";

// --- CHAT ---

// @desc   Get chat sessions
// @route  GET /api/chat/sessions
// @access Private
export const getSessions = asyncHandler(async (req, res) => {
  const sessions = await ChatSession.find({ user_id: req.user._id }).sort({ last_message_at: -1 });
  res.json(sessions);
});

// @desc   Create chat session
// @route  POST /api/chat/sessions
// @access Private
export const createSession = asyncHandler(async (req, res) => {
  const { title } = req.body;
  const session = await ChatSession.create({
    user_id: req.user._id,
    title: title || 'New Chat'
  });
  res.status(201).json(session);
});

// @desc   Get messages for a session
// @route  GET /api/chat/sessions/:sessionId/messages
// @access Private
export const getMessages = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  
  // Verify session belongs to user
  const session = await ChatSession.findById(sessionId);
  if (!session) {
    res.status(404);
    throw new Error('Session not found');
  }
  
  if (session.user_id.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized');
  }
  
  const messages = await ChatMessage.find({ session_id: sessionId }).sort({ created_at: 1 });
  res.json(messages);
});

// @desc   Send message and get AI response
// @route  POST /api/chat/sessions/:sessionId/messages
// @access Private
export const sendMessage = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const { sessionId } = req.params;

  if (!content || !content.trim()) {
    res.status(400);
    throw new Error('Message content is required');
  }

  // Verify session belongs to user
  const session = await ChatSession.findById(sessionId);
  if (!session) {
    res.status(404);
    throw new Error('Session not found');
  }
  
  if (session.user_id.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized');
  }

  // Save user message
  const userMessage = await ChatMessage.create({
    session_id: sessionId,
    user_id: req.user._id,
    role: 'user',
    content: content.trim()
  });

  // Get conversation history for context
  const history = await ChatMessage.find({ session_id: sessionId })
    .sort({ created_at: 1 })
    .limit(20);

  // Fetch User Context (Common Preferences)
  const commonPrefs = await CommonPreferences.findOne({ user: req.user._id });

  // Generate AI response
  let aiResponseText;
  try {
    aiResponseText = await geminiService.generateResponse(
      content.trim(),
      history.map(m => ({ role: m.role, content: m.content })),
      commonPrefs // Pass user context here
    );
  } catch (error) {
    console.error('AI response error:', error);
    aiResponseText = "I apologize, but I'm having trouble responding right now. Please try again in a moment.";
  }

  // Save AI response
  const aiMessage = await ChatMessage.create({
    session_id: sessionId,
    user_id: req.user._id,
    role: 'assistant',
    content: aiResponseText
  });

  // Update session last_message_at and title if first message
  const messageCount = await ChatMessage.countDocuments({ session_id: sessionId });
  const updateData = { last_message_at: Date.now() };
  
  if (messageCount <= 2 && session.title === 'New Chat') {
    // Generate a title based on first message
    const newTitle = await geminiService.generateSessionTitle(content.trim());
    updateData.title = newTitle;
  }
  
  const updatedSession = await ChatSession.findByIdAndUpdate(sessionId, updateData, { new: true });

  res.status(201).json({
    userMessage,
    aiMessage,
    session: updatedSession
  });
});

// @desc   Update chat session (e.g. title)
// @route  PUT /api/chat/sessions/:id
// @access Private
export const updateSession = asyncHandler(async (req, res) => {
  const session = await ChatSession.findById(req.params.id);

  if (!session) {
    res.status(404);
    throw new Error('Session not found');
  }

  if (session.user_id.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized');
  }

  const updatedSession = await ChatSession.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(updatedSession);
});

// @desc   Delete chat session
// @route  DELETE /api/chat/sessions/:id
// @access Private
export const deleteSession = asyncHandler(async (req, res) => {
  const session = await ChatSession.findById(req.params.id);

  if (!session) {
    res.status(404);
    throw new Error('Session not found');
  }

  if (session.user_id.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized');
  }

  // Delete all messages in this session
  await ChatMessage.deleteMany({ session_id: req.params.id });
  await session.deleteOne();

  res.json({ message: 'Session removed' });
});

// --- AI TASKS ---

// @desc   Get AI tasks
// @route  GET /api/ai/tasks
// @access Private
export const getTasks = asyncHandler(async (req, res) => {
  const tasks = await AITask.find({ user_id: req.user._id });
  res.json(tasks);
});

// @desc   Update AI task (e.g. status)
// @route  PUT /api/ai/tasks/:id
// @access Private
export const updateTask = asyncHandler(async (req, res) => {
  const task = await AITask.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  if (task.user_id.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized');
  }

  const updatedTask = await AITask.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(updatedTask);
});

// @desc   Delete AI task
// @route  DELETE /api/ai/tasks/:id
// @access Private
export const deleteTask = asyncHandler(async (req, res) => {
  const task = await AITask.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  if (task.user_id.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized');
  }

  await task.deleteOne();
  res.json({ message: 'Task removed' });
});


// --- AI SUGGESTIONS ---

// @desc   Get AI suggestions
// @route  GET /api/ai/suggestions
// @access Private
export const getSuggestions = asyncHandler(async (req, res) => {
  const suggestions = await AISuggestion.find({ user_id: req.user._id });
  res.json(suggestions);
});

// @desc   Update AI suggestion (e.g. is_read)
// @route  PUT /api/ai/suggestions/:id
// @access Private
export const updateSuggestion = asyncHandler(async (req, res) => {
  const suggestion = await AISuggestion.findById(req.params.id);

  if (!suggestion) {
    res.status(404);
    throw new Error('Suggestion not found');
  }

  if (suggestion.user_id.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized');
  }

  const updatedSuggestion = await AISuggestion.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(updatedSuggestion);
});

// @desc   Delete AI suggestion
// @route  DELETE /api/ai/suggestions/:id
// @access Private
export const deleteSuggestion = asyncHandler(async (req, res) => {
  const suggestion = await AISuggestion.findById(req.params.id);

  if (!suggestion) {
    res.status(404);
    throw new Error('Suggestion not found');
  }

  if (suggestion.user_id.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized');
  }

  await suggestion.deleteOne();
  res.json({ message: 'Suggestion removed' });
});

// --- SUPPORT CHAT ---

// @desc   Get support chat sessions
// @route  GET /api/support/sessions
// @access Private
export const getSupportSessions = asyncHandler(async (req, res) => {
  const sessions = await ChatSession.find({ 
    user_id: req.user._id,
    type: 'support'
  }).sort({ last_message_at: -1 });
  res.json(sessions);
});

// @desc   Create support chat session
// @route  POST /api/support/sessions
// @access Private
export const createSupportSession = asyncHandler(async (req, res) => {
  const session = await ChatSession.create({
    user_id: req.user._id,
    title: 'Support Chat',
    type: 'support'
  });
  res.status(201).json(session);
});

// @desc   Get messages for a support session
// @route  GET /api/support/sessions/:sessionId/messages
// @access Private
export const getSupportMessages = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  
  const session = await ChatSession.findById(sessionId);
  if (!session) {
    res.status(404);
    throw new Error('Session not found');
  }
  
  if (session.user_id.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized');
  }
  
  const messages = await ChatMessage.find({ session_id: sessionId }).sort({ created_at: 1 });
  res.json(messages);
});

// @desc   Send support message and get AI response
// @route  POST /api/support/sessions/:sessionId/messages
// @access Private
export const sendSupportMessage = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const { sessionId } = req.params;

  if (!content || !content.trim()) {
    res.status(400);
    throw new Error('Message content is required');
  }

  const session = await ChatSession.findById(sessionId);
  if (!session) {
    res.status(404);
    throw new Error('Session not found');
  }
  
  if (session.user_id.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized');
  }

  // Save user message
  const userMessage = await ChatMessage.create({
    session_id: sessionId,
    user_id: req.user._id,
    role: 'user',
    content: content.trim()
  });

  // Get conversation history
  const history = await ChatMessage.find({ session_id: sessionId })
    .sort({ created_at: 1 })
    .limit(20);

  // Generate support AI response
  let aiResponseText;
  try {
    aiResponseText = await geminiService.generateSupportResponse(
      content.trim(),
      history.map(m => ({ role: m.role, content: m.content })),
      SUPPORT_DOCUMENTATION
    );
  } catch (error) {
    console.error('Support AI response error:', error);
    aiResponseText = "I apologize, but I'm having trouble responding right now. Please try again or contact support@shasthohive.app for assistance.";
  }

  // Save AI response
  const aiMessage = await ChatMessage.create({
    session_id: sessionId,
    user_id: req.user._id,
    role: 'assistant',
    content: aiResponseText
  });

  // Update session timestamp
  await ChatSession.findByIdAndUpdate(sessionId, { last_message_at: Date.now() });

  res.status(201).json({
    userMessage,
    aiMessage
  });
});

// @desc   Delete support session
// @route  DELETE /api/support/sessions/:id
// @access Private
export const deleteSupportSession = asyncHandler(async (req, res) => {
  const session = await ChatSession.findById(req.params.id);

  if (!session) {
    res.status(404);
    throw new Error('Session not found');
  }

  if (session.user_id.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized');
  }

  await ChatMessage.deleteMany({ session_id: req.params.id });
  await session.deleteOne();

  res.json({ message: 'Session removed' });
});
