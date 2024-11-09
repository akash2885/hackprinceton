import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LocationLanding from './components/landing';
import CityStatsDashboard from './components/stats';


function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LocationLanding />} />
                <Route path="/city-stats" element={<CityStatsDashboard />} />
            </Routes>
        </Router>
    );
}

export default App;