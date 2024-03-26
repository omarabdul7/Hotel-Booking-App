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
app.post("/customers", (req, res) => {
  let { firstName, middleName, lastName, street, city, postalCode, email, phoneNumber, idType, password } = req.body;

  // Normalize phone number to a specific format or remove non-numeric characters as needed
  phoneNumber = phoneNumber.replace(/\D/g, ''); // Remove any non-numeric characters
  if (phoneNumber.length === 10) {
    phoneNumber = `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6)}`;
  }

  // Adjust ID type value if necessary
  if (idType === 'driverLicense') {
    idType = "Driver's Licence";
  }

  // Get current date for registration timestamp
  const currentDate = new Date();
  const registrationYear = currentDate.getFullYear();
  const registrationMonth = currentDate.getMonth() + 1; // getMonth() returns 0-11, need 1-12
  const registrationDay = currentDate.getDate();

  // Validate required fields are provided
  if (!firstName || !lastName || !street || !city || !postalCode || !email || !phoneNumber || !idType || !password) {
    console.error('Missing required fields:', req.body);
    return res.status(400).send('Missing required fields');
  }

  const query = `
    INSERT INTO Customer (First_Name, Middle_Name, Last_Name, Street, City, Postal_Code, Email, PhoneNumber, ID_Type, Registration_Day, Registration_Month, Registration_Year, Password)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const queryParams = [
    firstName,
    middleName,
    lastName,
    street,
    city,
    postalCode,
    email,
    phoneNumber,
    idType,
    registrationDay,
    registrationMonth,
    registrationYear,
    password 
  ];

  db.query(query, queryParams, (error, results) => {
    if (error) {
      console.error('Error adding new customer:', error);
      return res.status(500).send('Error adding new customer');
    }
    res.status(201).send({ message: 'New customer created', customerID: results.insertId });
  });
});

// Endpoint to verify customer credentials
app.post("/verify-customer", (req, res) => {
  const { email, password } = req.body;
  const query = "SELECT Customer_ID FROM Customer WHERE Email = ? AND Password = ?";

  db.query(query, [email, password], (error, results) => {
    if (error) {
      return res.status(500).send('Error verifying customer credentials');
    }
    if (results.length > 0) {
      res.json({ isValid: true, customerID: results[0].Customer_ID });
    } else {
      res.status(401).send('Invalid credentials');
    }
  });
});


// Endpoint to create a new booking
app.post("/create-booking", (req, res) => {
  const {
    customerID, roomID,
    Checkin_Year, Checkin_Month, Checkin_Day,
    Checkout_Year, Checkout_Month, Checkout_Day
  } = req.body;

  const query = `
    INSERT INTO Booking (Customer_ID, Room_ID, Checkin_Year, Checkin_Month, Checkin_Day, Checkout_Year, Checkout_Month, Checkout_Day)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(query, [customerID, roomID, Checkin_Year, Checkin_Month, Checkin_Day, Checkout_Year, Checkout_Month, Checkout_Day], (error, results) => {
    if (error) {
      return res.status(500).send('Error creating booking');
    }
    const bookingID = results.insertId;
    res.status(201).send({ message: 'Booking created', bookingID });
  });
});


app.get("/bookings", (req, res) => {
  const { customerID } = req.query;

  // Ensure customerID is provided
  if (!customerID) {
    return res.status(400).send('Customer ID is required');
  }

  const query = `
    SELECT Booking.Booking_ID, Booking.Checkin_Year, Booking.Checkin_Month, Booking.Checkin_Day, 
           Booking.Checkout_Year, Booking.Checkout_Month, Booking.Checkout_Day, Room.Room_ID, 
           Hotel.Name AS HotelName, Room.Price
    FROM Booking
    JOIN Room ON Booking.Room_ID = Room.Room_ID
    JOIN Hotel ON Room.Hotel_ID = Hotel.Hotel_ID
    WHERE Booking.Customer_ID = ?
    ORDER BY Booking.Checkin_Year DESC, Booking.Checkin_Month DESC, Booking.Checkin_Day DESC;
  `;

  db.query(query, [customerID], (error, results) => {
    if (error) {
      console.error('Error fetching bookings:', error);
      res.status(500).send('Error fetching bookings');
      return;
    }
    res.json(results);
  });
});

app.delete("/delete-booking", (req, res) => {
  const { bookingID } = req.query;
  if (!bookingID) {
    return res.status(400).send('Booking ID is required');
  }

  const query = "DELETE FROM Booking WHERE Booking_ID = ?";
  db.query(query, [bookingID], (error, results) => {
    if (error) {
      console.error('Error deleting booking:', error);
      return res.status(500).send('Error deleting booking');
    }
    res.send({ message: 'Booking deleted' });
  });
});

// Endpoint to verify employee credentials
app.post("/verify-employee", (req, res) => {
  const { email, password } = req.body;
  const query = "SELECT Employee_ID, Hotel_ID FROM Employee WHERE Email = ? AND Password = ?";

  db.query(query, [email, password], (error, results) => {
    if (error) {
      return res.status(500).send('Error verifying employee credentials');
    }
    if (results.length > 0) {
      res.json({ isValid: true, employeeID: results[0].Employee_ID, hotelID: results[0].Hotel_ID });
    } else {
      res.status(401).send('Invalid credentials');
    }
  });
});


// Endpoint to fetch rooms based on Hotel_ID
app.get("/rooms-by-hotel", (req, res) => {
  const { hotelId } = req.query;
  db.query("SELECT * FROM Room WHERE Hotel_ID = ?", [hotelId], (error, results) => {
    if (error) {
      console.error('Error fetching rooms:', error);
      res.status(500).send('Error fetching rooms');
      return;
    }
    res.json(results);
  });
});

// Endpoint to update room details
app.post("/update-room", (req, res) => {
  const { Room_ID, Price, Capacity, Amenities, Sea_View, Mountain_View, Extendable, Damage_Status } = req.body;
  const query = `
    UPDATE Room
    SET Price = ?, Capacity = ?, Amenities = ?, Sea_View = ?, Mountain_View = ?, Extendable = ?, Damage_Status = ?
    WHERE Room_ID = ?;
  `;
  const values = [Price, Capacity, Amenities, Sea_View, Mountain_View, Extendable, Damage_Status, Room_ID];

  db.query(query, values, (error, results) => {
    if (error) {
      console.error('Error updating room details:', error);
      res.status(500).send('Error updating room details');
      return;
    }
    res.send({ message: 'Room details updated successfully' });
  });
});


// Start the server
app.listen(3001, () => {
  console.log(`Server running on port 3001`);
});
