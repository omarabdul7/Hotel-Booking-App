import React, { useState } from 'react';

function Bookings() {
  const [customer, setCustomer] = useState({ email: '', password: '' });
  const [bookings, setBookings] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCustomer(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const authenticateCustomer = () => {
    fetch('http://localhost:3001/verify-customer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: customer.email,
        password: customer.password
      }),
    })
    .then(response => {
      if (!response.ok) throw new Error('Invalid credentials');
      return response.json();
    })
    .then(data => {
      if (data.isValid) {
        setIsAuthenticated(true);
        fetchBookings(data.customerID);
      } else {
        alert('Authentication failed. Please check your credentials and try again.');
      }
    })
    .catch(error => {
      console.error('Authentication error:', error);
    });
  };

  const fetchBookings = (customerID) => {
    // Assuming you have an endpoint to fetch bookings by customer ID
    fetch(`http://localhost:3001/bookings?customerID=${customerID}`)
    .then(response => response.json())
    .then(data => {
      setBookings(data);
    })
    .catch(error => console.error('Error fetching bookings:', error));
  };

  return (
    <div>
      {!isAuthenticated ? (
        <form onSubmit={e => {
          e.preventDefault();
          authenticateCustomer();
        }}>
          <input
            name="email"
            value={customer.email}
            onChange={handleChange}
            placeholder="Email"
          />
          <input
            type="password"
            name="password"
            value={customer.password}
            onChange={handleChange}
            placeholder="Password"
          />
          <button type="submit">Sign In</button>
        </form>
      ) : (
<div>
  <h2>Your Bookings</h2>
  {bookings.length > 0 ? (
    <div>
      {bookings.map(booking => (
        <div key={booking.Booking_ID} style={{ margin: '20px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
          <h3>Hotel: {booking.HotelName}</h3>
          <p>Room ID: {booking.Room_ID}</p>
          <p>Price: ${booking.Price}</p>
          <p>Check-in: {`${booking.Checkin_Day}/${booking.Checkin_Month}/${booking.Checkin_Year}`}</p>
          <p>Check-out: {`${booking.Checkout_Day}/${booking.Checkout_Month}/${booking.Checkout_Year}`}</p>
        </div>
      ))}
    </div>
  ) : (
    <p>No bookings found.</p>
  )}
</div>
      )}
    </div>
  );
}

export default Bookings;
