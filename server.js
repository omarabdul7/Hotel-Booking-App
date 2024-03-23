const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();

// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'hotel_database'
});

db.connect(error => {
  if (error) {
    console.error('Error connecting to the database:', error);
    return;
  }
  console.log("Successfully connected to the database.");
});

// Middleware
app.use(cors());
app.use(express.json()); // for parsing application/json

// Test endpoint
app.get('/', (req, res) => {
  res.json('Server is running!');
});

// Filtered search endpoint for available rooms including area (country and city)
app.get("/search", (req, res) => {
  const { checkin, checkout, capacity, rating, country, city } = req.query;

  let query = `
    SELECT Room.Room_ID, Hotel.Name, Hotel.Street, Hotel.City, Hotel.Country, Room.Price, Room.Amenities, Room.Capacity, Room.Sea_View, Room.Mountain_View, Room.Extendable, Room.Damage_Status, Hotel.Hotel_Category 
    FROM Room
    JOIN Hotel ON Room.Hotel_ID = Hotel.Hotel_ID
    WHERE Room.Room_ID NOT IN (
      SELECT Room_ID FROM Booking
      WHERE 
        STR_TO_DATE(CONCAT(Checkout_Year, '-', Checkout_Month, '-', Checkout_Day), '%Y-%c-%e') > STR_TO_DATE(?, '%Y-%m-%d')
        AND
        STR_TO_DATE(CONCAT(Checkin_Year, '-', Checkin_Month, '-', Checkin_Day), '%Y-%c-%e') < STR_TO_DATE(?, '%Y-%m-%d')
    )
  `;

  let queryParams = [checkin, checkout];

  // Add capacity filter to the SQL query if provided
  if (capacity) {
    query += ' AND Capacity >= ?';
    queryParams.push(capacity);
  }

  // Add rating filter to the SQL query if provided
  if (rating) {
    query += ' AND Hotel.Hotel_Category = ?';
    queryParams.push(rating);
  }

  // Add country filter to the SQL query if provided
  if (country) {
    query += ' AND Hotel.Country = ?';
    queryParams.push(country);
  }

  // Add city filter to the SQL query if provided
  if (city) {
    query += ' AND Hotel.City = ?';
    queryParams.push(city);
  }
  
  db.query(query, queryParams, (error, results) => {
    if (error) {
      console.error('Error fetching available rooms:', error);
      res.status(500).send('Error fetching available rooms');
      return;
    }
    res.json(results);
  });
});

// Endpoint to fetch unique countries
app.get("/countries", (req, res) => {
  db.query("SELECT DISTINCT Country FROM Hotel ORDER BY Country", (error, results) => {
    if (error) {
      console.error('Error fetching countries:', error);
      res.status(500).send('Error fetching countries');
      return;
    }
    res.json(results.map(result => result.Country));
  });
});

// Endpoint to fetch unique cities based on a given country
app.get("/cities", (req, res) => {
  const { country } = req.query;
  db.query("SELECT DISTINCT City FROM Hotel WHERE Country = ? ORDER BY City", [country], (error, results) => {
    if (error) {
      console.error('Error fetching cities:', error);
      res.status(500).send('Error fetching cities');
      return;
    }
    res.json(results.map(result => result.City));
  });
});

app.get("/available-rooms-per-area", (req, res) => {
  const { sort = 'Country', order = 'ASC' } = req.query;
  const validSortColumns = ['Country', 'City', 'AvailableRooms'];
  const sortOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

  if (!validSortColumns.includes(sort)) {
    return res.status(400).send('Invalid sort parameter');
  }

  const query = `
    SELECT h.Country, h.City, COUNT(r.Room_ID) AS AvailableRooms
    FROM Room r
    JOIN Hotel h ON r.Hotel_ID = h.Hotel_ID
    LEFT JOIN Booking b ON r.Room_ID = b.Room_ID
    WHERE b.Room_ID IS NULL
    OR b.Checkout_Day < DAY(CURDATE())
    OR (b.Checkout_Month < MONTH(CURDATE()) AND b.Checkout_Year <= YEAR(CURDATE()))
    OR (b.Checkout_Year < YEAR(CURDATE()))
    GROUP BY h.Country, h.City
    ORDER BY ${sort} ${sortOrder};`;

  db.query(query, (error, results) => {
    if (error) {
      console.error('Error fetching available rooms per area:', error);
      res.status(500).send('Error fetching available rooms per area');
      return;
    }
    res.json(results);
  });
});


// View 2: Aggregated Capacity of All Rooms of a Specific Hotel
app.get("/hotel-capacity", (req, res) => {
  const { hotelId } = req.query;
  const query = `
    SELECT Hotel.Name, SUM(Room.Capacity) AS TotalCapacity
    FROM Room
    JOIN Hotel ON Room.Hotel_ID = Hotel.Hotel_ID
    WHERE Hotel.Hotel_ID = ?
    GROUP BY Hotel.Hotel_ID;
  `;

  db.query(query, [hotelId], (error, results) => {
    if (error) {
      console.error('Error fetching hotel capacity:', error);
      res.status(500).send('Error fetching hotel capacity');
      return;
    }
    res.json(results[0] || { TotalCapacity: 0 });
  });
});

// Endpoint to fetch all hotels
app.get("/hotels", (req, res) => {
  db.query("SELECT Hotel_ID, Name FROM Hotel ORDER BY Name", (error, results) => {
    if (error) {
      console.error('Error fetching hotels:', error);
      res.status(500).send('Error fetching hotels');
      return;
    }
    res.json(results);
  });
});

// Start the server
app.listen(3001, () => {
  console.log(`Server running on port 3001`);
});
