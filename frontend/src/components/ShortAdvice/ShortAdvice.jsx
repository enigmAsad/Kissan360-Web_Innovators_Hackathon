import React, { useState } from 'react';
import './ShortAdvice.scss';
import newRequest from '../../utils/newRequest.js';

const ShortAdvice = () => {
    const [cropType, setCropType] = useState('');
    const [location, setLocation] = useState('');
    const [upcomingWeather, setUpcomingWeather] = useState('');
    const [marketOutlook, setMarketOutlook] = useState('');
    const [urgentIssue, setUrgentIssue] = useState('');
    const [advices, setAdvices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showOutput, setShowOutput] = useState(false);

    const fetchShortAdvice = async () => {
        setLoading(true);
        setError('');

        try {
            const { data } = await newRequest.post('/api/short-advice', {
                cropType,
                location,
                upcomingWeather,
                marketOutlook,
                urgentIssue,
            });

            if (Array.isArray(data.advices) && data.advices.length > 0) {
                setAdvices(data.advices);
                setShowOutput(true);
            } else {
                setError('No advice returned. Try adjusting the inputs.');
            }
        } catch (err) {
            setError('Failed to fetch short advice');
        } finally {
            setLoading(false);
        }
    };

    const toggleOutputView = () => {
        setShowOutput((prev) => !prev);
        setError('');
    };

    const resetForm = () => {
        setCropType('');
        setLocation('');
        setUpcomingWeather('');
        setMarketOutlook('');
        setUrgentIssue('');
        setAdvices([]);
        setShowOutput(false);
        setError('');
    };

    return (
        <div className="short-advice">
            <h2>Quick Farm Alerts</h2>

            {!showOutput && (
                <>
                    <div className="input-grid">
                        <label>
                            Crop Type
                            <input
                                type="text"
                                value={cropType}
                                onChange={(e) => setCropType(e.target.value)}
                                placeholder="e.g., tomato"
                            />
                        </label>
                        <label>
                            Location / Region
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="e.g., Punjab"
                            />
                        </label>
                        <label>
                            Upcoming Weather
                            <input
                                type="text"
                                value={upcomingWeather}
                                onChange={(e) => setUpcomingWeather(e.target.value)}
                                placeholder="e.g., rain expected tomorrow"
                            />
                        </label>
                        <label>
                            Market Outlook
                            <input
                                type="text"
                                value={marketOutlook}
                                onChange={(e) => setMarketOutlook(e.target.value)}
                                placeholder="e.g., tomato prices rising"
                            />
                        </label>
                        <label>
                            Urgent Issue
                            <input
                                type="text"
                                value={urgentIssue}
                                onChange={(e) => setUrgentIssue(e.target.value)}
                                placeholder="e.g., pest sighted"
                            />
                        </label>
                    </div>
                    <div className="actions">
                        <button onClick={fetchShortAdvice} disabled={loading}>
                            {loading ? 'Generating...' : 'Get Quick Advice'}
                        </button>
                        <button className="secondary" onClick={resetForm} disabled={loading}>
                            Reset
                        </button>
                    </div>
                </>
            )}

            {showOutput && (
                <div className="output-card">
                    <h3>Today&apos;s Top Alerts</h3>
                    <ul>
                        {advices.map((item, index) => (
                            <li key={index}>{item}</li>
                        ))}
                    </ul>
                    <div className="actions">
                        <button onClick={toggleOutputView}>Back to Form</button>
                        <button className="secondary" onClick={resetForm}>
                            Start Fresh
                        </button>
                    </div>
                </div>
            )}

            {error && <p className="error">{error}</p>}
        </div>
    );
};

export default ShortAdvice;


