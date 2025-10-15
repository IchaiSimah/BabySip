# BabySip - Baby Bottle Tracker

A React Native application for tracking baby feeding and diaper changes with real-time synchronization across multiple devices. Built with Expo, TypeScript, and a hybrid local/cloud architecture.

**Created by Ichai SIMAH**

## Overview

BabySip is a baby tracking application designed for parents and caregivers to monitor feeding schedules and diaper changes. The app provides offline-first functionality with real-time synchronization when connected.

### Features

- **Bottle Tracking**: Record feeding times, amounts, and custom colors
- **Diaper Change Logging**: Track diaper changes with optional notes
- **Dashboard Analytics**: View daily summaries and statistics
- **Multi-language Support**: Available in English, French, and Hebrew
- **Offline-First**: Works without internet connection
- **Real-time Sync**: Instant updates across all connected devices
- **Customizable Interface**: Personalized colors and settings

## Technical Stack

- **Frontend**: React Native with Expo SDK 54
- **Language**: TypeScript
- **Navigation**: Expo Router
- **State Management**: React Context API
- **Database**: SQLite (local) + PostgreSQL (cloud)
- **Authentication**: JWT-based
- **Real-time**: WebSocket connections
- **Styling**: Unified design system

## Project Structure

```
BabySip/
├── app/                    # Expo Router screens
├── components/            # Reusable UI components
├── services/              # Business logic layer
├── utils/                 # Utilities and contexts
├── styles/                # Design system
└── backend/              # Node.js API server
```

## Hybrid Synchronization

The core innovation is a sophisticated hybrid synchronization system that ensures data consistency across devices while maintaining offline functionality.

### Architecture

- **Local-First Operations**: All data operations happen locally first
- **Background Sync**: Changes are queued and synchronized when online
- **Real-time Updates**: WebSocket connections provide instant updates
- **Conflict Resolution**: Timestamp-based conflict resolution
- **Offline Resilience**: Full functionality without internet connection

### Key Components

- **DatabaseService.ts**: Local SQLite operations with sync queue
- **RealTimeSyncService.ts**: WebSocket management and message broadcasting
- **SyncService.ts**: Bidirectional sync with conflict resolution

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Expo CLI
- PostgreSQL (for backend)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd BabySip
   ```

2. Install dependencies:
   ```bash
   npm install
   cd backend && npm install
   ```

3. Configure environment:
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env with your database credentials
   ```

4. Start the backend:
   ```bash
   cd backend
   npm run dev
   ```

5. Start the mobile app:
   ```bash
   npm start
   ```

## Development

### Code Organization

- **Services**: Business logic and data management
- **Components**: Reusable UI components
- **Utils**: Helper functions and contexts
- **Styles**: Centralized design system

### Best Practices

- TypeScript strict typing
- Comprehensive error handling
- Performance optimization with React.memo
- Inline code documentation

## Deployment

### Mobile App
```bash
eas build --platform all
eas submit --platform all
```

### Backend
```bash
cd backend
npm install --production
npm start
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.