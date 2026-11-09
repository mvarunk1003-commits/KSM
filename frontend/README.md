# 🕉️ Kolar Shankara Mutt - Full Stack Website

A modern, bilingual website for the Kolar Shankara Mutt, featuring a traditional spiritual design inspired by sringeri.net.

## 🌟 Features

### **Frontend (React.js)**
- **Traditional Design**: Brown/gold color scheme with spiritual aesthetics
- **Responsive Layout**: Works perfectly on desktop, tablet, and mobile
- **Bilingual Support**: Kannada and English content
- **Modern UI/UX**: Clean, intuitive interface with smooth animations

### **Admin Dashboard**
- **Secure Authentication**: Protected admin panel with session management
- **Content Management**: Add, edit, and delete activities and announcements
- **Image Upload**: Support for multiple image uploads
- **Message Management**: View and manage contact form submissions
- **Site Settings**: Customize site appearance and branding

### **Key Pages**
1. **Home Page**: Welcome section, recent activities, announcements, contact form
2. **Activities**: Detailed view of all spiritual and cultural activities
3. **Announcements**: Important updates and news
4. **Contact**: Contact form with validation
5. **Admin Panel**: Comprehensive content management system

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Backend server running on port 5000

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Admin Panel: http://localhost:3000/admin
   - Login: http://localhost:3000/login

## 🔐 Admin Access

### Login Credentials
- **Username**: `admin`
- **Password**: `KolarMutt2024!`

### Admin Features
- **Dashboard**: Overview of content statistics
- **Activities Management**: Add/edit/delete spiritual activities
- **Announcements**: Manage important announcements
- **Messages**: View contact form submissions
- **Settings**: Customize site appearance

## 🎨 Design System

### Color Palette
- **Primary Brown**: `#5a3e0c` - Traditional spiritual color
- **Gold Accent**: `#d4af37` - Sacred and auspicious
- **Cream Background**: `#f9f6f1` - Warm and welcoming
- **Muted Text**: `#7a6a52` - Readable secondary text

### Typography
- **Headings**: Noto Serif (traditional serif font)
- **Body Text**: Mukta (clean, readable sans-serif)

### Components
- **Cards**: Rounded corners with subtle shadows
- **Buttons**: Traditional styling with hover effects
- **Forms**: Clean, accessible form design
- **Navigation**: Intuitive tab-based admin interface

## 📱 Responsive Design

The website is fully responsive and optimized for:
- **Desktop**: Full-featured experience
- **Tablet**: Optimized layout for medium screens
- **Mobile**: Touch-friendly interface

## 🔧 Technical Stack

### Frontend
- **React.js**: Modern UI framework
- **React Router**: Client-side routing
- **CSS3**: Custom styling with CSS variables
- **Google Fonts**: Noto Serif and Mukta fonts

### Backend Integration
- **RESTful API**: Communication with backend server
- **File Upload**: Image upload functionality
- **Authentication**: Session-based admin access

## 📁 Project Structure

```
src/
├── components/          # Reusable components
│   ├── Header.js       # Site header with navigation
│   ├── Footer.js       # Site footer
│   └── Navbar.js       # Navigation menu
├── pages/              # Main page components
│   ├── Home.js         # Home page with hero section
│   ├── Activities.js   # Activities listing page
│   ├── Announcements.js # Announcements page
│   ├── Contact.js      # Contact page
│   ├── Admin.js        # Admin dashboard
│   └── Login.js        # Admin login page
├── styles.css          # Main stylesheet
├── theme.css           # Theme variables
└── App.js              # Main application component
```

## 🛠️ Development

### Available Scripts
- `npm start`: Start development server
- `npm build`: Build for production
- `npm test`: Run tests
- `npm eject`: Eject from Create React App

### Code Style
- **ES6+**: Modern JavaScript features
- **Functional Components**: React hooks for state management
- **CSS Variables**: Consistent theming
- **Semantic HTML**: Accessible markup

## 🔒 Security Features

- **Session Management**: 24-hour admin sessions
- **Input Validation**: Form validation and sanitization
- **Secure Routes**: Protected admin routes
- **Error Handling**: Graceful error management

## 🌐 Deployment

### Production Build
```bash
npm run build
```

### Environment Variables
- `REACT_APP_API_BASE`: Backend API URL
- `REACT_APP_SITE_NAME`: Site name for branding

## 📞 Support

For technical support or questions:
- **Email**: admin@kolarshankaramutt.com
- **Phone**: +91 123 456 7890

## 🙏 Acknowledgments

- **Design Inspiration**: sringeri.net
- **Spiritual Guidance**: Kolar Shankara Mutt
- **Technical Stack**: React.js community

---

**🕉️ Om Namah Shivaya**  
*May this digital platform serve the spiritual community with devotion and excellence.*
