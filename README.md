# ShasthoHive Mobile Client

This is the React Native mobile client for ShasthoHive, built with **Expo** and **NativeWind**.

##  How to Run

1.  **Install Dependencies:**
    ```bash
    cd client
    npm install
    ```

2.  **Start the App:**
    ```bash
    npx expo start --clear --port 8082
    ```

3.  **View the App:**
    *   **Mobile:** Scan the QR code with the **Expo Go** app.
    *   **Emulator:** Press `a` (Android) or `i` (iOS simulator).
    *   **Web:** Press `w`.

---

##  Simplified File Navigation Guide

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
