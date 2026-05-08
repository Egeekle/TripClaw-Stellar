import { Suspense, lazy, Component } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import PageTransition from './components/PageTransition';
import RequireAuth from './components/RequireAuth';

const Onboarding = lazy(() => import('./pages/Onboarding'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Map = lazy(() => import('./pages/Map'));
const AgentConsole = lazy(() => import('./pages/AgentConsole'));
const Payment = lazy(() => import('./pages/Payment'));
const Vote = lazy(() => import('./pages/Vote'));
const Passport = lazy(() => import('./pages/Passport'));
const MatchExperience = lazy(() => import('./pages/MatchExperience'));
const BiometricVerification = lazy(() => import('./pages/BiometricVerification'));

// ── Error Boundary ──────────────────────────────────────────
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark p-6">
          <div className="text-center max-w-md">
            <div className="size-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-red-500 text-3xl">error</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Something went wrong</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <button
              onClick={() => { this.setState({ hasError: false, error: null }); window.location.href = '/'; }}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white font-bold shadow-lg shadow-violet-500/20"
            >
              Return Home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Loading Fallback ────────────────────────────────────────
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
      <div className="flex flex-col items-center gap-4">
        <div className="size-12 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500 flex items-center justify-center shadow-lg animate-pulse">
          <span className="material-symbols-outlined text-white text-2xl">neurology</span>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Loading…</p>
      </div>
    </div>
  );
}

// ── 404 Page ────────────────────────────────────────────────
function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark p-6">
      <div className="text-center max-w-md">
        <div className="text-7xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent mb-4">404</div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Page not found</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">The page you're looking for doesn't exist.</p>
        <a href="/" className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white font-bold shadow-lg shadow-violet-500/20">
          Go Home
        </a>
      </div>
    </div>
  );
}

// ── Animated Routes Wrapper ─────────────────────────────────
function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/" element={<PageTransition><Onboarding /></PageTransition>} />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={<RequireAuth><PageTransition><Dashboard /></PageTransition></RequireAuth>} />
        <Route path="/map" element={<RequireAuth><PageTransition><Map /></PageTransition></RequireAuth>} />
        <Route path="/console" element={<RequireAuth><PageTransition><AgentConsole /></PageTransition></RequireAuth>} />
        <Route path="/payment" element={<RequireAuth><PageTransition><Payment /></PageTransition></RequireAuth>} />
        <Route path="/vote" element={<RequireAuth><PageTransition><Vote /></PageTransition></RequireAuth>} />
        <Route path="/passport" element={<RequireAuth><PageTransition><Passport /></PageTransition></RequireAuth>} />
        <Route path="/match" element={<RequireAuth><PageTransition><MatchExperience /></PageTransition></RequireAuth>} />
        <Route path="/verify" element={<RequireAuth><PageTransition><BiometricVerification /></PageTransition></RequireAuth>} />
        
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

// ── App ─────────────────────────────────────────────────────
function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <AnimatedRoutes />
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
