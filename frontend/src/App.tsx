import React, { ErrorBoundary } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Enhanced architecture imports
import { StoreProvider } from './store/context';
import Layout from './components/Layout';
import Home from './pages/Home';
import Results from './pages/Results';
import Compare from './pages/Compare';
import AgentProfile from './pages/AgentProfile';

// Error boundary component
class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Application Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md mx-auto text-center p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Something went wrong
            </h1>
            <p className="text-gray-600 mb-6">
              We're sorry, but there was an unexpected error. Please refresh the page or try again later.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  return (
    <AppErrorBoundary>
      <StoreProvider
        config={{
          persistKeys: ['user', 'ui'],
          devTools: import.meta.env.NODE_ENV === 'development',
        }}
      >
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<Results />} />
              <Route path="/compare" element={<Compare />} />
              <Route path="/agent/:id" element={<AgentProfile />} />
            </Routes>
          </Layout>
        </Router>
      </StoreProvider>
    </AppErrorBoundary>
  );
}

export default App;