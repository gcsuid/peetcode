import { useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Dashboard = () => {
    const { user } = useContext(AuthContext);

    return (
        <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Welcome, {user?.email}</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                <div className="card">
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Practice Queue</h2>
                    <p style={{ marginBottom: '1rem', color: '#94a3b8' }}>Review problems that are due today.</p>
                    <Link to="/practice" className="btn btn-primary">Start Practice</Link>
                </div>

                <div className="card">
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Add New Problem</h2>
                    <p style={{ marginBottom: '1rem', color: '#94a3b8' }}>Solved a new LeetCode problem? Add it here.</p>
                    <Link to="/submit" className="btn btn-primary">Add Problem</Link>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
