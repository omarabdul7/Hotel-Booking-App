import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Home from './components/Home';
import Search from './components/Search';
import Bookings from './components/Bookings';
import HotelDirectory from './components/HotelDirectory';
import Management from './components/Management';
import './App.css';
import SignUp from './components/SignUp.js'; // Import the SignUp component

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/hotel-directory" element={<HotelDirectory />} />
            <Route path="/management" element={<Management />} />
            <Route path="/signup" element={<SignUp />} /> {/* Add this line */}
            {/* Insert additional Routes here as needed */}
          </Routes>
        </main>
      </div>
    </Router>
  );
}


export default App;
