import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Dashboard } from './pages/Dashboard';
import { Explore } from './pages/Explore';
import { AuthPage } from './pages/AuthPage';
import { AdminPanel } from './pages/AdminPanel';
import { Profile } from './pages/Profile';
import { AdvancedQueries } from './pages/AdvancedQueries';
import { ResetPassword } from './pages/ResetPassword';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
        <div className="app-container">
          <Toaster position="bottom-right" toastOptions={{ className: 'glass-card' }} />
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/advanced" element={<AdvancedQueries />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminPanel />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
    </ThemeProvider>
  );
}

export default App;
