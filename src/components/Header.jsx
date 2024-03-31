import React, { useState, useEffect } from 'react';
import './header.css';

function Header() {
  const [role, setRole] = useState(localStorage.getItem('userRole') || 'customer');

  useEffect(() => {
    localStorage.setItem('userRole', role);
  }, [role]);

  // Function to determine if the role matches and apply the 'active' class
  const isActiveRole = (currentRole) => role === currentRole ? 'active' : '';

  return (
    <header>
      <div className="role-switch">
        <button className={isActiveRole('customer')} onClick={() => setRole('customer')}>Customer</button>
        <button className={isActiveRole('employee')} onClick={() => setRole('employee')}>Employee</button>
      </div>
      
      <nav>
        <ul>
          <li><a href="/">Home</a></li>
          {role === 'customer' && (
            <>
              <li><a href="/search">Room Search</a></li>
              <li><a href="/bookings">Bookings</a></li>
              <li><a href="/signup">Sign Up</a></li>
            </>
          )}
          {role === 'employee' && (
            <>
              <li><a href="/management">Management</a></li>
              <li><a href="/hotel-directory">Hotel Directory</a></li>
              <li><a href="/employeesignup">Sign Up</a></li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
}

export default Header;
