# Store Rating Application

A full-stack web application that allows users to submit ratings for stores registered on the platform. Built with a modern tech stack featuring glassmorphism design and futuristic animations.

## 🚀 Tech Stack

**Backend:**
- Node.js with Express.js
- MongoDB Atlas (Database)
- JWT Authentication
- Bcrypt for password hashing
- Express Validator for input validation

**Frontend:**
- React.js with Vite
- React Router for navigation
- Framer Motion for animations
- React Hook Form with Yup validation
- Axios for API calls
- React Hot Toast for notifications
- Glassmorphism + Neon accent design

## 📋 Features

### User Roles & Functionalities

#### 🔧 System Administrator
- **Dashboard:** View total users, stores, and ratings
- **User Management:** Add, view, update, and delete users
- **Store Management:** Add, view, update, and delete stores
- **Filtering:** Filter users and stores by name, email, address, and role
- **Complete Access:** View all user details and ratings

#### 👤 Normal User
- **Registration:** Sign up with name, email, address, and password
- **Authentication:** Secure login/logout
- **Store Discovery:** View and search stores by name and address
- **Rating System:** Submit ratings (1-5) for stores
- **Rating Management:** View and modify submitted ratings
- **Profile Management:** Update password

#### 🏪 Store Owner
- **Authentication:** Secure login/logout
- **Dashboard:** View store analytics and ratings
- **Rating Analytics:** See average rating and user feedback
- **Profile Management:** Update password

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB Atlas account

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd store-rating-app/backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Configuration:**
   The `.env` file is already configured with:
   ```env
   PORT=4000
   MONGODB_URI=mongodb+srv://madhavmore23445_db_user:shyam123@cluster0.c9raukp.mongodb.net/store-rating-app?retryWrites=true&w=majority
   CORS_ORIGIN=http://localhost:5173
   JWT_SECRET=supersecretkey
   NODE_ENV=development
   ```

4. **Seed the database:**
   ```bash
   npm run seed
   ```

5. **Start the backend server:**
   ```bash
   npm run dev
   ```
   Server will run on http://localhost:4000

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd store-rating-app/frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the frontend development server:**
   ```bash
   npm run dev
   ```
   Application will run on http://localhost:5173

## 🔐 Demo Credentials

The application comes pre-seeded with demo accounts:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@example.com | Admin123! |
| **Store Owner** | owner@example.com | Owner123! |
| **Normal User** | user@example.com | User123! |

## 📊 Database Schema

### User Model
```javascript
{
  name: String (10-60 chars, required),
  email: String (unique, required),
  password: String (8-16 chars, uppercase + special char, required),
  address: String (max 400 chars, required),
  role: String (enum: 'admin', 'user', 'storeOwner', default: 'user'),
  storeId: ObjectId (ref: Store, for store owners),
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### Store Model
```javascript
{
  name: String (10-60 chars, required),
  email: String (unique, required),
  address: String (max 400 chars, required),
  ownerId: ObjectId (ref: User, required),
  averageRating: Number (0-5, calculated),
  totalRatings: Number (calculated),
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### Rating Model
```javascript
{
  userId: ObjectId (ref: User, required),
  storeId: ObjectId (ref: Store, required),
  rating: Number (1-5, integer, required),
  comment: String (max 500 chars, optional),
  createdAt: Date,
  updatedAt: Date
}
```

## 🎨 Design Features

### Glassmorphism Design
- Frosted glass effect with backdrop blur
- Transparent backgrounds with subtle borders
- Layered depth and visual hierarchy

### Neon Accents
- Cyan, purple, and pink neon colors
- Glowing effects on interactive elements
- Smooth color transitions

### Animations
- Framer Motion powered animations
- 3D button effects and hover states
- Smooth page transitions
- Loading spinners and feedback

### Responsive Design
- Mobile-first approach
- Tablet and desktop optimized
- Breakpoints: 768px (tablet), 1024px (desktop)

## 🔒 Form Validations

### User Registration
- **Name:** 10-60 characters
- **Email:** Valid email format
- **Password:** 8-16 characters, at least one uppercase letter and special character
- **Address:** Maximum 400 characters

### Store Management
- **Name:** 10-60 characters
- **Email:** Valid email format, unique
- **Address:** Maximum 400 characters

### Rating Submission
- **Rating:** Integer between 1-5
- **Comment:** Optional, maximum 500 characters

## 🚀 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get current user
- `PATCH /api/auth/password` - Update password
- `POST /api/auth/logout` - Logout

### Users (Admin only)
- `GET /api/users/dashboard/stats` - Dashboard statistics
- `POST /api/users` - Create user
- `GET /api/users` - Get all users (with filtering)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Soft delete user

### Stores
- `POST /api/stores` - Create store (Admin)
- `GET /api/stores` - Get all stores
- `GET /api/stores/:id` - Get store by ID
- `GET /api/stores/:id/dashboard` - Store dashboard (Owner)
- `PUT /api/stores/:id` - Update store (Admin)
- `DELETE /api/stores/:id` - Soft delete store (Admin)

### Ratings
- `POST /api/ratings` - Submit/update rating (User)
- `GET /api/ratings/store/:storeId/user` - Get user's rating for store
- `GET /api/ratings/store/:storeId` - Get all store ratings (Owner/Admin)
- `GET /api/ratings/user/my-ratings` - Get user's ratings
- `PUT /api/ratings/:id` - Update rating (User)
- `DELETE /api/ratings/:id` - Delete rating
- `GET /api/ratings/stats/overview` - Rating statistics (Admin)

## 🛡️ Security Features

- **JWT Authentication** with secure token storage
- **Password Hashing** using bcrypt with salt rounds
- **Role-based Authorization** with middleware protection
- **Input Validation** on both client and server side
- **CORS Configuration** for secure cross-origin requests
- **Environment Variables** for sensitive configuration

## 📱 User Experience

### Smooth Interactions
- Real-time form validation
- Loading states and feedback
- Toast notifications for user actions
- Responsive navigation with mobile menu

### Accessibility
- Semantic HTML structure
- Keyboard navigation support
- Screen reader friendly
- High contrast neon design for visibility

## 🔧 Development

### Available Scripts

**Backend:**
- `npm start` - Production server
- `npm run dev` - Development server with nodemon
- `npm run seed` - Seed database with sample data

**Frontend:**
- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run preview` - Preview production build

### Project Structure
```
store-rating-app/
├── backend/
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── middleware/      # Authentication & validation
│   ├── utils/           # Utilities & seeding
│   └── server.js        # Main server file
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── contexts/    # React contexts
│   │   └── styles/      # Global styles
│   └── public/          # Static assets
└── README.md
```

## 🚀 Deployment

### Backend Deployment
1. Set environment variables on your hosting platform
2. Install dependencies: `npm install`
3. Seed database: `npm run seed`
4. Start server: `npm start`

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy the `dist` folder to your static hosting service
3. Update API base URL if needed

## 🔮 Future Enhancements

- **Advanced Analytics:** Charts and graphs for rating trends
- **Email Notifications:** Alert system for new ratings
- **File Uploads:** Store images and user avatars
- **Social Features:** User reviews and comments
- **Mobile App:** React Native version
- **Real-time Updates:** WebSocket integration
- **Advanced Search:** Full-text search with filters
- **Multi-language Support:** Internationalization

## 📄 License

This project is created for demonstration purposes.

## 👥 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For support or questions, please refer to the demo credentials above to test different user roles and functionalities.

---

**Happy Rating! ⭐**
