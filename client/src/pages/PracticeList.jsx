import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const PracticeList = () => {
    const { user } = useContext(AuthContext);
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDueProblems = async () => {
            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                };
                const { data } = await axios.get('http://localhost:5000/api/reviews/due', config);
                setProblems(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchDueProblems();
    }, [user]);

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Practice Queue</h1>
            {problems.length === 0 ? (
                <div className="card">
                    <p>No problems due for review today! Great job.</p>
                    <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>Back to Dashboard</Link>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {problems.map((problem) => (
                        <div key={problem._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{problem.title}</h3>
                                <span style={{
                                    display: 'inline-block',
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: '0.25rem',
                                    fontSize: '0.875rem',
                                    backgroundColor: problem.difficulty === 'Easy' ? '#10b981' : problem.difficulty === 'Medium' ? '#f59e0b' : '#ef4444',
                                    color: 'white',
                                    marginTop: '0.5rem'
                                }}>
                                    {problem.difficulty}
                                </span>
                            </div>
                            <Link to={`/practice/${problem._id}`} className="btn btn-primary">Review Now</Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PracticeList;
