import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const SubmitProblem = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        leetcodeRef: '',
        title: '',
        difficulty: 'Medium',
        tags: '',
        description: '',
        approachText: '',
        code: '',
        language: 'python',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`,
                },
            };

            await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/problems`, formData, config);
            navigate('/');
        } catch (error) {
            console.error(error);
            alert('Error submitting problem');
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Submit New Problem</h1>
            <form onSubmit={handleSubmit} className="card">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                        <label className="form-label">LeetCode Ref (URL or ID)</label>
                        <input type="text" name="leetcodeRef" className="form-input" value={formData.leetcodeRef} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Title</label>
                        <input type="text" name="title" className="form-input" value={formData.title} onChange={handleChange} required />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                        <label className="form-label">Difficulty</label>
                        <select name="difficulty" className="form-input" value={formData.difficulty} onChange={handleChange}>
                            <option value="Easy">Easy</option>
                            <option value="Medium">Medium</option>
                            <option value="Hard">Hard</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Tags (comma separated)</label>
                        <input type="text" name="tags" className="form-input" value={formData.tags} onChange={handleChange} required />
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Problem Description</label>
                    <textarea name="description" className="form-input" rows="5" value={formData.description} onChange={handleChange} required></textarea>
                </div>

                <div className="form-group">
                    <label className="form-label">Your Approach (Logic/Algorithm)</label>
                    <textarea name="approachText" className="form-input" rows="5" value={formData.approachText} onChange={handleChange} required></textarea>
                </div>

                <div className="form-group">
                    <label className="form-label">Code Solution</label>
                    <textarea name="code" className="form-input" rows="10" style={{ fontFamily: 'monospace' }} value={formData.code} onChange={handleChange}></textarea>
                </div>

                <div className="form-group">
                    <label className="form-label">Language</label>
                    <input type="text" name="language" className="form-input" value={formData.language} onChange={handleChange} />
                </div>

                <button type="submit" className="btn btn-primary">Submit Problem</button>
            </form>
        </div>
    );
};

export default SubmitProblem;
