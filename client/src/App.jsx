import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from './context/AuthContext';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import SubmitProblem from './pages/SubmitProblem';
import PracticeList from './pages/PracticeList';
import PracticeDetail from './pages/PracticeDetail';
import Navbar from './components/Navbar';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;

  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <div className="container">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            <Route path="/" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />

            <Route path="/submit" element={
              <PrivateRoute>
                <SubmitProblem />
              </PrivateRoute>
            } />

            <Route path="/practice" element={
              <PrivateRoute>
                <PracticeList />
              </PrivateRoute>
            } />

            <Route path="/practice/:id" element={
              <PrivateRoute>
                <PracticeDetail />
              </PrivateRoute>
            } />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
