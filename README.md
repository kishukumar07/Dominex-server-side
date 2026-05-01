# Dominex — Backend

> Social media platform backend built with Node.js, Socket.io, and MongoDB.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js (ESM) |
| Framework | Express.js |
| Database | MongoDB + Mongoose |
| Real-time | Socket.io |
| Auth | JWT + Bcrypt |
| Media | Cloudinary + Multer |
| Email | Nodemailer (Gmail / Mailtrap) |
| AI Bot | Gemini AI / OpenAI (switchable) |

---

## Features

- JWT authentication with OTP email verification
- Follow / unfollow system with mutual follow enforcement for chat
- Posts with image upload, likes, and nested comments
- Stories with viewer tracking
- Real-time chat between users (mutual follow required)
- AI bot chat powered by Gemini or OpenAI
- Cloudinary media upload for posts and stories
- Paginated feeds and message history

---

## Project Structure

```
src/
  chatBot/
    botLogic_geminiAi.js      # Gemini AI response logic
    botLogic_OpenAi.js        # OpenAI response logic
    botProvider.js            # Provider switch via AI_PROVIDER env
  config/
    cloudinary.config.js      # Cloudinary setup
    db.js                     # MongoDB connection
  controllers/
    authController.js
    userController.js
    postController.js
    storyController.js
    commentController.js
    followController.js
    msgController.js
  middlewares/
    auth.middleware.js        # JWT verification
    multer.middleware.js      # File upload handling
  models/
    user.models.model.js
    post.models.model.js
    story.models.model.js
    comment.models.model.js
    message.models.model.js
  routes/
    authRoute.js
    userRoute.js
    postRoute.js
    StoryRoute.js
    commentRoute.js
    followRoute.js
    msgRoute.js
  services/
    message.service.js        # Shared messaging logic (HTTP + Socket)
  sockets/
    socket.js                 # Real-time chat handler
  utils/
    auth/
      generateOtp.js
      token.js
    mail/
      mailer.js
      templates/
    media/
      Upload.on.Cloudinary.js
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)
- Cloudinary account
- Gmail account with App Password enabled
- Gemini or OpenAI API key

### Installation

```bash
git clone https://github.com/kishukumar07/Dominex-server-side.git
cd Dominex-server-side
npm install
```

### Environment Setup

```bash
cp .env.sample .env
```

Fill in your `.env` values:

```env
PORT=4500
MONGO_URI=mongodb://localhost:27017/dominex
JWT_SECRET=your_jwt_secret_here

EMAIL_PROVIDER=gmail
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
UPLOAD_DIR=./public/temp

AI_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_key
OPENAI_API_KEY=your_openai_key

BOT_USER_ID=your_bot_user_objectid
ALLOWED_ORIGIN=http://localhost:3000
```

### Run

```bash
# Development
npm run dev

# Production
npm start
```

---

## API Overview

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register + send OTP |
| POST | `/api/auth/verify` | Verify OTP |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |

### Users
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/user/:id` | Get user profile |
| PATCH | `/api/user/update` | Update profile |

### Posts
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/post` | Get all posts (paginated) |
| POST | `/api/post/create` | Create post |
| GET | `/api/post/user/:userId` | Get user posts |
| GET | `/api/post/:id` | Get post by ID |
| PATCH | `/api/post/:id` | Update post |
| DELETE | `/api/post/:id` | Delete post |

### Stories
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/story/create` | Create story |
| GET | `/api/story/user/:userId` | Get user stories |
| PATCH | `/api/story/:id` | Mark story as viewed |
| DELETE | `/api/story/:id` | Delete story |

### Messages
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/messages/:userId1/:userId2` | Get conversation history |

### Follow
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/follow/:id` | Follow user |
| POST | `/api/unfollow/:id` | Unfollow user |

---

## Real-time Socket Events

| Event | Direction | Description |
|---|---|---|
| `joinRoom` | Client → Server | Join a chat room |
| `roomJoined` | Server → Client | Confirm room joined |
| `oldMessages` | Server → Client | Load recent messages |
| `sendMessage` | Client → Server | Send a message |
| `receiveMessage` | Server → Client | Receive a message |
| `loadMore` | Client → Server | Load older messages (scroll up) |
| `olderMessages` | Server → Client | Paginated older messages |
| `error` | Server → Client | Error response |

---

## AI Bot

Switch between Gemini and OpenAI with a single env variable:

```env
AI_PROVIDER=gemini   # or openai
```

No code changes needed. The bot is accessible as a special user in the chat system.

---

## Environment Variables Reference

See `.env.sample` for the full list with descriptions.

---

## Author

**Kishu Kumar**
- GitHub: [@kishukumar07](https://github.com/kishukumar07)

---

## Status

Backend complete. Frontend in progress.
