import React, { useState } from 'react';
import './SignUpForm.css';

function Management() {
  const [employee, setEmployee] = useState({ email: '', password: '', hotelID: '' });
  const [rooms, setRooms] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmployee(prevState => ({
      ...prevState,
      [name]: value,
    }));
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
    .then(response => {
      if (!response.ok) throw new Error('Invalid credentials');
      return response.json();
    })
    .then(data => {
      if (data.isValid) {
        setIsAuthenticated(true);
        setEmployee(prevState => ({
          ...prevState,
          hotelID: data.hotelID
        }));
        fetchRooms(data.hotelID);
      } else {
        alert('Authentication failed. Please check your credentials and try again.');
      }
    })
    .catch(error => {
      console.error('Authentication error:', error);
    });
  };

  const fetchRooms = (hotelID) => {
    fetch(`http://localhost:3001/rooms-by-hotel?hotelId=${hotelID}`)
    .then(response => response.json())
    .then(data => {
      setRooms(data);
    })
    .catch(error => console.error('Error fetching rooms:', error));
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

  return (
    <div className="container">
      {!isAuthenticated ? (
        <>
          <h2 className="form-title">Employee Sign In</h2>
          <form onSubmit={e => {
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
        </>
      ) : (
        <div>
          <h2>Rooms in Your Hotel</h2>
          {rooms.length > 0 ? (
            rooms.map((room, index) => (
              <div key={room.Room_ID} className="room-edit-container">
                <p>Room ID: <input type="text" value={room.Room_ID} readOnly /></p>
                <p>Price: <input type="number" value={room.Price} onChange={(e) => handleRoomChange(index, 'Price', e.target.value)} /></p>
                <p>Capacity: <input type="number" value={room.Capacity} onChange={(e) => handleRoomChange(index, 'Capacity', e.target.value)} /></p>
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
            ))
          ) : (
            <p>No rooms found.</p>
          )}
        </div>
      )}
    </div>
  );
  
}

export default Management;
