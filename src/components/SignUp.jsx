import React, { useState } from 'react';
import './SignUpForm.css';

function SignUp() {
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    city: '',
    street: '',
    postalCode: '',
    email: '',
    phoneNumber: '',
    idType: '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const validateEmail = (email) => {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  const validatePhoneNumber = (number) => {
    return number.length === 9 && /^\d+$/.test(number);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate email and phone number
    if (!validateEmail(formData.email)) {
      alert('Please enter a valid email address.');
      return;
    }
    if (!validatePhoneNumber(formData.phoneNumber)) {
      alert('Phone number must be exactly 9 digits.');
      return;
    }

    const url = 'http://localhost:3001/customers';

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
        <h2 className="form-title">Customer Sign Up</h2>

        <input className="form-input" type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} required />
        
        <input className="form-input" type="text" name="middleName" placeholder="Middle Name (Optional)" value={formData.middleName} onChange={handleChange} />
        
        <input className="form-input" type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} required />
        
        <input className="form-input" type="text" name="city" placeholder="City" value={formData.city} onChange={handleChange} required />
        
        <input className="form-input" type="text" name="street" placeholder="Street Name and Number" value={formData.street} onChange={handleChange} required />
        
        <input className="form-input" type="text" name="postalCode" placeholder="Postal Code" value={formData.postalCode} onChange={handleChange} required />
        
        <input className="form-input" type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
        
        <input className="form-input" type="tel" name="phoneNumber" placeholder="Phone Number" value={formData.phoneNumber} onChange={handleChange} required />
        
        <select className="form-input" name="idType" value={formData.idType} onChange={handleChange} required>
          <option value="">Select ID Type</option>
          <option value="Passport">Passport</option>
          <option value="driverLicense">Driver's License</option>
          <option value="SSN">SSN</option>
        </select>
        
        <input className="form-input" type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
        
        <div className="button-container">
          <button className="form-button" type="submit">Submit</button>
        </div>
      </form>
    </div>
  );
}

export default SignUp;
