import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import ReactMarkdown from 'react-markdown';

const PracticeDetail = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [problem, setProblem] = useState(null);
    const [loading, setLoading] = useState(true);

    const [approachText, setApproachText] = useState('');
    const [code, setCode] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchProblem = async () => {
            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                };
                const { data } = await axios.get(`http://localhost:5000/api/problems/${id}`, config);
                setProblem(data);
            } catch (error) {
                console.error(error);
                alert('Error fetching problem');
            } finally {
                setLoading(false);
            }
        };

        fetchProblem();
    }, [id, user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`,
                },
            };

            await axios.post(
                `http://localhost:5000/api/reviews/${id}`,
                { approachText, code, language: 'python' }, // Defaulting language for now
                config
            );

            alert('Review submitted! AI Feedback will be generated.');
            navigate('/practice');
        } catch (error) {
            console.error(error);
            alert('Error submitting review');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!problem) return <div>Problem not found</div>;

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div>
                <div className="card">
                    <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>{problem.title}</h1>
                    <div style={{ marginBottom: '1rem' }}>
                        <span style={{
                            padding: '0.25rem 0.5rem',
                            borderRadius: '0.25rem',
                            backgroundColor: problem.difficulty === 'Easy' ? '#10b981' : problem.difficulty === 'Medium' ? '#f59e0b' : '#ef4444',
                            color: 'white'
                        }}>
                            {problem.difficulty}
                        </span>
                    </div>
                    <div style={{ lineHeight: '1.6' }}>
                        <ReactMarkdown>{problem.description}</ReactMarkdown>
                    </div>
                </div>
            </div>

            <div>
                <div className="card">
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Your Review</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Recall Approach</label>
                            <textarea
                                className="form-input"
                                rows="10"
                                value={approachText}
                                onChange={(e) => setApproachText(e.target.value)}
                                placeholder="Type what you remember about the solution approach..."
                                required
                            ></textarea>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Recall Code (Optional)</label>
                            <textarea
                                className="form-input"
                                rows="10"
                                style={{ fontFamily: 'monospace' }}
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder="Type the code if you remember it..."
                            ></textarea>
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={submitting}>
                            {submitting ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PracticeDetail;
