import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Results from './pages/Results';
import Compare from './pages/Compare';
import AgentProfile from './pages/AgentProfile';

function App() {
  return (
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
  );
}

export default App;