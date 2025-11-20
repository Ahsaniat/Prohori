Connection string (Test DB don't worry): mongodb+srv://sadatmahmud_db_user:BTEuJcqGjNCjxas4@cluster0.4dke2ab.mongodb.net/?appName=Cluster0

# MongoDB Schema for Health Tracking App

This document outlines the MongoDB collections and document structures for the health tracking application. You can use this as a reference for creating collections or drop these documents directly into MongoDB.

---

## Collections Overview
---Aniqa---
1. `user_profiles` - User profile information
2. `user_settings` - User preferences and settings
3. `health_data` - Daily health metrics
---Sadat---
1. `meal_plans` - Meal planning and nutrition
2. `recipes` - Recipe library with suggestions
3. `workout_routines` - Workout plans and exercises
----Anik----
1. `chat_sessions` - Chat session metadata
2. `chat_messages` - Individual chat messages
3. `ai_suggestions` - AI-generated health suggestions
4.  `ai_tasks` - AI-generated tasks for users
---

## Collection: `user_profiles`

**Purpose:** Store user profile information extending authentication data

**Document Structure:**
```json
{
  "_id": "ObjectId or UUID from auth system",
  "user_id": "auth_user_id",
  "display_name": "John Doe",
  "avatar_url": "https://example.com/avatar.jpg",
  "bio": "Fitness enthusiast",
  "height": 175.5,
  "weight": 70.5,
  "age": 28,
  "gender": "male",
  "fitness_level": "intermediate",
  "goals": ["lose_weight", "build_muscle", "improve_endurance"],
  "theme_preference": "dark",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

**Indexes:**
```javascript
db.user_profiles.createIndex({ "user_id": 1 }, { unique: true })
db.user_profiles.createIndex({ "created_at": -1 })
```

---

## Collection: `user_settings`

**Purpose:** Store flexible user settings and metadata

**Document Structure:**
```json
{
  "_id": "ObjectId",
  "user_id": "auth_user_id",
  "settings_key": "notifications",
  "settings_value": {
    "email_enabled": true,
    "push_enabled": true,
    "workout_reminders": true,
    "meal_reminders": false
  },
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

**Indexes:**
```javascript
db.user_settings.createIndex({ "user_id": 1, "settings_key": 1 }, { unique: true })
```

**Example Settings Documents:**
```json
{
  "user_id": "user123",
  "settings_key": "units",
  "settings_value": {
    "weight": "kg",
    "height": "cm",
    "distance": "km",
    "temperature": "celsius"
  }
}
```

---

## Collection: `workout_routines`

**Purpose:** Store workout plans, exercises, and completion status

**Document Structure:**
```json
{
  "_id": "ObjectId",
  "user_id": "auth_user_id",
  "name": "Full Body Strength",
  "description": "Complete upper and lower body workout",
  "exercises": [
    {
      "name": "Bench Press",
      "sets": 4,
      "reps": 10,
      "weight": 60,
      "rest_seconds": 90,
      "notes": "Focus on form"
    },
    {
      "name": "Squats",
      "sets": 4,
      "reps": 12,
      "weight": 80,
      "rest_seconds": 120
    },
    {
      "name": "Running",
      "duration_minutes": 20,
      "intensity": "moderate"
    }
  ],
  "difficulty": "medium",
  "duration": 60,
  "calories_burned": 450,
  "tags": ["strength", "full_body", "gym"],
  "is_suggested": false,
  "is_completed": false,
  "completed_at": null,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

**Indexes:**
```javascript
db.workout_routines.createIndex({ "user_id": 1 })
db.workout_routines.createIndex({ "is_suggested": 1 })
db.workout_routines.createIndex({ "tags": 1 })
db.workout_routines.createIndex({ "created_at": -1 })
```

---

## Collection: `ai_tasks`

**Purpose:** Store AI-assigned tasks and goals

**Document Structure:**
```json
{
  "_id": "ObjectId",
  "user_id": "auth_user_id",
  "title": "Complete 10,000 steps today",
  "description": "Based on your recent activity, aim for 10k steps",
  "task_type": "health_check",
  "priority": "medium",
  "status": "pending",
  "due_date": "2024-01-16T23:59:59Z",
  "metadata": {
    "target_steps": 10000,
    "current_steps": 3500,
    "reasoning": "Below average activity this week"
  },
  "completed_at": null,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

**Indexes:**
```javascript
db.ai_tasks.createIndex({ "user_id": 1 })
db.ai_tasks.createIndex({ "status": 1 })
db.ai_tasks.createIndex({ "due_date": 1 })
db.ai_tasks.createIndex({ "task_type": 1 })
```

---

## Collection: `meal_plans`

**Purpose:** Store daily meal plans and nutrition tracking

**Document Structure:**
```json
{
  "_id": "ObjectId",
  "user_id": "auth_user_id",
  "name": "High Protein Day",
  "description": "Macro-balanced meals for muscle building",
  "date": "2024-01-15",
  "meals": [
    {
      "type": "breakfast",
      "name": "Protein Oatmeal",
      "time": "08:00",
      "items": [
        {
          "name": "Oats",
          "quantity": 50,
          "unit": "g",
          "calories": 190,
          "protein": 7,
          "carbs": 34,
          "fats": 3.5
        },
        {
          "name": "Protein Powder",
          "quantity": 30,
          "unit": "g",
          "calories": 120,
          "protein": 24,
          "carbs": 3,
          "fats": 1
        }
      ]
    },
    {
      "type": "lunch",
      "name": "Grilled Chicken Salad",
      "time": "13:00",
      "items": [
        {
          "name": "Chicken Breast",
          "quantity": 200,
          "unit": "g",
          "calories": 330,
          "protein": 62,
          "carbs": 0,
          "fats": 7
        }
      ]
    }
  ],
  "total_calories": 2200,
  "total_protein": 180,
  "total_carbs": 150,
  "total_fats": 60,
  "is_ai_generated": true,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

**Indexes:**
```javascript
db.meal_plans.createIndex({ "user_id": 1 })
db.meal_plans.createIndex({ "date": -1 })
db.meal_plans.createIndex({ "user_id": 1, "date": -1 })
```

---

## Collection: `recipes`

**Purpose:** Store recipes with nutritional information

**Document Structure:**
```json
{
  "_id": "ObjectId",
  "user_id": "auth_user_id or null for global recipes",
  "name": "High Protein Pancakes",
  "description": "Delicious protein-packed breakfast",
  "ingredients": [
    {
      "name": "Oat Flour",
      "quantity": 100,
      "unit": "g"
    },
    {
      "name": "Egg Whites",
      "quantity": 200,
      "unit": "ml"
    },
    {
      "name": "Banana",
      "quantity": 1,
      "unit": "piece"
    },
    {
      "name": "Protein Powder",
      "quantity": 30,
      "unit": "g"
    }
  ],
  "instructions": [
    "Mix all dry ingredients in a bowl",
    "Add wet ingredients and whisk until smooth",
    "Heat a non-stick pan over medium heat",
    "Pour batter and cook until bubbles form",
    "Flip and cook for 2 more minutes"
  ],
  "prep_time": 5,
  "cook_time": 10,
  "servings": 2,
  "calories": 350,
  "protein": 35,
  "carbs": 45,
  "fats": 6,
  "image_url": "https://example.com/pancakes.jpg",
  "tags": ["breakfast", "high-protein", "easy", "quick"],
  "is_suggested": true,
  "is_favorite": false,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

**Indexes:**
```javascript
db.recipes.createIndex({ "user_id": 1 })
db.recipes.createIndex({ "is_suggested": 1 })
db.recipes.createIndex({ "tags": 1 })
db.recipes.createIndex({ "name": "text", "description": "text" })
```

---

## Collection: `chat_sessions`

**Purpose:** Store chat session metadata

**Document Structure:**
```json
{
  "_id": "ObjectId",
  "user_id": "auth_user_id",
  "title": "Workout Plan Discussion",
  "last_message_at": "2024-01-15T14:30:00Z",
  "created_at": "2024-01-15T10:30:00Z"
}
```

**Indexes:**
```javascript
db.chat_sessions.createIndex({ "user_id": 1 })
db.chat_sessions.createIndex({ "last_message_at": -1 })
```

---

## Collection: `chat_messages`

**Purpose:** Store individual chat messages

**Document Structure:**
```json
{
  "_id": "ObjectId",
  "session_id": "chat_session_id",
  "user_id": "auth_user_id",
  "role": "user",
  "content": "Can you suggest a workout plan for beginners?",
  "metadata": {
    "tokens": 12,
    "model": "gpt-4"
  },
  "created_at": "2024-01-15T10:30:00Z"
}
```

**Example Assistant Message:**
```json
{
  "_id": "ObjectId",
  "session_id": "chat_session_id",
  "user_id": "auth_user_id",
  "role": "assistant",
  "content": "Here's a beginner-friendly workout plan...",
  "metadata": {
    "tokens": 150,
    "model": "gpt-4",
    "finish_reason": "stop"
  },
  "created_at": "2024-01-15T10:31:00Z"
}
```

**Indexes:**
```javascript
db.chat_messages.createIndex({ "session_id": 1 })
db.chat_messages.createIndex({ "created_at": -1 })
db.chat_messages.createIndex({ "session_id": 1, "created_at": 1 })
```

---

## Collection: `health_data`

**Purpose:** Store daily health metrics and tracking

**Document Structure:**
```json
{
  "_id": "ObjectId",
  "user_id": "auth_user_id",
  "date": "2024-01-15",
  "steps": 8543,
  "distance": 6.2,
  "calories_burned": 420,
  "active_minutes": 45,
  "heart_rate_avg": 72,
  "heart_rate_max": 145,
  "heart_rate_min": 58,
  "sleep_hours": 7.5,
  "sleep_quality": "good",
  "water_intake": 2.5,
  "weight": 70.5,
  "blood_pressure_systolic": 120,
  "blood_pressure_diastolic": 80,
  "metadata": {
    "device": "apple_watch",
    "sync_time": "2024-01-15T23:00:00Z",
    "workouts": [
      {
        "type": "running",
        "duration": 30,
        "calories": 250
      }
    ]
  },
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T23:00:00Z"
}
```

**Indexes:**
```javascript
db.health_data.createIndex({ "user_id": 1, "date": -1 }, { unique: true })
db.health_data.createIndex({ "date": -1 })
```

---

## Collection: `ai_suggestions`

**Purpose:** Store AI-generated health suggestions

**Document Structure:**
```json
{
  "_id": "ObjectId",
  "user_id": "auth_user_id",
  "suggestion_type": "workout",
  "title": "Increase Cardio Sessions",
  "content": "Based on your heart rate data, adding 2 more cardio sessions per week could improve cardiovascular health.",
  "priority": "medium",
  "is_read": false,
  "is_acted_upon": false,
  "metadata": {
    "reasoning": "Average heart rate increased by 5 bpm over 2 weeks",
    "data_points": 14,
    "confidence": 0.85
  },
  "expires_at": "2024-01-22T10:30:00Z",
  "created_at": "2024-01-15T10:30:00Z"
}
```

**Indexes:**
```javascript
db.ai_suggestions.createIndex({ "user_id": 1 })
db.ai_suggestions.createIndex({ "is_read": 1 })
db.ai_suggestions.createIndex({ "suggestion_type": 1 })
db.ai_suggestions.createIndex({ "expires_at": 1 })
```

---

## MongoDB Setup Commands

### Create Database and Collections
```javascript
// Switch to database
use health_tracker_db

// Collections are created automatically when you insert the first document
// Or you can create them explicitly:

db.createCollection("user_profiles")
db.createCollection("user_settings")
db.createCollection("workout_routines")
db.createCollection("ai_tasks")
db.createCollection("meal_plans")
db.createCollection("recipes")
db.createCollection("chat_sessions")
db.createCollection("chat_messages")
db.createCollection("health_data")
db.createCollection("ai_suggestions")
```

### Create All Indexes at Once
```javascript
// User Profiles
db.user_profiles.createIndex({ "user_id": 1 }, { unique: true })
db.user_profiles.createIndex({ "created_at": -1 })

// User Settings
db.user_settings.createIndex({ "user_id": 1, "settings_key": 1 }, { unique: true })

// Workout Routines
db.workout_routines.createIndex({ "user_id": 1 })
db.workout_routines.createIndex({ "is_suggested": 1 })
db.workout_routines.createIndex({ "tags": 1 })
db.workout_routines.createIndex({ "created_at": -1 })

// AI Tasks
db.ai_tasks.createIndex({ "user_id": 1 })
db.ai_tasks.createIndex({ "status": 1 })
db.ai_tasks.createIndex({ "due_date": 1 })
db.ai_tasks.createIndex({ "task_type": 1 })

// Meal Plans
db.meal_plans.createIndex({ "user_id": 1 })
db.meal_plans.createIndex({ "date": -1 })
db.meal_plans.createIndex({ "user_id": 1, "date": -1 })

// Recipes
db.recipes.createIndex({ "user_id": 1 })
db.recipes.createIndex({ "is_suggested": 1 })
db.recipes.createIndex({ "tags": 1 })
db.recipes.createIndex({ "name": "text", "description": "text" })

// Chat Sessions
db.chat_sessions.createIndex({ "user_id": 1 })
db.chat_sessions.createIndex({ "last_message_at": -1 })

// Chat Messages
db.chat_messages.createIndex({ "session_id": 1 })
db.chat_messages.createIndex({ "created_at": -1 })
db.chat_messages.createIndex({ "session_id": 1, "created_at": 1 })

// Health Data
db.health_data.createIndex({ "user_id": 1, "date": -1 }, { unique: true })
db.health_data.createIndex({ "date": -1 })

// AI Suggestions
db.ai_suggestions.createIndex({ "user_id": 1 })
db.ai_suggestions.createIndex({ "is_read": 1 })
db.ai_suggestions.createIndex({ "suggestion_type": 1 })
db.ai_suggestions.createIndex({ "expires_at": 1 })
```

### Drop All Collections (Use with Caution!)
```javascript
db.user_profiles.drop()
db.user_settings.drop()
db.workout_routines.drop()
db.ai_tasks.drop()
db.meal_plans.drop()
db.recipes.drop()
db.chat_sessions.drop()
db.chat_messages.drop()
db.health_data.drop()
db.ai_suggestions.drop()
```

---

## Sample Data Insertion

### Insert Sample User Profile
```javascript
db.user_profiles.insertOne({
  user_id: "user123",
  display_name: "Jane Smith",
  avatar_url: "https://example.com/avatar.jpg",
  bio: "Marathon runner and fitness coach",
  height: 165,
  weight: 58,
  age: 32,
  gender: "female",
  fitness_level: "advanced",
  goals: ["run_marathon", "maintain_weight"],
  theme_preference: "dark",
  created_at: new Date(),
  updated_at: new Date()
})
```

### Insert Sample Workout
```javascript
db.workout_routines.insertOne({
  user_id: "user123",
  name: "Morning Run",
  description: "Easy recovery run",
  exercises: [
    {
      name: "Running",
      duration_minutes: 30,
      distance_km: 5,
      pace: "6:00/km",
      intensity: "easy"
    }
  ],
  difficulty: "easy",
  duration: 30,
  calories_burned: 300,
  tags: ["cardio", "running", "outdoor"],
  is_suggested: false,
  is_completed: true,
  completed_at: new Date(),
  created_at: new Date(),
  updated_at: new Date()
})
```

### Insert Sample Health Data
```javascript
db.health_data.insertOne({
  user_id: "user123",
  date: "2024-01-15",
  steps: 12500,
  distance: 9.2,
  calories_burned: 550,
  active_minutes: 65,
  heart_rate_avg: 68,
  heart_rate_max: 152,
  heart_rate_min: 55,
  sleep_hours: 8.2,
  sleep_quality: "excellent",
  water_intake: 3.0,
  weight: 58.0,
  metadata: {
    device: "garmin_watch",
    sync_time: new Date()
  },
  created_at: new Date(),
  updated_at: new Date()
})
```

---

## Notes

1. **Authentication**: User authentication is handled separately user id.

2. **Flexibility**: MongoDB's schema-less nature allows for easy evolution. Add new fields as needed without migrations.

3. **JSONB vs Nested Documents**: Unlike PostgreSQL's JSONB, MongoDB natively supports nested documents, making complex data structures more natural.

4. **Indexes**: The indexes provided optimize common query patterns. Monitor actual usage and adjust as needed.

5. **Dates**: Use ISO 8601 date strings for `date` fields (e.g., "2024-01-15") and JavaScript `Date()` objects for timestamps.

6. **Global vs User Data**: The `recipes` collection supports both user-specific recipes (with `user_id`) and global recipes (`user_id: null`).

7. **Relationships**: MongoDB doesn't enforce foreign key constraints like SQL databases. Your application logic must maintain referential integrity.

---

## Query Examples

### Find user's workouts for the week
```javascript
db.workout_routines.find({
  user_id: "user123",
  created_at: {
    $gte: new Date("2024-01-08"),
    $lt: new Date("2024-01-15")
  }
}).sort({ created_at: -1 })
```

### Get AI suggestions by type
```javascript
db.ai_suggestions.find({
  user_id: "user123",
  suggestion_type: "nutrition",
  is_read: false
}).sort({ priority: 1, created_at: -1 })
```

### Find high-protein recipes
```javascript
db.recipes.find({
  protein: { $gte: 30 },
  tags: "high-protein"
}).sort({ calories: 1 })
```

### Get health data for date range
```javascript
db.health_data.find({
  user_id: "user123",
  date: {
    $gte: "2024-01-01",
    $lte: "2024-01-31"
  }
}).sort({ date: 1 })
```

---

## Migration from PostgreSQL to MongoDB

If migrating from the PostgreSQL schema:

1. **UUIDs**: Convert PostgreSQL UUIDs to MongoDB ObjectIds or keep as strings
2. **JSONB**: Direct mapping to nested documents
3. **Arrays**: PostgreSQL arrays (e.g., `tags TEXT[]`) become MongoDB arrays
4. **Timestamps**: Convert `TIMESTAMP WITH TIME ZONE` to JavaScript `Date()` objects
5. **RLS**: Implement application-level access control (MongoDB has no built-in RLS)

---

## Best Practices

1. **Always index `user_id`** for multi-tenant data isolation
2. **Use compound indexes** for common query patterns (e.g., `user_id + date`)
3. **Limit document size** to under 16MB (MongoDB limit)
4. **Consider sharding** for large-scale deployments
5. **Use aggregation pipeline** for complex analytics
6. **Implement validation schemas** for data integrity (optional but recommended)
