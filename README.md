# Node.js Server for Prohori-Clean_Launch

This is the backend server for the Shasthohive a Clean Launch for deployment, built with Node.js and Express.

## Deployment

This branch is configured for deployment on Vercel.

### Prerequisites

*   Node.js (LTS version recommended)
*   MongoDB Atlas connection string
*   Gemini API Key
*   Knock API Key (for notifications)

### Environment Variables

Ensure the following environment variables are set in your Vercel project settings:

*   `MONGO_URI`: Connection string for MongoDB.
*   `GEMINI_API_KEY`: API key for Google Gemini.
*   `KNOCK_API_KEY`: API key (sk) for Knock.app.
*   `PORT`: (Optional) Port to run the server on.

### Start Command

```bash
npm start
```
