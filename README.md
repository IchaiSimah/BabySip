# 🍼 BabySip - Baby Bottle Tracker

A comprehensive React Native application for tracking baby feeding and diaper changes, featuring real-time synchronization across multiple devices and users. Built with Expo, TypeScript, and a hybrid local/cloud architecture.

**Created by Ichai SIMAH**

## 📱 Application Overview

BabySip is a modern baby tracking application designed for parents and caregivers to monitor feeding schedules and diaper changes. The app provides a seamless experience with offline-first functionality and real-time synchronization when connected.

### Key Features

- **🍼 Bottle Tracking**: Record feeding times, amounts, and custom colors
- **💩 Diaper Change Logging**: Track diaper changes with optional notes
- **📊 Dashboard Analytics**: View daily summaries and statistics
- **🌐 Multi-language Support**: Available in English, French, and Hebrew
- **📱 Offline-First**: Works without internet connection
- **⚡ Real-time Sync**: Instant updates across all connected devices
- **🎨 Customizable Interface**: Personalized colors and settings

### User Experience Flow

1. **Authentication**: Secure registration and login system
2. **Dashboard**: Central hub showing today's feeding summary and recent activity
3. **Quick Actions**: One-tap access to add bottles or diaper changes
4. **Settings**: Customize display preferences and default values
5. **Statistics**: View feeding patterns and trends over time

## 🏗️ Technical Architecture

### Technology Stack

- **Frontend**: React Native with Expo SDK 54
- **Language**: TypeScript for type safety
- **Navigation**: Expo Router with stack-based navigation
- **State Management**: React Context API with custom hooks
- **Database**: SQLite (local) + PostgreSQL (cloud)
- **Authentication**: JWT-based with secure token storage
- **Real-time**: WebSocket connections for instant synchronization
- **Styling**: Unified design system with centralized tokens

### Project Structure

```
BabySip/
├── app/                    # Expo Router screens
│   ├── _layout.tsx        # Root layout with providers
│   ├── index.tsx          # Dashboard (main screen)
│   ├── login.tsx          # Authentication screens
│   ├── register.tsx
│   ├── add-bottle.tsx     # Feature screens
│   ├── add-poop.tsx
│   ├── settings.tsx
│   └── stats.tsx
├── components/            # Reusable UI components
│   ├── DashboardScreen.tsx
│   ├── AddBottleScreen.tsx
│   ├── SettingsScreen.tsx
│   └── ui/               # Base UI components
├── services/             # Business logic layer
│   ├── AuthService.ts     # Authentication management
│   ├── DatabaseService.ts # Local database operations
│   ├── ApiService.ts     # Backend API communication
│   ├── SyncService.ts    # Data synchronization
│   └── RealTimeSyncService.ts # WebSocket management
├── utils/                # Utilities and contexts
│   ├── authContext.tsx   # Authentication context
│   ├── languageContext.tsx # Internationalization
│   ├── settingsContext.tsx # App settings
│   └── translations.ts   # Multi-language strings
├── styles/               # Design system
│   ├── theme.ts         # Design tokens
│   └── styles.ts        # Unified styles
└── backend/             # Node.js API server
    ├── server.js        # Express server with WebSocket
    ├── database.js      # PostgreSQL connection
    ├── routes/          # API endpoints
    └── config.js        # Environment configuration
```

## 🔄 Hybrid Synchronization Architecture

The core innovation of BabySip lies in its sophisticated hybrid synchronization system that ensures data consistency across devices while maintaining offline functionality.

### Architecture Overview

```mermaid
graph TB
    A[Mobile App] --> B[Local SQLite]
    A --> C[AuthService]
    C --> D[ApiService]
    D --> E[Backend API]
    E --> F[PostgreSQL]
    E --> G[WebSocket Server]
    G --> H[Real-time Sync]
    H --> A
    
    B --> I[Offline Operations]
    I --> J[Queue for Sync]
    J --> D
    
    K[Other Devices] --> G
    G --> K
```

### Synchronization Flow

1. **Local-First Operations**: All data operations happen locally first
2. **Background Sync**: Changes are queued and synchronized when online
3. **Real-time Updates**: WebSocket connections provide instant updates
4. **Conflict Resolution**: Timestamp-based conflict resolution
5. **Offline Resilience**: Full functionality without internet connection

### Key Components

#### DatabaseService.ts
- **Local Database Management**: SQLite operations with transaction support
- **Sync Queue**: Offline changes are queued for later synchronization
- **Event System**: Emits events for UI updates and sync triggers
- **Data Validation**: Ensures data integrity before storage

#### RealTimeSyncService.ts
- **WebSocket Management**: Maintains persistent connections
- **Message Broadcasting**: Sends updates to all connected devices
- **Device Identification**: Unique device IDs prevent self-sync loops
- **Connection Recovery**: Automatic reconnection on network changes

#### SyncService.ts
- **Bidirectional Sync**: Handles both upload and download operations
- **Conflict Resolution**: Merges changes based on timestamps
- **Batch Operations**: Groups multiple changes for efficiency
- **Error Handling**: Retry logic for failed operations

### Message System

The real-time synchronization uses a sophisticated message system:

```typescript
interface RealTimeMessage {
  type: 'BOTTLE_ADDED' | 'BOTTLE_UPDATED' | 'BOTTLE_DELETED' | 
        'POOP_ADDED' | 'POOP_UPDATED' | 'POOP_DELETED' | 
        'SYNC_REQUESTED';
  data: any;
  userId: number;
  groupId: number;
  timestamp: number;
  deviceId: string; // Prevents self-sync loops
}
```

### Synchronization States

1. **Online**: Real-time sync active, instant updates
2. **Offline**: Local operations only, queued for sync
3. **Syncing**: Background synchronization in progress
4. **Error**: Retry mechanism with exponential backoff

## 🎨 Design System Architecture

BabySip implements a sophisticated design system that ensures consistency and maintainability across the entire application.

### Design Tokens (theme.ts)

Centralized source of truth for all visual elements:

```typescript
export const colors = {
  primary: { main: '#297289', light: '#818CF8', dark: '#4F46E5' },
  secondary: { main: '#10B981', light: '#34D399', dark: '#059669' },
  neutral: { 50: '#F9FAFB', 100: '#F3F4F6', /* ... */ 900: '#111827' },
  status: { success: '#10B981', warning: '#F59E0B', error: '#EF4444' }
};

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 };
export const fontSize = { xs: 12, sm: 14, md: 16, lg: 18, xl: 20, xxl: 24 };
```

### Unified Styles (styles.ts)

All application styles in a single organized file:

- **Global Styles**: Containers, buttons, text, inputs
- **Component Styles**: Screen-specific styling
- **Utility Classes**: Helper styles for common patterns
- **Modal Styles**: Consistent modal appearance

### Benefits

- **Consistency**: All components use the same design tokens
- **Maintainability**: Change colors/spacing in one place
- **Performance**: StyleSheet.create optimization
- **Developer Experience**: Clear, organized, and predictable

## 🔐 Authentication & Security

### Authentication Flow

1. **Registration**: Secure user creation with email verification
2. **Login**: JWT token-based authentication
3. **Token Management**: Secure storage with automatic refresh
4. **Logout**: Complete cleanup of local data and connections

### Security Features

- **Password Hashing**: bcryptjs for secure password storage
- **JWT Tokens**: Secure, stateless authentication
- **Token Expiration**: Automatic token refresh mechanism
- **Data Encryption**: Sensitive data encrypted in local storage
- **WebSocket Security**: JWT verification for WebSocket connections

## 🌐 Multi-language Support

Comprehensive internationalization system supporting English, French, and Hebrew:

### Translation System

```typescript
export const translations = {
  en: { addBottle: 'Add Bottle', /* ... */ },
  fr: { addBottle: 'Ajouter Biberon', /* ... */ },
  he: { addBottle: 'הוסף בקבוק', /* ... */ }
};
```

### Features

- **Dynamic Language Switching**: Change language without app restart
- **RTL Support**: Right-to-left layout for Hebrew
- **Fallback System**: English fallback for missing translations
- **Context-aware**: Language context throughout the app

## 📊 Data Management

### Local Database Schema

```sql
-- Groups table
CREATE TABLE groups (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  users TEXT,
  time_difference INTEGER DEFAULT 0,
  bottles_to_show INTEGER DEFAULT 5,
  poops_to_show INTEGER DEFAULT 5,
  default_bottle_amount INTEGER DEFAULT 120
);

-- Bottles table
CREATE TABLE entries (
  id INTEGER PRIMARY KEY,
  group_id INTEGER,
  amount INTEGER NOT NULL,
  time TEXT NOT NULL,
  color TEXT DEFAULT '#297289',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Poops table
CREATE TABLE poop (
  id INTEGER PRIMARY KEY,
  group_id INTEGER,
  time TEXT NOT NULL,
  info TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### Cloud Database Schema

PostgreSQL backend with additional features:

- **User Management**: User accounts and authentication
- **Group Sharing**: Multi-user group collaboration
- **Audit Trail**: Change tracking and history
- **Scalability**: Optimized for multiple concurrent users

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Expo CLI
- PostgreSQL (for backend)
- iOS Simulator or Android Emulator (optional)

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd BabySip
   ```

2. **Install dependencies**:
   ```bash
   npm install
   cd backend && npm install
   ```

3. **Configure environment**:
   ```bash
   # Backend configuration
   cp backend/.env.example backend/.env
   # Edit backend/.env with your database credentials
   ```

4. **Start the backend**:
   ```bash
   cd backend
   npm run dev
   ```

5. **Start the mobile app**:
   ```bash
   npm start
   ```

6. **Run on device**:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app

### Quick Development Setup

```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Mobile App
npm start

# Terminal 3: Database (if needed)
# Start PostgreSQL service
```

## 🔧 Development Guidelines

### Code Organization

- **Services**: Business logic and data management
- **Components**: Reusable UI components
- **Utils**: Helper functions and contexts
- **Styles**: Centralized design system
- **Types**: TypeScript interfaces and types

### Best Practices

- **TypeScript**: Strict typing for all components
- **Error Handling**: Comprehensive error boundaries
- **Performance**: Optimized rendering with React.memo
- **Testing**: Unit tests for critical functions
- **Documentation**: Inline code documentation

### Adding New Features

1. **Define Types**: Create TypeScript interfaces
2. **Implement Service**: Add business logic
3. **Create Component**: Build UI component
4. **Add Navigation**: Update routing
5. **Test Sync**: Verify real-time synchronization
6. **Update Translations**: Add multi-language support

## 📱 Deployment

### Mobile App Deployment

```bash
# Build for production
eas build --platform all

# Submit to app stores
eas submit --platform all
```

### Backend Deployment

```bash
# Production build
cd backend
npm install --production

# Start production server
npm start
```

### Environment Variables

Required environment variables for production:

```bash
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Email (optional)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

## 🔍 Key Technical Decisions

### Why Hybrid Sync?

- **Offline Resilience**: App works without internet
- **Real-time Updates**: Instant synchronization when online
- **Data Integrity**: Conflict resolution prevents data loss
- **User Experience**: Seamless experience regardless of connectivity

### Why TypeScript?

- **Type Safety**: Prevents runtime errors
- **Developer Experience**: Better IDE support and autocomplete
- **Maintainability**: Easier refactoring and debugging
- **Team Collaboration**: Clear interfaces and contracts

### Why Expo?

- **Rapid Development**: Quick iteration and testing
- **Cross-platform**: Single codebase for iOS and Android
- **Rich Ecosystem**: Extensive library of native modules
- **Easy Deployment**: Simplified build and distribution

## 🎯 Future Enhancements

- **Push Notifications**: Feeding reminders and alerts
- **Analytics Dashboard**: Advanced statistics and trends
- **Daily Routine Tracking**: Customizable checklist for vitamins, medications, and other recurring tasks with completion tracking and reminders
- **Export Features**: Data export and backup
- **Dark Mode**: Theme switching capability

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**BabySip** - Making baby tracking simple, reliable, and collaborative. 🍼✨