
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const port = 1555;

// --- Body-parser middleware ---
app.use(bodyParser.json());

// --- MongoDB Connection ---
const dbURI = 'mongodb+srv://sadatmahmud_db_user:UPpGkQYEYRcBErCh@cluster0.4dke2ab.mongodb.net/health_tracker_db?retryWrites=true&w=majority';
mongoose.connect(dbURI)
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.log(err));

// --- Import Models ---
const UserProfile = require('./models/userProfile');
const UserSettings = require('./models/userSettings');
const WorkoutRoutine = require('./models/workoutRoutine');
const AITask = require('./models/aiTask');
const MealPlan = require('./models/mealPlan');
const Recipe = require('./models/recipe');
const ChatSession = require('./models/chatSession');
const ChatMessage = require('./models/chatMessage');
const HealthData = require('./models/healthData');
const AISuggestion = require('./models/aiSuggestion');
const User = require('./models/user');


// --- Generic CRUD Endpoints ---
const createCrudEndpoints = (model, modelName) => {
    // CREATE
    app.post(`/${modelName}`, async (req, res) => {
        try {
            const newItem = new model(req.body);
            await newItem.save();
            res.status(201).send(newItem);
        } catch (error) {
            res.status(400).send({ message: error.message });
        }
    });

    // READ ALL
    app.get(`/${modelName}`, async (req, res) => {
        try {
            const items = await model.find();
            res.status(200).send(items);
        } catch (error) {
            res.status(500).send({ message: error.message });
        }
    });

    // READ ONE
    app.get(`/${modelName}/:id`, async (req, res) => {
        try {
            const item = await model.findById(req.params.id);
            if (!item) return res.status(404).send({ message: 'Item not found' });
            res.status(200).send(item);
        } catch (error) {
            res.status(500).send({ message: error.message });
        }
    });

    // UPDATE (PUT)
    app.put(`/${modelName}/:id`, async (req, res) => {
        try {
            const updatedItem = await model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
            if (!updatedItem) return res.status(404).send({ message: 'Item not found' });
            res.status(200).send(updatedItem);
        } catch (error) {
            res.status(400).send({ message: error.message });
        }
    });

    // UPDATE (PATCH)
    app.patch(`/${modelName}/:id`, async (req, res) => {
        try {
            const updatedItem = await model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
            if (!updatedItem) return res.status(404).send({ message: 'Item not found' });
            res.status(200).send(updatedItem);
        } catch (error) {
            res.status(400).send({ message: error.message });
        }
    });

    // DELETE
    app.delete(`/${modelName}/:id`, async (req, res) => {
        try {
            const deletedItem = await model.findByIdAndDelete(req.params.id);
            if (!deletedItem) return res.status(404).send({ message: 'Item not found' });
            res.status(200).send({ message: 'Item deleted successfully' });
        } catch (error) {
            res.status(500).send({ message: error.message });
        }
    });
};

// --- Create CRUD endpoints for all models ---
createCrudEndpoints(UserProfile, 'user_profiles');
createCrudEndpoints(UserSettings, 'user_settings');
createCrudEndpoints(WorkoutRoutine, 'workout_routines');
createCrudEndpoints(AITask, 'ai_tasks');
createCrudEndpoints(MealPlan, 'meal_plans');
createCrudEndpoints(Recipe, 'recipes');
createCrudEndpoints(ChatSession, 'chat_sessions');
createCrudEndpoints(ChatMessage, 'chat_messages');
createCrudEndpoints(HealthData, 'health_data');
createCrudEndpoints(AISuggestion, 'ai_suggestions');


// --- Simple Sign-on ---
app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = new User({ username, password });
        await user.save();
        res.status(201).send({ message: 'User registered successfully' });
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username, password });
        if (!user) return res.status(401).send({ message: 'Invalid credentials' });
        res.status(200).send({ message: 'Login successful' });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});


// --- Start the server ---
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
