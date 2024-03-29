import React, { useState } from 'react';
import './SignUpForm.css';

function Bookings() {
  const [customer, setCustomer] = useState({ email: '', password: '', customerID: '' });
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
        setCustomer(prevState => ({
          ...prevState,
          customerID: data.customerID
        }));
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
    fetch(`http://localhost:3001/bookings?customerID=${customerID}`)
    .then(response => response.json())
    .then(data => {
      setBookings(data);
    })
    .catch(error => console.error('Error fetching bookings:', error));
  };

  const cancelBooking = (bookingId) => {
    fetch(`http://localhost:3001/delete-booking?bookingID=${bookingId}`, {
      method: 'DELETE',
    })
    .then(response => {
      if (!response.ok) throw new Error('Failed to cancel booking');
      fetchBookings(customer.customerID); 
    })
    .catch(error => {
      console.error('Error canceling booking:', error);
    });
  };

  return (
    <div className="container">
      {!isAuthenticated ? (
        <>
          <h2 className="form-title">Sign In</h2>
          <form onSubmit={e => {
            e.preventDefault();
            authenticateCustomer();
          }}>
            <input
              name="email"
              value={customer.email}
              onChange={handleChange}
              placeholder="Email"
              className="form-input"
            />
            <input
              type="password"
              name="password"
              value={customer.password}
              onChange={handleChange}
              placeholder="Password"
              className="form-input"
            />
            <div className="button-container">
              <button type="submit" className="form-button">Sign In</button>
            </div>
          </form>
        </>
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
                  <button onClick={() => cancelBooking(booking.Booking_ID)}>Cancel Booking</button>
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
