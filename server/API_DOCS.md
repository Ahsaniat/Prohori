# ShasthoHive Backend API Documentation

**Base URL:** `http://localhost:5000/api`

## Authentication
All endpoints (except Register and Login) require a valid JWT token.
**Header:** `Authorization: Bearer <your_token>`

---

## 🔐 Auth

### Register User
*   **Endpoint:** `POST /auth/register`
*   **Body:**
    ```json
    {
      "name": "Anik Ahsan",
      "email": "anik.ahsan@gmail.com",
      "password": "password123"
    }
    ```
*   **Response:** `201 Created` (Returns User object + Token)

### Login User
*   **Endpoint:** `POST /auth/login`
*   **Body:**
    ```json
    {
      "email": "anik.ahsan@gmail.com",
      "password": "password123"
    }
    ```
*   **Response:** `200 OK` (Returns User object + Token)

### Get Current User
*   **Endpoint:** `GET /auth/me`
*   **Response:** `200 OK` (Returns User details)

---

## 👤 User Profile & Settings

### Get Profile
*   **Endpoint:** `GET /user/profile`
*   **Response:** `200 OK`

### Update Profile
*   **Endpoint:** `PUT /user/profile`
*   **Body:**
    ```json
    {
      "display_name": "Anik",
      "height": 175,
      "weight": 70,
      "age": 25,
      "fitness_level": "Intermediate",
      "goals": ["Build Muscle", "Lose Fat"]
    }
    ```
*   **Response:** `200 OK`

### Get Settings
*   **Endpoint:** `GET /user/settings`
*   **Response:** `200 OK` (List of settings)

### Update Setting
*   **Endpoint:** `POST /user/settings`
*   **Body:**
    ```json
    {
      "key": "dark_mode",
      "value": true
    }
    ```
*   **Response:** `201 Created`

---

## ❤️ Health Data

### Get Health Data
*   **Endpoint:** `GET /user/health`
*   **Query Params:** `?date=YYYY-MM-DD` (Optional)
*   **Response:** `200 OK` (List of health logs)

### Add Health Log
*   **Endpoint:** `POST /user/health`
*   **Body:**
    ```json
    {
      "steps": 8500,
      "water_intake": 2000,
      "sleep_hours": 7.5,
      "calories_burned": 400
    }
    ```
*   **Response:** `201 Created`

### Update Health Log
*   **Endpoint:** `PUT /user/health/:id`
*   **Body:** (Partial update allowed)
    ```json
    {
      "steps": 9000
    }
    ```
*   **Response:** `200 OK`

### Delete Health Log
*   **Endpoint:** `DELETE /user/health/:id`
*   **Response:** `200 OK`

---

## 🥗 Meals & Recipes

### Get Meal Plans
*   **Endpoint:** `GET /meals/plans`
*   **Response:** `200 OK`

### Create Meal Plan
*   **Endpoint:** `POST /meals/plans`
*   **Body:**
    ```json
    {
      "name": "Monday Power Boost",
      "date": "2023-10-27",
      "total_calories": 2500,
      "meals": [
        {
          "type": "Breakfast",
          "name": "Oatmeal",
          "items": [
            { "name": "Oats", "calories": 150, "protein": 5 }
          ]
        }
      ]
    }
    ```
*   **Response:** `201 Created`

### Get Meal Plan by ID
*   **Endpoint:** `GET /meals/plans/:id`
*   **Response:** `200 OK`

### Update Meal Plan
*   **Endpoint:** `PUT /meals/plans/:id`
*   **Body:** (Partial update allowed)
    ```json
    {
      "total_calories": 2600
    }
    ```
*   **Response:** `200 OK`

### Delete Meal Plan
*   **Endpoint:** `DELETE /meals/plans/:id`
*   **Response:** `200 OK`

### Get Recipes
*   **Endpoint:** `GET /meals/recipes`
*   **Response:** `200 OK`

### Create Recipe
*   **Endpoint:** `POST /meals/recipes`
*   **Body:**
    ```json
    {
      "name": "Chicken Salad",
      "ingredients": [{ "name": "Chicken", "quantity": 100, "unit": "g" }],
      "calories": 300,
      "prep_time": 10
    }
    ```
*   **Response:** `201 Created`

### Update Recipe
*   **Endpoint:** `PUT /meals/recipes/:id`
*   **Body:**
    ```json
    {
      "calories": 350
    }
    ```
*   **Response:** `200 OK`

### Delete Recipe
*   **Endpoint:** `DELETE /meals/recipes/:id`
*   **Response:** `200 OK`

---

## 💪 Workouts

### Get Workouts
*   **Endpoint:** `GET /workouts`
*   **Response:** `200 OK`

### Create Workout
*   **Endpoint:** `POST /workouts`
*   **Body:**
    ```json
    {
      "name": "Full Body HIIT",
      "difficulty": "Hard",
      "duration": 45,
      "exercises": [
        { "name": "Burpees", "sets": 3, "reps": 15 }
      ]
    }
    ```
*   **Response:** `201 Created`

### Get Workout by ID
*   **Endpoint:** `GET /workouts/:id`
*   **Response:** `200 OK`

### Update Workout
*   **Endpoint:** `PUT /workouts/:id`
*   **Body:**
    ```json
    {
      "duration": 50
    }
    ```
*   **Response:** `200 OK`

### Delete Workout
*   **Endpoint:** `DELETE /workouts/:id`
*   **Response:** `200 OK`

---

## 🤖 Chat & AI

### Get Chat Sessions
*   **Endpoint:** `GET /chat/sessions`
*   **Response:** `200 OK`

### Create Chat Session
*   **Endpoint:** `POST /chat/sessions`
*   **Body:**
    ```json
    {
      "title": "Diet Advice"
    }
    ```
*   **Response:** `201 Created`

### Update Chat Session
*   **Endpoint:** `PUT /chat/sessions/:id`
*   **Body:**
    ```json
    {
      "title": "Updated Diet Advice"
    }
    ```
*   **Response:** `200 OK`

### Delete Chat Session
*   **Endpoint:** `DELETE /chat/sessions/:id`
*   **Response:** `200 OK`

### Get Messages
*   **Endpoint:** `GET /chat/sessions/:sessionId/messages`
*   **Response:** `200 OK`

### Send Message
*   **Endpoint:** `POST /chat/sessions/:sessionId/messages`
*   **Body:**
    ```json
    {
      "content": "Can you suggest a high protein breakfast?",
      "role": "user"
    }
    ```
*   **Response:** `201 Created`

### Get AI Tasks
*   **Endpoint:** `GET /ai/tasks`
*   **Response:** `200 OK`

### Update AI Task
*   **Endpoint:** `PUT /ai/tasks/:id`
*   **Body:**
    ```json
    {
      "status": "completed"
    }
    ```
*   **Response:** `200 OK`

### Delete AI Task
*   **Endpoint:** `DELETE /ai/tasks/:id`
*   **Response:** `200 OK`

### Get AI Suggestions
*   **Endpoint:** `GET /ai/suggestions`
*   **Response:** `200 OK`

### Update AI Suggestion
*   **Endpoint:** `PUT /ai/suggestions/:id`
*   **Body:**
    ```json
    {
      "is_read": true
    }
    ```
*   **Response:** `200 OK`

### Delete AI Suggestion
*   **Endpoint:** `DELETE /ai/suggestions/:id`
*   **Response:** `200 OK`

---

## 🧪 Testing with Postman

1.  **Create a Collection:** Create a new collection named "ShasthoHive API".
2.  **Set Variables:**
    *   Create a variable `baseUrl` with value `http://localhost:5000/api`.
    *   Create a variable `token`.
3.  **Login Request:**
    *   Create a `POST` request to `{{baseUrl}}/auth/login`.
    *   In the **Tests** tab of this request, add the following script to automatically save the token:
        ```javascript
        var jsonData = pm.response.json();
        pm.collectionVariables.set("token", jsonData.token);
        ```
4.  **Authenticated Requests:**
    *   For any other request (e.g., `GET {{baseUrl}}/user/profile`), go to the **Authorization** tab.
    *   Select **Type:** `Bearer Token`.
    *   Set **Token:** `{{token}}`.
    *   This will automatically use the token from your successful login.