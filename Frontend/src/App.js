import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LocationLanding from './components/landing';
import CityComparison from './components/stats';
import Home from "./components/home";


function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/location" element={<LocationLanding />} />
                <Route path="/city-stats" element={<CityComparison />} />
            </Routes>
        </Router>
    );
}

export default App;