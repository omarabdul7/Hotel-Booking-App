# Hotel Booking App

A full-stack application for hotel booking management, allowing users to search for available rooms, make bookings, and hotel staff to manage reservations.

## Features

- **User Authentication**: Sign up and login functionality for customers and hotel employees
- **Room Search**: Filter available rooms by check-in/check-out dates, capacity, hotel rating, country, and city
- **Booking Management**: Make, view, and manage room bookings
- **Hotel Directory**: Browse through the list of hotels in the system
- **Admin Dashboard**: Management interface for hotel administrators
- **Responsive Design**: Modern UI accessible on different devices

## Tech Stack

### Frontend
- React.js
- React Router for navigation
- CSS for styling

### Backend
- Node.js
- Express.js
- MySQL for database

## Database Structure

The application uses a MySQL database with tables including:
- Hotel (Hotel_ID, Name, Street, City, Country, Hotel_Category)
- Room (Room_ID, Hotel_ID, Price, Amenities, Capacity, Sea_View, Mountain_View, Extendable, Damage_Status)
- Booking (with check-in and check-out details)
- Plus other tables for users, employees, etc.

## Setup Instructions

### Prerequisites
- Node.js and npm installed
- MySQL installed and running

### Database Setup
1. Create a MySQL database named `hotel_database`
2. Configure the database connection in `server.js` with your credentials:
   ```js
   const db = mysql.createConnection({
     host: 'localhost',
     user: 'your_username',
     password: 'your_password',
     database: 'hotel_database'
   });
   ```










## API Endpoints

- `GET /search`: Search available rooms with filtering options
- `GET /countries`: Get list of available countries
- `GET /cities`: Get list of cities for a selected country
- `GET /available-rooms-per-area`: Get statistics on room availability by area
- `GET /hotel-capacity`: Get capacity information for a specified hotel
- Plus other endpoints for bookings, authentication, etc.

## Usage

### For Customers
1. Browse the home page to see featured hotels
2. Use the search page to find available rooms based on your criteria
3. Select a room to book and complete the booking process
4. View and manage your bookings in the bookings section

### For Hotel Staff
1. Log in through the employee portal
2. Access the management dashboard
3. View and manage room bookings
4. Update room details and availability







