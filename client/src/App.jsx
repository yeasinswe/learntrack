import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import PaymentPage from './pages/PaymentPage';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CourseLearn from './pages/CourseLearn';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <main className="flex-grow-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/dashboard" element={
            <ProtectedRoute role="user"><Dashboard /></ProtectedRoute>
          } />
          <Route path="/payment/:id" element={
            <ProtectedRoute role="user"><PaymentPage /></ProtectedRoute>
          } />
          <Route path="/learn/:id" element={
            <ProtectedRoute role="user"><CourseLearn /></ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute role="user"><Profile /></ProtectedRoute>
          } />

          <Route path="/admin/*" element={
            <ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>
          } />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function NotFound() {
  return (
    <div className="container py-5 text-center">
      <h1>404</h1>
      <p className="text-muted">Page not found.</p>
    </div>
  );
}
