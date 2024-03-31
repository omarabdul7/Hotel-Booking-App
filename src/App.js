import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Home from './components/Home';
import Search from './components/Search';
import Bookings from './components/Bookings';
import HotelDirectory from './components/HotelDirectory';
import Management from './components/Management';
import SignUp from './components/SignUp'; 
import BookingComponent from './components/BookingComponent'; 
import EmployeeSignUp from './components/EmployeeSignUp';
import './App.css';

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
            <Route path="/signup" element={<SignUp />} />
            <Route path="/book-room/:roomId" element={<BookingComponent />} /> 
            <Route path="/employeesignup" element={<EmployeeSignUp />} />

          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
