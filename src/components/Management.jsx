import React, { useState } from 'react';
import './SignUpForm.css';

function Management() {
const [employee, setEmployee] = useState({ email: '', password: '', hotelID: '', roleID: '' });
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [rentings, setRentings] = useState([]);
  const [activeView, setActiveView] = useState(''); 
  const [employees, setEmployees] = useState([]);

  
  const [rental, setRental] = useState({
    roomId: '',
    customerId: '',
    checkInDate: '',
    checkOutDate: '',
    cardNumber: '',
    cvv: '',
    expiryDate: '',
  });
  const [newRoom, setNewRoom] = useState({
    hotelId: '', // Assuming rooms are linked to hotels
    price: '',
    capacity: '',
    amenities: '',
    seaView: false,
    mountainView: false,
    extendable: false,
    damageStatus: false,
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
        // Set employee details in state, including role_ID
        setEmployee({ ...employee, hotelID: data.hotelID, employeeID: data.employeeID, role_ID: data.role_ID });
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
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(room),
    })
    .then(response => {
      if (!response.ok) throw new Error('Failed to update room details');
      alert('Room details updated successfully!');
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
    fetch(`http://localhost:3001/bookings-by-hotel?hotelId=${employee.hotelID}`) 
    .then(response => response.json())
    .then(data => {
      setBookings(data);
      setActiveView('bookings');
    })
    .catch(error => console.error('Error fetching bookings:', error));
  };

  const createRental = () => {
    const payload = {
      roomId: rental.roomId,
      Customer_ID: rental.customerId,
      checkInDate: rental.checkInDate,
      checkOutDate: rental.checkOutDate,
      cardNumber: rental.cardNumber,
      cvv: rental.cvv,
      expiryDate: rental.expiryDate,
      Employee_ID: employee.employeeID, // Make sure this matches the key expected by your backend
    };
  
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
  
  const createRoom = () => {
    // Check if the room price is positive
    if (newRoom.price <= 0) {
      alert('Room price must be a positive number.');
      return; // Stop the function if the price is not valid
    }
  
    // Add the hotelId to the newRoom data before sending
    const payload = { ...newRoom, hotelId: employee.hotelID };
    
    fetch('http://localhost:3001/create-room', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    .then(response => {
      if (!response.ok) throw new Error('Failed to create room');
      return response.json();
    })
    .then(data => {
      alert('Room created successfully!');
      // Optionally reset the form or refresh data
    })
    .catch(error => {
      console.error('Error creating room:', error);
    });
  };
  

  const deleteRoom = (roomId) => {
    fetch(`http://localhost:3001/delete-room?roomId=${roomId}`, {
      method: 'DELETE',
    })
    .then(response => {
      if (!response.ok) throw new Error('Failed to delete room');
      alert('Room deleted successfully!');
      // Optionally, refresh the room list
      fetchRooms(); // Assuming you have a function to fetch rooms
    })
    .catch(error => {
      console.error('Error deleting room:', error);
    });
  };
  

  const transformBooking = (booking) => {
    // Gather payment information (assuming this part remains unchanged)
    const cardNumber = prompt("Enter Card Number:");
    const cvv = prompt("Enter CVV:");
    const expiryDate = prompt("Enter Expiry Date (MM/YY):");

    if (cvv.length !== 3) {
      alert("CVV must be exactly 3 characters long.");
      return; // Stop the execution if the CVV is not 3 characters
    }

    // Proceed if all fields are correctly filled
    if (!cardNumber || !cvv || !expiryDate) {
      alert("All payment information is required.");
      return;
    }

    // Construct payload including the booking details and payment information
    const payload = {
      Booking_ID: booking.Booking_ID, // Ensure this matches exactly with your backend expectations
      Room_ID: booking.Room_ID,
      Customer_ID: booking.Customer_ID,
      Employee_ID: employee.employeeID, // Assuming this is correctly set from your employee state
      Checkin_Year: booking.Checkin_Year,
      Checkin_Month: booking.Checkin_Month,
      Checkin_Day: booking.Checkin_Day,
      Checkout_Year: booking.Checkout_Year,
      Checkout_Month: booking.Checkout_Month,
      Checkout_Day: booking.Checkout_Day,
      Card_Number: cardNumber,
      CVV: cvv,
      Expiry_Date: expiryDate,
    };

    fetch('http://localhost:3001/transform-booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    .then(response => {
      if (!response.ok) throw new Error('Failed to transform booking into renting');
      return response.json();
    })
    .then(data => {
      alert('Booking transformed into renting successfully!');
    })
    .catch(error => {
      console.error('Error transforming booking into renting:', error);
    });
};

  
  const fetchRentings = () => {
    fetch(`http://localhost:3001/rentings`)
      .then(response => response.json())
      .then(data => {
        setRentings(data);
        setActiveView('rentings');
      })
      .catch(error => console.error('Error fetching rentings:', error));
  };
  
  const archiveRenting = (rentingId) => {
    fetch('http://localhost:3001/archive-renting', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rentingId }),
    })
    .then(response => {
      if (!response.ok) throw new Error('Failed to archive renting');
      alert('Renting archived successfully!');
      fetchRentings(); // Refresh the rentings list to reflect the removal
    })
    .catch(error => {
      console.error('Error archiving renting:', error);
    });
  };
  
    const fetchEmployees = () => {
      // Include authentication headers if needed
      const headers = new Headers({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_AUTH_TOKEN', // Adjust according to your auth mechanism
      });
    
      fetch(`http://localhost:3001/employees-by-hotel?hotelId=${employee.hotelID}`, { headers })
        .then(response => response.json())
        .then(data => {
          setEmployees(data);
          setActiveView('deleteEmployee');
        })
        .catch(error => console.error('Error fetching employees:', error));
    };
    

    const deleteEmployee = (employeeId) => {
      fetch(`http://localhost:3001/delete-employee?employeeId=${employeeId}`, {
        method: 'DELETE',
      })
      .then(response => {
        if (!response.ok) {
          // If server responds with a status code outside the range 200-299, throw an error
          throw new Error('Cannot delete last manager');
        }
        return response.json(); // Parse JSON body of the response (optional depending on your server response)
      })
      .then(() => {
        alert('Employee deleted successfully!');
        fetchEmployees(); // Refresh the employee list
      })
      .catch(error => {
        console.error('Error deleting employee:', error);
        alert(error.message); // Display a relevant error message to the user
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
<button onClick={() => setActiveView('createRoom')} className="form-button">Create Room</button>
<button onClick={() => setActiveView('deleteRoom')} className="form-button">Delete Room</button>
<button onClick={fetchRentings} className="form-button">View Rentings</button>
<button onClick={fetchEmployees} className="form-button">Delete Employee</button>


{activeView === 'deleteEmployee' && (
  employees.length > 0 ? employees.map((employee, index) => (
    <div key={employee.Employee_ID} className="employee-delete-container">
      <p>Employee ID: {employee.Employee_ID} - {employee.First_Name} {employee.Last_Name}</p>
      <button onClick={() => deleteEmployee(employee.Employee_ID)}>Delete</button>
    </div>
  )) : <p>No employees found.</p>
)}


{activeView === 'rentings' && (
  rentings.length > 0 ? rentings.map((renting, index) => (
    <div key={renting.Renting_ID}>
      <p>Renting ID: {renting.Renting_ID}</p>
      <p>Room ID: {renting.Room_ID}</p>
      <p>Customer ID: {renting.Customer_ID}</p>
      <p>Check-in Date: {`${renting.Checkin_Day}/${renting.Checkin_Month}/${renting.Checkin_Year}`}</p>
      <p>Check-out Date: {`${renting.Checkout_Day}/${renting.Checkout_Month}/${renting.Checkout_Year}`}</p>
      <button onClick={() => archiveRenting(renting.Renting_ID)}>Archive</button>
      {index < rentings.length - 1 && <div className="booking-divider"></div>}
    </div>
  )) : <p>No rentings found.</p>
)}



{activeView === 'deleteRoom' && (
  rooms.length > 0 ? rooms.map((room, index) => (
    <div key={room.Room_ID} className="room-delete-container">
      <p>Room ID: {room.Room_ID} - {room.Price} - {room.Capacity}</p>
      <button onClick={() => deleteRoom(room.Room_ID)}>Delete</button>
    </div>
  )) : <p>No rooms available to delete.</p>
)}

{activeView === 'createRoom' && (
  <div>
    <h2>Create a New Room</h2>
    <input
      name="price"
      type="number"
      value={newRoom.price}
      onChange={(e) => setNewRoom({ ...newRoom, price: e.target.value })}
      placeholder="Price"
    />
    <input
      name="capacity"
      type="number"
      value={newRoom.capacity}
      onChange={(e) => setNewRoom({ ...newRoom, capacity: e.target.value })}
      placeholder="Capacity"
    />
    <input
      name="amenities"
      value={newRoom.amenities}
      onChange={(e) => setNewRoom({ ...newRoom, amenities: e.target.value })}
      placeholder="Amenities"
    />
    <label>
      Sea View:
      <input
        name="seaView"
        type="checkbox"
        checked={newRoom.seaView}
        onChange={(e) => setNewRoom({ ...newRoom, seaView: e.target.checked })}
      />
    </label>
    <label>
      Mountain View:
      <input
        name="mountainView"
        type="checkbox"
        checked={newRoom.mountainView}
        onChange={(e) => setNewRoom({ ...newRoom, mountainView: e.target.checked })}
      />
    </label>
    <label>
      Extendable:
      <input
        name="extendable"
        type="checkbox"
        checked={newRoom.extendable}
        onChange={(e) => setNewRoom({ ...newRoom, extendable: e.target.checked })}
      />
    </label>
    <label>
      Damage Status:
      <input
        name="damageStatus"
        type="checkbox"
        checked={newRoom.damageStatus}
        onChange={(e) => setNewRoom({ ...newRoom, damageStatus: e.target.checked })}
      />
    </label>
    <button onClick={createRoom}>Create Room</button>
  </div>
)}



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
