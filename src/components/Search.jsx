import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Search() {
  const [rooms, setRooms] = useState([]);
  const [checkin, setCheckin] = useState('');
  const [checkout, setCheckout] = useState('');
  const [capacity, setCapacity] = useState('');
  const [rating, setRating] = useState('');
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const navigate = useNavigate();
  
  
  useEffect(() => {
    fetch('http://localhost:3001/countries')
      .then(response => response.json())
      .then(data => {
        setCountries(data);
      })
      .catch(error => console.error('Error fetching countries:', error));
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      fetch(`http://localhost:3001/cities?country=${encodeURIComponent(selectedCountry)}`)
        .then(response => response.json())
        .then(data => {
          setCities(data);
          setSelectedCity(''); // Reset city selection
        })
        .catch(error => console.error('Error fetching cities:', error));
    } else {
      setCities([]);
      setSelectedCity('');
    }
  }, [selectedCountry]);

  
  const handleSearch = () => {
    if (!checkin || !checkout) {
      alert('Please select both check-in and check-out dates.');
      return;
    }

    if (new Date(checkin) > new Date(checkout)) {
      alert('Check-in date cannot be after check-out date.');
      return;
    }

    const url = new URL('http://localhost:3001/search');
    url.searchParams.append('checkin', checkin);
    url.searchParams.append('checkout', checkout);
    if (capacity) url.searchParams.append('capacity', capacity);
    if (rating) url.searchParams.append('rating', rating);
    if (selectedCountry) url.searchParams.append('country', selectedCountry);
    if (selectedCity) url.searchParams.append('city', selectedCity);

    fetch(url)
      .then(response => response.json())
      .then(data => {
        setRooms(data);
      })
      .catch(error => console.error('Error fetching available rooms:', error));
  };

  const handleBookRoom = (room) => {
    console.log(room); // Log the room data
    navigate(`/book-room/${room.Room_ID}`, {
      state: {
        selectedRoom: room,
        checkinDate: checkin,
        checkoutDate: checkout
      }
    });
  };
  
  


  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', color: '#333' }}>Room Search</h2>
      <input
        type="date"
        value={checkin}
        onChange={e => setCheckin(e.target.value)}
        style={{ padding: '10px', margin: '0 10px 20px 0', borderRadius: '5px', border: '1px solid #ddd', width: '150px', display: 'inline-block' }}
      />
      <input
        type="date"
        value={checkout}
        onChange={e => setCheckout(e.target.value)}
        style={{ padding: '10px', margin: '0 10px 20px 0', borderRadius: '5px', border: '1px solid #ddd', width: '150px', display: 'inline-block' }}
      />
      <input
        type="number"
        placeholder="Capacity"
        value={capacity}
        onChange={e => setCapacity(e.target.value)}
        min="0"
        style={{ padding: '10px', margin: '0 10px 20px 0', borderRadius: '5px', border: '1px solid #ddd', width: '150px', display: 'inline-block' }}
      />
      <input
        type="number"
        placeholder="Hotel Rating (1-5)"
        value={rating}
        onChange={e => setRating(e.target.value)}
        min="1"
        max="5"
        style={{ padding: '10px', margin: '0 10px 20px 0', borderRadius: '5px', border: '1px solid #ddd', width: '150px', display: 'inline-block' }}
      />
      <select
        value={selectedCountry}
        onChange={e => setSelectedCountry(e.target.value)}
        style={{ padding: '10px', margin: '0 10px 20px 0', borderRadius: '5px', border: '1px solid #ddd', width: '200px', display: 'inline-block' }}
      >
        <option value="">Select Country</option>
        {countries.map(country => (
          <option key={country} value={country}>{country}</option>
        ))}
      </select>
      <select
        value={selectedCity}
        onChange={e => setSelectedCity(e.target.value)}
        style={{ padding: '10px', margin: '0 10px 20px 0', borderRadius: '5px', border: '1px solid #ddd', width: '200px', display: 'inline-block' }}
        disabled={!selectedCountry}
      >
        <option value="">Select City</option>
        {cities.map(city => (
          <option key={city} value={city}>{city}</option>
        ))}
      </select>
      <button onClick={handleSearch} style={{ backgroundColor: '#007bff', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', marginBottom: '20px' }}>
        Search Available Rooms
      </button>
      {rooms.length > 0 ? (
        rooms.map(room => (
          <div key={room.Room_ID} style={{ border: '1px solid #ddd', borderRadius: '5px', padding: '15px', marginBottom: '10px', backgroundColor: '#f9f9f9' }}>
            <h3>{room.Name}</h3>
            <p>{room.Street}, {room.City}, {room.Country}</p>
            <p><strong>Price:</strong> ${room.Price}</p>
            <p><strong>Amenities:</strong> {room.Amenities}</p>
            <p><strong>Capacity:</strong> {room.Capacity}</p>
            {room.Sea_View === 1 && <p>Sea View</p>}
            {room.Mountain_View === 1 && <p>Mountain View</p>}
            {room.Extendable === 1 && <p>Extendable</p>}
            <button onClick={() => handleBookRoom(room)} style={{ backgroundColor: '#007bff', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Book</button>
          </div>
        ))
      ) : (
        <p>No rooms found. Try adjusting your search criteria.</p>

               )}
             </div>
           );
         }
         
         export default Search;
         