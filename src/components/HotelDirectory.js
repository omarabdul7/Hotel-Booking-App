import React, { useState, useEffect } from 'react';

const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
  },
  header: {
    textAlign: 'center',
    color: '#333',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '8px',
  },
  td: {
    border: '1px solid #ddd',
    padding: '8px',
  },
  select: {
    width: '100%',
    padding: '10px',
    marginTop: '10px',
    marginBottom: '20px',
    boxSizing: 'border-box',
  },
  capacityInfo: {
    textAlign: 'center',
    margin: '20px 0',
    padding: '10px',
    backgroundColor: '#f2f2f2',
    borderRadius: '4px',
  },
};

const HotelDirectory = () => {
  const [availableRooms, setAvailableRooms] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [selectedHotelId, setSelectedHotelId] = useState('');
  const [hotelCapacity, setHotelCapacity] = useState({});
  const [sort, setSort] = useState('Country');
  const [order, setOrder] = useState('ASC');

  useEffect(() => {
    fetch(`http://localhost:3001/available-rooms-per-area?sort=${sort}&order=${order}`)
      .then(response => response.json())
      .then(data => setAvailableRooms(data))
      .catch(error => console.error('Error fetching available rooms per area:', error));
  }, [sort, order]);

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

  const handleSortChange = (e) => {
    const [newSort, newOrder] = e.target.value.split('-');
    setSort(newSort);
    setOrder(newOrder);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Hotel Directory</h2>

      <section>
        <h3>Sort Available Rooms</h3>
        <select style={styles.select} onChange={handleSortChange} value={`${sort}-${order}`}>
          <option value="Country-ASC">Country Ascending</option>
          <option value="Country-DESC">Country Descending</option>
          <option value="City-ASC">City Ascending</option>
          <option value="City-DESC">City Descending</option>
          <option value="AvailableRooms-ASC">Available Rooms Ascending</option>
          <option value="AvailableRooms-DESC">Available Rooms Descending</option>
        </select>
      </section>

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
            {availableRooms.map(area => (
              <tr key={`${area.Country}-${area.City}`}>
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

export default HotelDirectory;
