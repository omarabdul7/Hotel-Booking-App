import React, { useState } from 'react';
import './SignUpForm.css';

function Management() {
  const [employee, setEmployee] = useState({ email: '', password: '', hotelID: '' });
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeView, setActiveView] = useState(''); 
  const [rental, setRental] = useState({
    roomId: '',
    customerId: '',
    checkInDate: '',
    checkOutDate: '',
    cardNumber: '',
    cvv: '',
    expiryDate: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmployee({ ...employee, [name]: value });
  };

  const handleRentalChange = (e) => {
    const { name, value } = e.target;
    setRental({ ...rental, [name]: value });
  };

  const authenticateEmployee = () => {
    fetch('http://localhost:3001/verify-employee', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: employee.email,
        password: employee.password
      }),
    })
    .then(response => response.json())
    .then(data => {
      if (data.isValid) {
        setIsAuthenticated(true);
        // Assuming data contains employeeID, save it along with other employee details
        setEmployee({ ...employee, hotelID: data.hotelID, employeeID: data.employeeID });
      } else {
        alert('Authentication failed. Please check your credentials and try again.');
      }
    })
    
    
    .catch(error => {
      console.error('Authentication error:', error);
    });
  };

  const handleRoomChange = (index, field, value) => {
    const updatedRooms = [...rooms];
    updatedRooms[index] = { ...updatedRooms[index], [field]: value };
    setRooms(updatedRooms);
  };

  const saveRoomDetails = (room) => {
    fetch(`http://localhost:3001/update-room`, {
      method: 'POST', // Use PUT if you're updating existing records, as per REST conventions
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(room),
    })
    .then(response => {
      if (!response.ok) throw new Error('Failed to update room details');
      alert('Room details updated successfully!');
      // Optionally refetch rooms here to confirm update
    })
    .catch(error => {
      console.error('Error updating room details:', error);
    });
  };

  
  const fetchRooms = () => {
    fetch(`http://localhost:3001/rooms-by-hotel?hotelId=${employee.hotelID}`)
    .then(response => response.json())
    .then(data => {
      setRooms(data);
      setActiveView('rooms');
    })
    .catch(error => console.error('Error fetching rooms:', error));
  };

  const fetchBookings = () => {
    fetch(`http://localhost:3001/bookings-by-hotel?hotelId=${employee.hotelID}`) // This endpoint needs to be implemented in your backend
    .then(response => response.json())
    .then(data => {
      setBookings(data);
      setActiveView('bookings');
    })
    .catch(error => console.error('Error fetching bookings:', error));
  };

  const createRental = () => {
    console.log("Creating rental with employee ID: ", employee.employeeID); // Debug: Log the employeeID being used
    const payload = {
      ...rental,
      Employee_ID: employee.employeeID, // This should match the key expected by your backend
    };
  
    console.log("Payload for creating rental: ", payload); // Debug: Log the payload
  
  
  
    fetch('http://localhost:3001/create-renting', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    .then(response => {
      if (!response.ok) throw new Error('Failed to create rental');
      return response.json();
    })
    .then(data => {
      alert('Rental created successfully!');
      window.location.reload(); 
    })
    .catch(error => {
      console.error('Error creating rental:', error);
    });
  };
  

  const transformBooking = (booking) => {
    // Ask for payment details
    const cardNumber = prompt("Enter Card Number:");
    const cvv = prompt("Enter CVV:");
    const expiryDate = prompt("Enter Expiry Date (MM/YY):");
  
    // Check if all fields are filled
    if (!cardNumber || !cvv || !expiryDate) {
      alert("Payment information is required.");
      return;
    }
  
    // Create payload including booking details and payment information
    const payload = {
      ...booking,
      Card_Number: cardNumber,
      CVV: cvv,
      Expiry_Date: expiryDate,
      Employee_ID: employee.employeeID // Make sure this is stored in your state
    };
  
    // Send the data to the backend for processing
    fetch('http://localhost:3001/transform-booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    .then(response => {
      if (!response.ok) throw new Error('Failed to transform booking');
      return response.json();
    })
    .then(data => {
      alert('Booking transformed successfully!');
      // Optionally refresh the bookings list here
    })
    .catch(error => {
      console.error('Error transforming booking:', error);
    });
  };
  

  return (
    <div className="container">
      {!isAuthenticated ? (
        <div>
          <h2 className="form-title">Employee Sign In</h2>
          <form onSubmit={(e) => {
            e.preventDefault();
            authenticateEmployee();
          }}>
            <input
              name="email"
              value={employee.email}
              onChange={handleChange}
              placeholder="Email"
              className="form-input"
            />
            <input
              type="password"
              name="password"
              value={employee.password}
              onChange={handleChange}
              placeholder="Password"
              className="form-input"
            />
            <div className="button-container">
              <button type="submit" className="form-button">Sign In</button>
            </div>
          </form>
        </div>
      ) : (
        <div>
<button onClick={fetchRooms}className="form-button">View Rooms</button>
<button onClick={fetchBookings}className="form-button">View Bookings</button>
<button onClick={() => setActiveView('createRenting')} className="form-button">Create Renting</button>


{activeView === 'rooms' && (
  rooms.length > 0 ? rooms.map((room, index) => (
    <div key={room.Room_ID}>
      <div className="room-edit-container">
        <p>Room ID: <input type="text" value={room.Room_ID} readOnly /></p>
        <p>Price: <input type="number" value={room.Price} onChange={(e) => handleRoomChange(index, 'Price', e.target.value)} /></p>
        <p>Sea View: 
          <select value={room.Sea_View} onChange={(e) => handleRoomChange(index, 'Sea_View', e.target.value)}>
            <option value="0">No</option>
            <option value="1">Yes</option>
          </select>
        </p>
        <p>Mountain View: 
          <select value={room.Mountain_View} onChange={(e) => handleRoomChange(index, 'Mountain_View', e.target.value)}>
            <option value="0">No</option>
            <option value="1">Yes</option>
          </select>
        </p>
        <p>Extendable: 
          <select value={room.Extendable} onChange={(e) => handleRoomChange(index, 'Extendable', e.target.value)}>
            <option value="0">No</option>
            <option value="1">Yes</option>
          </select>
        </p>
        <p>Damage Status: 
          <select value={room.Damage_Status} onChange={(e) => handleRoomChange(index, 'Damage_Status', e.target.value)}>
            <option value="0">No</option>
            <option value="1">Yes</option>
          </select>
        </p>
        <button onClick={() => saveRoomDetails(room)}>Save Changes</button>
      </div>
      {index < rooms.length - 1 && <div className="booking-divider"></div>}
    </div>
  )) : <p>No rooms found.</p>
)}

  
{activeView === 'bookings' && (
  bookings.length > 0 ? bookings.map((booking, index) => (
    <div key={booking.Booking_ID}>
      <div className="booking-container">
        <p>Booking ID: {booking.Booking_ID}</p>
        <p>Customer Name: {booking.First_Name} {booking.Last_Name}</p>
        <p>Room ID: {booking.Room_ID}</p>
        <p>Check-in Date: {`${booking.Checkin_Day}/${booking.Checkin_Month}/${booking.Checkin_Year}`}</p>
        <p>Check-out Date: {`${booking.Checkout_Day}/${booking.Checkout_Month}/${booking.Checkout_Year}`}</p>
      </div>
      <button onClick={() => transformBooking(booking)}>Transform</button>
      {index < bookings.length - 1 && <div className="booking-divider"></div>}
    </div>
  )) : <p>No bookings found.</p>
)}


{activeView === 'createRenting' && (
            <div>
              <h2>Create a New Renting</h2>
              <input name="roomId" value={rental.roomId} onChange={handleRentalChange} placeholder="Room ID" />
              <input name="customerId" value={rental.customerId} onChange={handleRentalChange} placeholder="Customer ID" />
              <input name="checkInDate" type="date" value={rental.checkInDate} onChange={handleRentalChange} placeholder="Check-In Date" />
              <input name="checkOutDate" type="date"a value={rental.checkOutDate} onChange={handleRentalChange} placeholder="Check-Out Date" />
              <input name="cardNumber" value={rental.cardNumber} onChange={handleRentalChange} placeholder="Card Number" />
              <input name="cvv" value={rental.cvv} onChange={handleRentalChange} placeholder="CVV" />
              <input name="expiryDate" value={rental.expiryDate} onChange={handleRentalChange} placeholder="Expiry Date" />
              <button onClick={createRental}>Submit Rental</button>
            </div>
          )}


        </div>
      )}
    </div>
  );
  
  
}

export default Management;
