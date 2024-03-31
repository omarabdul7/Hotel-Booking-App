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
app.use(express.json()); 

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

// View 1:
app.get("/available-rooms-per-area", (req, res) => {
  const query = `SELECT * FROM AvailableRoomsPerArea;`;

  db.query(query, (error, results) => {
    if (error) {
      console.error('Error fetching available rooms per area:', error);
      res.status(500).send('Error fetching available rooms per area');
      return;
    }
    res.json(results);
  });
});




// View 2: 
app.get("/hotel-capacity", (req, res) => {
  const { hotelId } = req.query;
  if (!hotelId) {
    return res.status(400).send('Hotel ID is required');
  }

  const query = `SELECT * FROM HotelTotalCapacity WHERE Hotel_ID = ?;`;

  db.query(query, [hotelId], (error, results) => {
    if (error) {
      console.error('Error fetching hotel capacity:', error);
      res.status(500).send('Error fetching hotel capacity');
      return;
    }
    // Assuming the view might not return a result for every hotel, check for empty results
    if (results.length > 0) {
      res.json(results[0]);
    } else {
      res.json({ TotalCapacity: 0 });
    }
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

app.get("/bookings-by-hotel", (req, res) => {
  const { hotelId } = req.query;
  const query = `
    SELECT 
      Booking.Booking_ID,
      Booking.Checkin_Year, 
      Booking.Checkin_Month, 
      Booking.Checkin_Day,
      Booking.Checkout_Year, 
      Booking.Checkout_Month, 
      Booking.Checkout_Day,
      Room.Room_ID,
      Customer.Customer_ID,
      Customer.First_Name,
      Customer.Last_Name
    FROM Booking
    JOIN Room ON Booking.Room_ID = Room.Room_ID
    JOIN Customer ON Booking.Customer_ID = Customer.Customer_ID
    WHERE Room.Hotel_ID = ?
    ORDER BY Booking.Checkin_Year DESC, Booking.Checkin_Month DESC, Booking.Checkin_Day DESC;
  `;

  db.query(query, [hotelId], (error, results) => {
    if (error) {
      console.error('Error fetching bookings:', error);
      res.status(500).send('Error fetching bookings');
      return;
    }
    res.json(results);
  });
});


// Endpoint to transform a booking into a renting record
app.post("/transform-booking", (req, res) => {
  const { Booking_ID, Room_ID, Customer_ID, Employee_ID, Checkin_Year, Checkin_Month, Checkin_Day, Checkout_Year, Checkout_Month, Checkout_Day, Card_Number, CVV, Expiry_Date } = req.body;

  // SQL to insert into Renting table (adjust according to your table structure)
  const query = `
    INSERT INTO Renting (Room_ID, Booking_ID, Customer_ID, Employee_ID, Checkin_Year, Checkin_Month, Checkin_Day, Checkout_Year, Checkout_Month, Checkout_Day, Card_Number, CVV, Expiry_Date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [Room_ID, Booking_ID, Customer_ID, Employee_ID, Checkin_Year, Checkin_Month, Checkin_Day, Checkout_Year, Checkout_Month, Checkout_Day, Card_Number, CVV, Expiry_Date];

  db.query(query, values, (error, results) => {
    if (error) {
      console.error('Error transforming booking:', error);
      res.status(500).send('Error transforming booking');
      return;
    }
    res.send({ message: 'Booking transformed successfully', rentingID: results.insertId });
  });
});

app.post("/create-renting", (req, res) => {
  const { roomId, Customer_ID, checkInDate, checkOutDate, cardNumber, cvv, expiryDate, Employee_ID} = req.body;
  
  // Assuming checkInDate and checkOutDate are in 'YYYY-MM-DD' format
  const checkInParts = checkInDate.split('-');
  const checkOutParts = checkOutDate.split('-');

  const checkInYear = checkInParts[0];
  const checkInMonth = checkInParts[1];
  const checkInDay = checkInParts[2];

  const checkOutYear = checkOutParts[0];
  const checkOutMonth = checkOutParts[1];
  const checkOutDay = checkOutParts[2];
  
  // Adjust the INSERT query to use the split date parts
  const query = `
    INSERT INTO Renting (Room_ID, Customer_ID, Checkin_Year, Checkin_Month, Checkin_Day, Checkout_Year, Checkout_Month, Checkout_Day, Card_Number, CVV, Expiry_Date, Employee_ID)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [roomId, Customer_ID, checkInYear, checkInMonth, checkInDay, checkOutYear, checkOutMonth, checkOutDay, cardNumber, cvv, expiryDate, Employee_ID];

  db.query(query, values, (error, results) => {
    if (error) {
      console.error('Error creating renting:', error);
      res.status(500).send('Error creating renting');
      return;
    }
    res.send({ message: 'Renting created successfully', rentingID: results.insertId });
  });
});

app.post('/employees', (req, res) => {
  const { hotelID, role, firstName, middleName, lastName, street, city, postalCode, ssn, email, password } = req.body;

  const query = `
    INSERT INTO Employee (Hotel_ID, Role_ID, First_Name, Middle_Name, Last_Name, Street, City, Postal_Code, SSN, Email, Password)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [hotelID, role, firstName, middleName, lastName, street, city, postalCode, ssn, email, password];

  db.query(query, values, (error, results) => {
    if (error) {
      console.error('Error adding new employee:', error);
      res.status(500).send('Error adding new employee');
    } else {
      res.status(201).send({ message: 'New employee created', employeeID: results.insertId });
    }
  });
});

app.post("/create-room", (req, res) => {
  const { hotelId, price, capacity, amenities, seaView, mountainView, extendable, damageStatus } = req.body;
  
  const query = `
    INSERT INTO Room (Hotel_ID, Price, Capacity, Amenities, Sea_View, Mountain_View, Extendable, Damage_Status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(query, [hotelId, price, capacity, amenities, seaView, mountainView, extendable, damageStatus], (error, results) => {
    if (error) {
      console.error('Error creating room:', error);
      res.status(500).send('Error creating room');
      return;
    }
    res.status(201).send({ message: 'Room created successfully', roomId: results.insertId });
  });
});

app.delete("/delete-room", (req, res) => {
  const { roomId } = req.query;
  if (!roomId) {
    return res.status(400).send('Room ID is required');
  }

  const query = "DELETE FROM Room WHERE Room_ID = ?";
  db.query(query, [roomId], (error, results) => {
    if (error) {
      console.error('Error deleting room:', error);
      return res.status(500).send('Error deleting room');
    }
    res.send({ message: 'Room deleted successfully' });
  });
});


app.get("/rentings", (req, res) => {
  // Assuming you have a table named `Renting` where all renting records are stored.
  const query = `
    SELECT Renting.*, Room.Room_ID, Customer.First_Name, Customer.Last_Name 
    FROM Renting
    JOIN Room ON Renting.Room_ID = Room.Room_ID
    JOIN Customer ON Renting.Customer_ID = Customer.Customer_ID
    ORDER BY Renting.Checkin_Year DESC, Renting.Checkin_Month DESC, Renting.Checkin_Day DESC;
  `;

  db.query(query, (error, results) => {
    if (error) {
      console.error('Error fetching rentings:', error);
      res.status(500).send('Error fetching rentings');
      return;
    }
    res.json(results);
  });
});

app.post("/archive-renting", (req, res) => {
  const { rentingId } = req.body; // Assuming the renting ID is sent in the request body

  // Step 1: Fetch the renting record to be archived
  const fetchQuery = "SELECT * FROM Renting WHERE Renting_ID = ?";
  
  db.query(fetchQuery, [rentingId], (fetchError, fetchResults) => {
    if (fetchError || fetchResults.length === 0) {
      console.error('Error fetching renting for archive:', fetchError);
      res.status(500).send('Error fetching renting for archive');
      return;
    }
    
    const renting = fetchResults[0];
    // Step 2: Insert the record into the Archive table
    const archiveQuery = "INSERT INTO Archive (Checkin_Year, Checkin_Month, Checkin_Day, Checkout_Year, Checkout_Month, Checkout_Day, Employee_ID, Room_ID, Customer_ID) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    db.query(archiveQuery, [renting.Checkin_Year, renting.Checkin_Month, renting.Checkin_Day, renting.Checkout_Year, renting.Checkout_Month, renting.Checkout_Day, renting.Employee_ID, renting.Room_ID, renting.Customer_ID], (archiveError, archiveResults) => {
      if (archiveError) {
        console.error('Error archiving renting:', archiveError);
        res.status(500).send('Error archiving renting');
        return;
      }
      
      // Step 3: Delete the original renting record
      const deleteQuery = "DELETE FROM Renting WHERE Renting_ID = ?";
      
      db.query(deleteQuery, [rentingId], (deleteError, deleteResults) => {
        if (deleteError) {
          console.error('Error deleting original renting:', deleteError);
          res.status(500).send('Error deleting original renting');
          return;
        }
        
        res.send({ message: 'Renting archived successfully' });
      });
    });
  });
});

app.delete("/delete-employee", (req, res) => {
  const { employeeId } = req.query;
  if (!employeeId) {
    return res.status(400).send('Employee ID is required');
  }

  const query = "DELETE FROM Employee WHERE Employee_ID = ?";
  db.query(query, [employeeId], (error, results) => {
    if (error) {
      console.error('Error deleting employee:', error);
      return res.status(500).send('Error deleting employee');
    }
    if (results.affectedRows === 0) {
      // No rows affected means no employee was found/deleted
      return res.status(404).send('Employee not found');
    }
    res.send({ message: 'Employee deleted successfully' });
  });
});



app.get("/employees-by-hotel", (req, res) => {
  const { hotelId } = req.query;
  if (!hotelId) {
    return res.status(400).send('Hotel ID is required');
  }

  const query = "SELECT Employee_ID, First_Name, Last_Name, Role_ID, Email FROM Employee WHERE Hotel_ID = ?";
  db.query(query, [hotelId], (error, results) => {
    if (error) {
      console.error('Error fetching employees:', error);
      return res.status(500).send('Error fetching employees');
    }
    res.json(results);
  });
});


// Start the server
app.listen(3001, () => {
  console.log(`Server running on port 3001`);
});
