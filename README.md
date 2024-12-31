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
VITE_APPWRITE_ENDPOINT= # Appwrite API endpoint
VITE_APPWRITE_PROJECT_ID=     # Your Appwrite project ID
VITE_APPWRITE_DATABASE_ID=    # Your Appwrite database ID
VITE_APPWRITE_COLLECTION_ID=  # Your Appwrite collection ID
```

## Database Configuration

The application supports dynamic database selection through the user interface on auth pages. You can choose your preferred storage method during authentication:

### Option 1: Local IndexedDB

1. No additional configuration needed
2. Data is stored locally in the browser
3. Suitable for personal use or offline-first applications

### Option 2: Appwrite as backend

1. Requires proper Appwrite configuration in the .env file
2. Provides cloud storage and synchronization capabilities
3. Ensure your Appwrite instance is properly set up with:
   - A project created
   - Database and collection configured
   - Ensure your Appwrite instance is properly set up with:
      - A project created
      - Database and collection configured
      - Appropriate security rules and permissions

Note: Appwrite environment variables must be configured even if some users only use IndexedDB, as this enables others to choose Appwrite as their storage option.

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

- Dynamically initializes either IndexedDB or Appwrite backend based on user selection
- Handles user preferences synchronization
- Provides API instance throughout the application
