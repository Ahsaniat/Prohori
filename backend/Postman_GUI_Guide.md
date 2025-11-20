
# Postman GUI Guide

This guide provides instructions on how to test the API endpoints for the health tracking application using the Postman GUI.

## Setup

1.  **Install Postman:** If you haven't already, download and install the Postman app from [https://www.postman.com/downloads/](https://www.postman.com/downloads/).
2.  **Create a new request:** In Postman, click on the "+" button to create a new request.

## Base URL

The base URL for all the API endpoints is `http://localhost:3000`.

---

## User Profiles

### Create User Profile

*   **Method:** `POST`
*   **URL:** `http://localhost:3000/user_profiles`
*   **Body:** In the "Body" tab, select "raw" and "JSON" from the dropdown menus. Then, paste the following JSON into the text area:

```json
{
  "user_id": "user123",
  "display_name": "Jane Smith",
  "avatar_url": "https://example.com/avatar.jpg",
  "bio": "Marathon runner and fitness coach",
  "height": 165,
  "weight": 58,
  "age": 32,
  "gender": "female",
  "fitness_level": "advanced",
  "goals": ["run_marathon", "maintain_weight"],
  "theme_preference": "dark"
}
```

### Get All User Profiles

*   **Method:** `GET`
*   **URL:** `http://localhost:3000/user_profiles`

### Get User Profile by ID

*   **Method:** `GET`
*   **URL:** `http://localhost:3000/user_profiles/:id`
*   **Params:** In the "Params" tab, you will see a path variable named `id`. Replace the value with the actual ID of the user profile you want to retrieve.

### Update User Profile

*   **Method:** `PUT`
*   **URL:** `http://localhost:3000/user_profiles/:id`
*   **Params:** In the "Params" tab, you will see a path variable named `id`. Replace the value with the actual ID of the user profile you want to update.
*   **Body:** In the "Body" tab, select "raw" and "JSON" from the dropdown menus. Then, paste the following JSON into the text area:

```json
{
  "display_name": "Jane Smith Updated",
  "bio": "Marathon runner and fitness coach Updated"
}
```

### Delete User Profile

*   **Method:** `DELETE`
*   **URL:** `http://localhost:3000/user_profiles/:id`
*   **Params:** In the "Params" tab, you will see a path variable named `id`. Replace the value with the actual ID of the user profile you want to delete.

---

## User Settings

### Create User Setting

*   **Method:** `POST`
*   **URL:** `http://localhost:3000/user_settings`
*   **Body:**

```json
{
  "user_id": "user123",
  "settings_key": "notifications",
  "settings_value": {
    "email_enabled": true,
    "push_enabled": true,
    "workout_reminders": true,
    "meal_reminders": false
  }
}
```

### Get All User Settings

*   **Method:** `GET`
*   **URL:** `http://localhost:3000/user_settings`

### Get User Setting by ID

*   **Method:** `GET`
*   **URL:** `http://localhost:3000/user_settings/:id`
*   **Params:** Set the `id` path variable.

### Update User Setting

*   **Method:** `PUT`
*   **URL:** `http://localhost:3000/user_settings/:id`
*   **Params:** Set the `id` path variable.
*   **Body:**

```json
{
  "settings_value": {
    "email_enabled": false,
    "push_enabled": false,
    "workout_reminders": false,
    "meal_reminders": false
  }
}
```

### Delete User Setting

*   **Method:** `DELETE`
*   **URL:** `http://localhost:3000/user_settings/:id`
*   **Params:** Set the `id` path variable.

---

## Workout Routines

### Create Workout Routine

*   **Method:** `POST`
*   **URL:** `http://localhost:3000/workout_routines`
*   **Body:**

```json
{
  "user_id": "user123",
  "name": "Morning Run",
  "description": "Easy recovery run",
  "exercises": [
    {
      "name": "Running",
      "duration_minutes": 30,
      "intensity": "easy"
    }
  ],
  "difficulty": "easy",
  "duration": 30,
  "calories_burned": 300,
  "tags": ["cardio", "running", "outdoor"],
  "is_suggested": false,
  "is_completed": true,
  "completed_at": "2025-11-17T14:07:24.830Z"
}
```

### Get All Workout Routines

*   **Method:** `GET`
*   **URL:** `http://localhost:3000/workout_routines`

### Get Workout Routine by ID

*   **Method:** `GET`
*   **URL:** `http://localhost:3000/workout_routines/:id`
*   **Params:** Set the `id` path variable.

### Update Workout Routine

*   **Method:** `PUT`
*   **URL:** `http://localhost:3000/workout_routines/:id`
*   **Params:** Set the `id` path variable.
*   **Body:**

```json
{
  "name": "Morning Run Updated",
  "description": "Easy recovery run Updated"
}
```

### Delete Workout Routine

*   **Method:** `DELETE`
*   **URL:** `http://localhost:3000/workout_routines/:id`
*   **Params:** Set the `id` path variable.

---

## AI Tasks

### Create AI Task

*   **Method:** `POST`
*   **URL:** `http://localhost:3000/ai_tasks`
*   **Body:**

```json
{
  "user_id": "user123",
  "title": "Complete 10,000 steps today",
  "description": "Based on your recent activity, aim for 10k steps",
  "task_type": "health_check",
  "priority": "medium",
  "status": "pending",
  "due_date": "2025-11-18T23:59:59Z"
}
```

### Get All AI Tasks

*   **Method:** `GET`
*   **URL:** `http://localhost:3000/ai_tasks`

### Get AI Task by ID

*   **Method:** `GET`
*   **URL:** `http://localhost:3000/ai_tasks/:id`
*   **Params:** Set the `id` path variable.

### Update AI Task

*   **Method:** `PUT`
*   **URL:** `http://localhost:3000/ai_tasks/:id`
*   **Params:** Set the `id` path variable.
*   **Body:**

```json
{
  "status": "completed"
}
```

### Delete AI Task

*   **Method:** `DELETE`
*   **URL:** `http://localhost:3000/ai_tasks/:id`
*   **Params:** Set the `id` path variable.

---

## Meal Plans

### Create Meal Plan

*   **Method:** `POST`
*   **URL:** `http://localhost:3000/meal_plans`
*   **Body:**

```json
{
  "user_id": "user123",
  "name": "High Protein Day",
  "description": "Macro-balanced meals for muscle building",
  "date": "2025-11-17",
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
        }
      ]
    }
  ],
  "total_calories": 190,
  "total_protein": 7,
  "total_carbs": 34,
  "total_fats": 3.5,
  "is_ai_generated": true
}
```

### Get All Meal Plans

*   **Method:** `GET`
*   **URL:** `http://localhost:3000/meal_plans`

### Get Meal Plan by ID

*   **Method:** `GET`
*   **URL:** `http://localhost:3000/meal_plans/:id`
*   **Params:** Set the `id` path variable.

### Update Meal Plan

*   **Method:** `PUT`
*   **URL:** `http://localhost:3000/meal_plans/:id`
*   **Params:** Set the `id` path variable.
*   **Body:**

```json
{
  "name": "High Protein Day Updated"
}
```

### Delete Meal Plan

*   **Method:** `DELETE`
*   **URL:** `http://localhost:3000/meal_plans/:id`
*   **Params:** Set the `id` path variable.

---

## Recipes

### Create Recipe

*   **Method:** `POST`
*   **URL:** `http://localhost:3000/recipes`
*   **Body:**

```json
{
  "user_id": "user123",
  "name": "High Protein Pancakes",
  "description": "Delicious protein-packed breakfast",
  "ingredients": [
    {
      "name": "Oat Flour",
      "quantity": 100,
      "unit": "g"
    }
  ],
  "instructions": [
    "Mix all dry ingredients in a bowl"
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
  "is_favorite": false
}
```

### Get All Recipes

*   **Method:** `GET`
*   **URL:** `http://localhost:3000/recipes`

### Get Recipe by ID

*   **Method:** `GET`
*   **URL:** `http://localhost:3000/recipes/:id`
*   **Params:** Set the `id` path variable.

### Update Recipe

*   **Method:** `PUT`
*   **URL:** `http://localhost:3000/recipes/:id`
*   **Params:** Set the `id` path variable.
*   **Body:**

```json
{
  "name": "High Protein Pancakes Updated"
}
```

### Delete Recipe

*   **Method:** `DELETE`
*   **URL:** `http://localhost:3000/recipes/:id`
*   **Params:** Set the `id` path variable.

---

## Chat Sessions

### Create Chat Session

*   **Method:** `POST`
*   **URL:** `http://localhost:3000/chat_sessions`
*   **Body:**

```json
{
  "user_id": "user123",
  "title": "Workout Plan Discussion"
}
```

### Get All Chat Sessions

*   **Method:** `GET`
*   **URL:** `http://localhost:3000/chat_sessions`

### Get Chat Session by ID

*   **Method:** `GET`
*   **URL:** `http://localhost:3000/chat_sessions/:id`
*   **Params:** Set the `id` path variable.

### Update Chat Session

*   **Method:** `PUT`
*   **URL:** `http://localhost:3000/chat_sessions/:id`
*   **Params:** Set the `id` path variable.
*   **Body:**

```json
{
  "title": "Workout Plan Discussion Updated"
}
```

### Delete Chat Session

*   **Method:** `DELETE`
*   **URL:** `http://localhost:3000/chat_sessions/:id`
*   **Params:** Set the `id` path variable.

---

## Chat Messages

### Create Chat Message

*   **Method:** `POST`
*   **URL:** `http://localhost:3000/chat_messages`
*   **Body:**

```json
{
  "session_id": "some_session_id",
  "user_id": "user123",
  "role": "user",
  "content": "Can you suggest a workout plan for beginners?"
}
```

### Get All Chat Messages

*   **Method:** `GET`
*   **URL:** `http://localhost:3000/chat_messages`

### Get Chat Message by ID

*   **Method:** `GET`
*   **URL:** `http://localhost:3000/chat_messages/:id`
*   **Params:** Set the `id` path variable.

### Update Chat Message

*   **Method:** `PUT`
*   **URL:** `http://localhost:3000/chat_messages/:id`
*   **Params:** Set the `id` path variable.
*   **Body:**

```json
{
  "content": "Can you suggest a workout plan for intermediate users?"
}
```

### Delete Chat Message

*   **Method:** `DELETE`
*   **URL:** `http://localhost:3000/chat_messages/:id`
*   **Params:** Set the `id` path variable.

---

## Health Data

### Create Health Data

*   **Method:** `POST`
*   **URL:** `http://localhost:3000/health_data`
*   **Body:**

```json
{
  "user_id": "user123",
  "date": "2025-11-17",
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
  "blood_pressure_diastolic": 80
}
```

### Get All Health Data

*   **Method:** `GET`
*   **URL:** `http://localhost:3000/health_data`

### Get Health Data by ID

*   **Method:** `GET`
*   **URL:** `http://localhost:3000/health_data/:id`
*   **Params:** Set the `id` path variable.

### Update Health Data

*   **Method:** `PUT`
*   **URL:** `http://localhost:3000/health_data/:id`
*   **Params:** Set the `id` path variable.
*   **Body:**

```json
{
  "steps": 9000
}
```

### Delete Health Data

*   **Method:** `DELETE`
*   **URL:** `http://localhost:3000/health_data/:id`
*   **Params:** Set the `id` path variable.

---

## AI Suggestions

### Create AI Suggestion

*   **Method:** `POST`
*   **URL:** `http://localhost:3000/ai_suggestions`
*   **Body:**

```json
{
  "user_id": "user123",
  "suggestion_type": "workout",
  "title": "Increase Cardio Sessions",
  "content": "Based on your heart rate data, adding 2 more cardio sessions per week could improve cardiovascular health.",
  "priority": "medium",
  "is_read": false,
  "is_acted_upon": false,
  "expires_at": "2025-11-24T10:30:00Z"
}
```

### Get All AI Suggestions

*   **Method:** `GET`
*   **URL:** `http://localhost:3000/ai_suggestions`

### Get AI Suggestion by ID

*   **Method:** `GET`
*   **URL:** `http://localhost:3000/ai_suggestions/:id`
*   **Params:** Set the `id` path variable.

### Update AI Suggestion

*   **Method:** `PUT`
*   **URL:** `http://localhost:3000/ai_suggestions/:id`
*   **Params:** Set the `id` path variable.
*   **Body:**

```json
{
  "is_read": true
}
```

### Delete AI Suggestion

*   **Method:** `DELETE`
*   **URL:** `http://localhost:3000/ai_suggestions/:id`
*   **Params:** Set the `id` path variable.

---

## Simple Sign-on

### Register

*   **Method:** `POST`
*   **URL:** `http://localhost:3000/register`
*   **Body:**

```json
{
  "username": "testuser",
  "password": "password123"
}
```

### Login

*   **Method:** `POST`
*   **URL:** `http://localhost:3000/login`
*   **Body:**

```json
{
  "username": "testuser",
  "password": "password123"
}
```
