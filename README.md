# ShasthoHive Mobile Client

This is the React Native mobile client for ShasthoHive, built with **Expo** and **NativeWind**.
##  Prerequisites:
1. Install Expo,
2. Configure FCM, Google Service key from firebase
3. Configure integration in Knock.app for expo push notification and in app notification
4. Create workflow in knock.app
5. Edit eas.json env with channel id and public key from kncok.app Platform/API keys
6. Edit the .env file with creds as setp 5

##  How to Run

1.  **Install Dependencies:**
    ```bash
    cd client
    npm install
    ```

2.  **Start the App:**
    - To work on a development build, install the development build from our github releases. In any case of you are adding a new package, the features and implementation tied to that package will not become available untill you are re-building          the entire app.
    ```bash
    npx expo start --clear --port 8082 --dev-client
    ```
    - If you are just interested to try out our app then go ahead and download an alpha release from our repository and install it in your phone.

4.  **View the App (for development only):**
    *   **Mobile:** Scan the QR code with the **Expo Go** app or use our development build app to scan the QR .
    *   **Emulator:** Press `a` (Android) or `i` (iOS simulator). To open an android simulation make sure you have adb and java sdk installed. You can also use adb reverse proxy to connect app via usb.
    *   **Web:** Press `w`.

---
5. Set EDGE_PATH environment variable with your browser executable path (In linux, usually under /usr/bin/{any-chromium-based-browser-name-you-are-using}) if you want react dev tools before starting the app. Open with pressing j while app on start.
## File Navigation Guide

Here is a quick breakdown of where everything lives:

### **`app/` (Screens & Routing)**
This folder handles the navigation. Files created here become routes automatically.
*   **`_layout.tsx`**: The main entry point. It sets up the navigation stacks and global theme.
*   **`index.tsx`**: The root route. Currently redirects users to the Login screen.
*   **`(tabs)/`**: Contains screens that appear in the **Bottom Navigation Bar**.
    *   `home.tsx`, `meal.tsx`, `workout.tsx`, `chat.tsx`, `settings.tsx`
*   **`screens/`**: Contains standalone, full-screen pages.
    *   `login.tsx`: The authentication screen.
    *   `personal-info.tsx` & `notifications.tsx`: Sub-pages accessed from Settings.

### **`components/` (UI Elements)**
Reusable code blocks to keep screens clean.
*   **`ui/`**: Generic, small components.
    *   `Button.tsx`: Custom styled buttons (supports primary, secondary, outline).
    *   `Input.tsx`: Styled text input fields.
*   **`ScreenWrapper.tsx`**: A wrapper that handles safe areas (notches/status bars) and background colors consistently.

### **`hooks/` (Logic)**
*   **`use-color-scheme.ts`**: Helper to manage Light/Dark mode switching.

### **Configuration**
*   **`global.css`**: The main CSS file where Tailwind directives are imported.
*   **`tailwind.config.js`**: Configuration for colors, fonts, and style paths.
