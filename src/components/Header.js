import React from 'react';
import './header.css';

function Header() {
  return (
    <header>
      <nav>
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/search">Room Search</a></li>
          <li><a href="/bookings">Bookings</a></li>
          <li><a href="/hotel-directory">Hotel Directory</a></li>
          <li><a href="/management">Management</a></li>
          <li><a href="/signup">Sign Up</a></li> 
        </ul>
      </nav>
    </header>
  );
}


export default Header;
