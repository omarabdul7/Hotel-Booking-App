import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function BookingComponent() {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedRoom, checkinDate, checkoutDate } = location.state || {};

  const [customer, setCustomer] = useState({
    email: '',
    password: '', 
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCustomer(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const submitBooking = () => {
    // Ensure customer data and dates are available
    if (!customer.email || !customer.password || !selectedRoom || !checkinDate || !checkoutDate) {
      alert('All fields are required');
      return;
    }
  
    // First, verify the customer's credentials
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
        // If valid, proceed to create the booking
        const [checkinYear, checkinMonth, checkinDay] = checkinDate.split('-');
        const [checkoutYear, checkoutMonth, checkoutDay] = checkoutDate.split('-');
  
        return fetch('http://localhost:3001/create-booking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerID: data.customerID,
            roomID: selectedRoom.Room_ID,
            Checkin_Year: checkinYear,
            Checkin_Month: parseInt(checkinMonth, 10),
            Checkin_Day: parseInt(checkinDay, 10),
            Checkout_Year: checkoutYear,
            Checkout_Month: parseInt(checkoutMonth, 10),
            Checkout_Day: parseInt(checkoutDay, 10)
          }),
        });
      } else {
        throw new Error('Customer verification failed');
      }
    })
    .then(response => {
      if (!response.ok) throw new Error('Booking creation failed');
      return response.json();
    })
    .then(data => {
      console.log('Booking success:', data);
      navigate('/booking-confirmation', { state: { bookingID: data.bookingID } });
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Error processing your booking. Please check your credentials and try again.');
    });
  };  
  

  if (!selectedRoom) {
    return <p>No room selected for booking.</p>;
  }

  return (
    <div>
      <h2>Booking for {selectedRoom.Name}</h2> {/* Adjust according to your data structure */}
      <p>{selectedRoom.Street}, {selectedRoom.City}, {selectedRoom.Country}</p>
      <form onSubmit={e => {
        e.preventDefault();
        submitBooking();
      }}>
        <input
          name="email"
          value={customer.email}
          onChange={handleChange}
          placeholder="Email"
        />
        <input
          type="password" // Ensure to use type="password" for the password input
          name="password"
          value={customer.password}
          onChange={handleChange}
          placeholder="Password"
        />
        <button type="submit">Submit Booking</button>
      </form>
    </div>
  );
}

export default BookingComponent;
