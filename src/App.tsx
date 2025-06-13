import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ServiceProvider } from './context/ServiceContext';
import { Header } from './components/Layout/Header';
import { Footer } from './components/Layout/Footer';
import { Home } from './pages/Home';
import { Services } from './pages/Services';
import { AddService } from './pages/AddService';
import { Profile } from './pages/Profile';
import { AdminDashboard } from './pages/AdminDashboard';
import { LoginForm } from './components/Auth/LoginForm';
import { RegisterForm } from './components/Auth/RegisterForm';
import { PhoneVerification } from './components/Auth/PhoneVerification';

function App() {
  return (
    <AuthProvider>
      <ServiceProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/services" element={<Services />} />
                <Route path="/add-service" element={<AddService />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/login" element={<LoginForm />} />
                <Route path="/register" element={<RegisterForm />} />
                <Route path="/verify-phone" element={<PhoneVerification />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </ServiceProvider>
    </AuthProvider>
  );
}

export default App;