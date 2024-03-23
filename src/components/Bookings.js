import React, { useEffect, useState } from 'react';

function Bookings() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    // Update the URL to match your server's address
    fetch('http://localhost:3001/api/bookings')
      .then(response => response.json())
      .then(data => setBookings(data))
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  return (
    <div>
      <h2>Your Bookings</h2>
      <ul>
        {bookings.map(booking => (
          <li key={booking.id}>{booking.name} - {booking.date}</li>
        ))}
      </ul>
    </div>
  );
}

export default Bookings;
