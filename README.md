# Notes Taking

A web application for taking and managing notes with support for archiving, tagging, and customizable preferences. Built with Nuxt.js and supports both local IndexedDB storage (powered by Dexie.js) and Appwrite.

## Features

- Create, edit, and delete notes
- Archive and unarchive functionality
- Tag notes
- User preferences
  - Font customization
  - Dark/Light theme toggle
- Flexible storage options (Local IndexedDB or Appwrite as backend)

## Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- Appwrite instance (if using Appwrite as backend)

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd <repository-name>
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Configure environment variables:
Create a `.env` file in the root directory and add the following variables:

```env
# Required: Specify the database instance type
VITE_DB_INSTANCE=       # "indexeddb" or "appwrite"

# Required only if using Appwrite (VITE_DB_INSTANCE=appwrite)
VITE_APPWRITE_ENDPOINT= # Appwrite API endpoint
VITE_APPWRITE_PROJECT_ID=     # Your Appwrite project ID
VITE_APPWRITE_DATABASE_ID=    # Your Appwrite database ID
VITE_APPWRITE_COLLECTION_ID=  # Your Appwrite collection ID
```

## Database Configuration

### Option 1: Local IndexedDB
To use local storage with IndexedDB:
1. Set `VITE_DB_INSTANCE=indexeddb` in your `.env` file
2. No additional configuration needed

### Option 2: Appwrite as backend
To use Appwrite as your backend:
1. Set `VITE_DB_INSTANCE=appwrite` in your `.env` file
2. Configure all Appwrite-related environment variables
3. Ensure your Appwrite instance is properly set up with:
   - A project created
   - Database and collection configured
   - Appropriate security rules and permissions

## Development

Start the development server:
```bash
npm run dev -- -o
# or
yarn dev --open
```

## Building for Production

```bash
npm run build
# or
yarn build
```

## API Plugin

The application uses a plugin system to handle API initialization and user preferences. The API plugin:
- Initializes either IndexedDB or Appwrite backend based on configuration
- Handles user preferences synchronization
- Provides API instance throughout the application
