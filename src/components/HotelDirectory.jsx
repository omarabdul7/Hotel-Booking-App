
import React, { useEffect, useState } from 'react';


const HotelDirectory = () => {
  const [availableRooms, setAvailableRooms] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [selectedHotelId, setSelectedHotelId] = useState('');
  const [hotelCapacity, setHotelCapacity] = useState({});

  useEffect(() => {
    fetch('http://localhost:3001/available-rooms-per-area')
      .then(response => response.json())
      .then(data => setAvailableRooms(data))
      .catch(error => console.error('Error fetching available rooms per area:', error));
  }, []);

  useEffect(() => {
    fetch('http://localhost:3001/hotels')
      .then(response => response.json())
      .then(data => setHotels(data))
      .catch(error => console.error('Error fetching hotels:', error));
  }, []);

  useEffect(() => {
    if (selectedHotelId) {
      fetch(`http://localhost:3001/hotel-capacity?hotelId=${encodeURIComponent(selectedHotelId)}`)
        .then(response => response.json())
        .then(data => setHotelCapacity(data))
        .catch(error => console.error('Error fetching hotel capacity:', error));
    }
  }, [selectedHotelId]);

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Hotel Directory</h2>

      <section>
        <h3>Available Rooms Per Area</h3>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Country</th>
              <th style={styles.th}>City</th>
              <th style={styles.th}>Available Rooms</th>
            </tr>
          </thead>
          <tbody>
            {availableRooms.map((area, index) => (
              <tr key={index}>
                <td style={styles.td}>{area.Country}</td>
                <td style={styles.td}>{area.City}</td>
                <td style={styles.td}>{area.AvailableRooms}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h3>Hotel Capacity</h3>
        <select
          style={styles.select}
          value={selectedHotelId}
          onChange={e => setSelectedHotelId(e.target.value)}
        >
          <option value="">Select a Hotel</option>
          {hotels.map(hotel => (
            <option key={hotel.Hotel_ID} value={hotel.Hotel_ID}>{hotel.Name}</option>
          ))}
        </select>
        {hotelCapacity.TotalCapacity && (
          <div style={styles.capacityInfo}>
            <strong>Total Capacity:</strong> {hotelCapacity.TotalCapacity}
          </div>
        )}
      </section>
    </div>
  );
};

// Styles object for inline styling
const styles = {
  container: { margin: '0 auto', width: '80%', padding: '20px' },
  header: { textAlign: 'center' },
  select: { width: '100%', padding: '10px', marginBottom: '20px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { background: '#f4f4f4', padding: '10px', border: '1px solid #ddd' },
  td: { padding: '10px', border: '1px solid #ddd' },
  capacityInfo: { marginTop: '10px' }
};


export default HotelDirectory;
