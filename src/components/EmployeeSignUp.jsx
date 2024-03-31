import React, { useState } from 'react';
import './SignUpForm.css';

function EmployeeSignUp() {
  const [formData, setFormData] = useState({
    hotelID: '',
    role: '',
    firstName: '',
    middleName: '',
    lastName: '',
    street: '',
    city: '',
    postalCode: '',
    ssn: '',
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const url = 'http://localhost:3001/employees';

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })
    .then(response => response.json())
    .then(data => {
      console.log('Success:', data);
      alert('Form submitted! Check the console for the confirmation.');
      window.location.reload();
    })
    .catch((error) => {
      console.error('Error:', error);
      alert('Error submitting form');
    });
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <h2 className="form-title">Employee Sign Up</h2>
        
        <input className="form-input" type="text" name="hotelID" placeholder="Hotel ID" value={formData.hotelID} onChange={handleChange} required />
        
        <select className="form-input" name="role" value={formData.role} onChange={handleChange} required>
          <option value="">Select Role</option>
          <option value="Manager">Manager</option>
          <option value="Reception">Reception</option>
          <option value="Housekeeper">Housekeeper</option>
        </select>
        
        <input className="form-input" type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} required />
        
        <input className="form-input" type="text" name="middleName" placeholder="Middle Name (Optional)" value={formData.middleName} onChange={handleChange} />
        
        <input className="form-input" type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} required />
        
        <input className="form-input" type="text" name="street" placeholder="Street" value={formData.street} onChange={handleChange} required />
        
        <input className="form-input" type="text" name="city" placeholder="City" value={formData.city} onChange={handleChange} required />
        
        <input className="form-input" type="text" name="postalCode" placeholder="Postal Code" value={formData.postalCode} onChange={handleChange} required />
        
        <input className="form-input" type="text" name="ssn" placeholder="SSN" value={formData.ssn} onChange={handleChange} required />
        
        <input className="form-input" type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
        
        <input className="form-input" type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
        
        <div className="button-container">
          <button className="form-button" type="submit">Submit</button>
        </div>
      </form>
    </div>
  );
}

export default EmployeeSignUp;
