import React, { useState } from 'react'
import './Recommendations.scss'
import Sidebar from '../../components/sidebar/Sidebar.jsx'
import Navbar from '../../components/navbar/Navbar'
import Recommendation from '../../components/Recommendation/Recommendation.jsx'
import BackToHome from '../../components/backToHome/BackToHome.jsx'
import ShortAdvice from '../../components/ShortAdvice/ShortAdvice.jsx'


const Recommendations = () => {
  const [activeView, setActiveView] = useState('detailed');

  const renderActiveComponent = () => {
    if (activeView === 'short') {
      return <ShortAdvice />;
    }
    return <Recommendation />;
  };

  return (
    <div className='recommendation-container'>
        <div className="left">
            <Sidebar/>
        </div>
        <div className="right">
            <div className="top">
              <BackToHome/>
            </div>
            <div className="bottom">
              <div className="view-toggle">
                <button
                  className={activeView === 'detailed' ? 'active' : ''}
                  onClick={() => setActiveView('detailed')}
                >
                  Detailed Guidance
                </button>
                <button
                  className={activeView === 'short' ? 'active' : ''}
                  onClick={() => setActiveView('short')}
                >
                  Quick Alerts
                </button>
              </div>
              {renderActiveComponent()}
            </div>
        </div>
    </div>
  )
}

export default Recommendations