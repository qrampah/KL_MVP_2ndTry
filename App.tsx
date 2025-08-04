import React from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { JobProvider } from './contexts/JobContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { useAuth } from './hooks/useAuth';
import Navbar from './components/layout/Navbar';
import Spinner from './components/ui/Spinner';
import NotificationContainer from './components/ui/NotificationContainer';
import { UserRole } from './types';

// Statically import pages to fix module resolution error with lazy loading in this environment.
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import CreateJobPage from './pages/CreateJobPage';
import JobDetailsPage from './pages/JobDetailsPage';
import AvailableJobsPage from './pages/AvailableJobsPage';


const ProtectedRoute: React.FC = () => {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-900">
        <Spinner />
      </div>
    );
  }

  return currentUser ? <Outlet /> : <Navigate to="/auth?mode=login" replace />;
};

const ShipperRoute: React.FC = () => {
  const { currentUser, isLoading } = useAuth();
  // We can assume currentUser is not null because this is nested in ProtectedRoute
  if (isLoading) return <Spinner />; // Should be quick as data is loaded
  
  return currentUser?.role === UserRole.SHIPPER ? <Outlet /> : <Navigate to="/dashboard" replace />;
};

const DriverRoute: React.FC = () => {
  const { currentUser, isLoading } = useAuth();
  if (isLoading) return <Spinner />;
  
  return currentUser?.role === UserRole.DRIVER ? <Outlet /> : <Navigate to="/dashboard" replace />;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />
      
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/job/:id" element={<JobDetailsPage />} />
        
        <Route element={<ShipperRoute />}>
          <Route path="/create-job" element={<CreateJobPage />} />
        </Route>

        <Route element={<DriverRoute />}>
          <Route path="/jobs/available" element={<AvailableJobsPage />} />
        </Route>
      </Route>
      
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <JobProvider>
          <HashRouter>
            <div className="flex flex-col min-h-screen bg-slate-900">
              <Navbar />
              <NotificationContainer />
              <main className="flex-grow">
                <AppRoutes />
              </main>
            </div>
          </HashRouter>
        </JobProvider>
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;