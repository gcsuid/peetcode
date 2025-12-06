import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <Link to="/" className="nav-brand">PeetCode</Link>
            <div className="nav-links">
                {user ? (
                    <>
                        <Link to="/" className="nav-link">Dashboard</Link>
                        <Link to="/practice" className="nav-link">Practice</Link>
                        <Link to="/submit" className="nav-link">Add Problem</Link>
                        <button onClick={handleLogout} className="btn btn-primary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}>Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="nav-link">Login</Link>
                        <Link to="/signup" className="nav-link">Signup</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
