# BBT Backend API

Backend API for the BBT (Baby Bottle Tracker) application with shared groups functionality.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure database:**
   - Create a PostgreSQL database named `bbt_app`
   - Update database credentials in `config.js` or set environment variables

3. **Start the server:**
   ```bash
   # Development mode (with auto-reload)
   npm run dev
   
   # Production mode
   npm start
   ```

## 📡 API Endpoints

### Authentication (`/api/auth`)

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "parent1",
  "email": "parent1@example.com",
  "password": "securepassword123"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "parent1",
  "password": "securepassword123"
}
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <jwt_token>
```

### Groups (`/api/groups`)

#### Create Group
```http
POST /api/groups
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Family Group",
  "description": "Our family baby tracking",
  "isShared": true
}
```

#### Get User Groups
```http
GET /api/groups
Authorization: Bearer <jwt_token>
```

#### Get Group Details
```http
GET /api/groups/:groupId
Authorization: Bearer <jwt_token>
```

#### Update Group
```http
PUT /api/groups/:groupId
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Updated Group Name",
  "description": "Updated description",
  "isShared": false
}
```

#### Delete Group
```http
DELETE /api/groups/:groupId
Authorization: Bearer <jwt_token>
```

#### Add Member
```http
POST /api/groups/:groupId/members
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "userId": 2,
  "role": "member"
}
```

#### Remove Member
```http
DELETE /api/groups/:groupId/members/:userId
Authorization: Bearer <jwt_token>
```

### Bottles (`/api/bottles`)

#### Add Bottle
```http
POST /api/bottles
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "groupId": 1,
  "amount": 120,
  "time": "2024-01-15T10:30:00Z",
  "color": "#FF6B6B"
}
```

#### Get Group Bottles
```http
GET /api/bottles/group/:groupId?limit=50&offset=0
Authorization: Bearer <jwt_token>
```

#### Get Today's Bottles
```http
GET /api/bottles/group/:groupId/today
Authorization: Bearer <jwt_token>
```

#### Update Bottle
```http
PUT /api/bottles/:bottleId
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "amount": 150,
  "time": "2024-01-15T10:30:00Z",
  "color": "#4ECDC4"
}
```

#### Delete Bottle
```http
DELETE /api/bottles/:bottleId
Authorization: Bearer <jwt_token>
```

#### Get Statistics
```http
GET /api/bottles/group/:groupId/stats?period=7d
Authorization: Bearer <jwt_token>
```

## 🗄️ Database Schema

### Users
- `id` (SERIAL PRIMARY KEY)
- `username` (VARCHAR(50) UNIQUE)
- `email` (VARCHAR(100) UNIQUE)
- `password_hash` (VARCHAR(255))
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Groups
- `id` (SERIAL PRIMARY KEY)
- `name` (VARCHAR(100))
- `description` (TEXT)
- `owner_id` (INTEGER REFERENCES users(id))
- `is_shared` (BOOLEAN)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Group Members
- `id` (SERIAL PRIMARY KEY)
- `group_id` (INTEGER REFERENCES groups(id))
- `user_id` (INTEGER REFERENCES users(id))
- `role` (VARCHAR(20)) - 'owner', 'admin', 'member'
- `joined_at` (TIMESTAMP)

### Bottles
- `id` (SERIAL PRIMARY KEY)
- `group_id` (INTEGER REFERENCES groups(id))
- `user_id` (INTEGER REFERENCES users(id))
- `amount` (INTEGER)
- `time` (TIMESTAMP)
- `color` (VARCHAR(7))
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Poops
- `id` (SERIAL PRIMARY KEY)
- `group_id` (INTEGER REFERENCES groups(id))
- `user_id` (INTEGER REFERENCES users(id))
- `time` (TIMESTAMP)
- `info` (TEXT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## 🔧 Configuration

Update `config.js` or set environment variables:

```javascript
{
  PORT: 3000,
  DB_HOST: 'localhost',
  DB_PORT: 5432,
  DB_NAME: 'bbt_app',
  DB_USER: 'postgres',
  DB_PASSWORD: 'your_password',
  JWT_SECRET: 'your-super-secret-jwt-key',
  JWT_EXPIRES_IN: '7d'
}
```

## 🧪 Testing

### Health Check
```http
GET /health
```

### API Status
```http
GET /
```

## 📝 Notes

- All timestamps are in ISO 8601 format
- JWT tokens expire after 7 days by default
- Group owners have full control over their groups
- Bottle colors are stored as hex values (e.g., "#FF6B6B")
- Statistics support 7d, 30d, and 90d periods 