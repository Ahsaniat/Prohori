import asyncHandler from "express-async-handler";
import ChatSession from "../models/chatSession.js";
import ChatMessage from "../models/chatMessage.js";
import AITask from "../models/aiTask.js";
import AISuggestion from "../models/aiSuggestion.js";

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
  const messages = await ChatMessage.find({ session_id: req.params.sessionId }).sort({ created_at: 1 });
  res.json(messages);
});

// @desc   Send message
// @route  POST /api/chat/sessions/:sessionId/messages
// @access Private
export const sendMessage = asyncHandler(async (req, res) => {
  const { content, role } = req.body; // role usually 'user'
  const { sessionId } = req.params;

  const message = await ChatMessage.create({
    session_id: sessionId,
    user_id: req.user._id,
    role: role || 'user',
    content
  });

  // Update session last_message_at
  await ChatSession.findByIdAndUpdate(sessionId, { last_message_at: Date.now() });

  // TODO: Trigger AI Response Logic here if role === 'user'
  
  res.status(201).json(message);
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

  // Optionally delete all messages in this session
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
