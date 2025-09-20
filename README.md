# kanban
Kanban implementation using Microsoft To-Do as the backend

## Setup

### 1. Create an Azure Entra App Registration

Before running the application, you need to create an app registration in Azure to enable Microsoft Graph API access:

1. **Go to Azure Portal**
   - Navigate to [Azure Portal](https://portal.azure.com)
   - Sign in with your Microsoft account

2. **Create App Registration**
   - Go to "Azure Active Directory" → "App registrations" → "New registration"
   - Set the following:
     - **Name**: `Kanban App` (or any name you prefer)
     - **Supported account types**: `Accounts in any organizational directory and personal Microsoft accounts`
     - **Redirect URI**: Select `Single-page application (SPA)` and enter `http://localhost:8080`
   - Click "Register"

3. **Copy the Application (client) ID**
   - After registration, you'll see the "Application (client) ID" on the Overview page
   - Copy this ID - you'll need it for configuration

4. **Configure API Permissions**
   - Go to "API permissions" → "Add a permission"
   - Select "Microsoft Graph" → "Delegated permissions"
   - Add these permissions:
     - `Tasks.ReadWrite`
     - `User.Read`
   - Click "Add permissions"

### 2. Configure the Application

1. **Update Client ID**
   - Open `js/config.js` in your code editor
   - Replace the `clientId` value with your Application (client) ID from step 3 above:
   ```javascript
   const config = {
       clientId: 'your-application-client-id-here',
       // ... rest of the configuration
   };
   ```

## How to Run

This is a Single Page Application (SPA) that runs entirely in the browser. Follow these steps to run it locally:

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- Python 3 (for local server) or any other local web server

### Steps

1. **Clone or download the repository**
   ```bash
   git clone <repository-url>
   cd kanban
   ```

2. **Start a local web server**
   
   Using Python 3:
   ```bash
   python3 -m http.server 8080
   ```
   
   Or using Python 2:
   ```bash
   python -m SimpleHTTPServer 8080
   ```
   
   Or using Node.js (if you have it installed):
   ```bash
   npx serve -s . -l 8080
   ```

3. **Open in your browser**
   Navigate to: `http://localhost:8080`

4. **Authenticate with Microsoft**
   - Click the login button to authenticate with your Microsoft account
   - Grant permissions to access your Microsoft To-Do data
   - Start using the kanban board!

### Note
This application requires a local web server (not just opening `index.html` directly) due to CORS restrictions when accessing Microsoft Graph API.
