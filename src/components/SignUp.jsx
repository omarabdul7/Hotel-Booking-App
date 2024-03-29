import React, { useState } from 'react';
import './SignUpForm.css';

function SignUp() {
  const [activeForm, setActiveForm] = useState('customer'); 
  const [customerFormData, setCustomerFormData] = useState({
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

  const [employeeFormData, setEmployeeFormData] = useState({
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

  const handleCustomerChange = (e) => {
    const { name, value } = e.target;
    setCustomerFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleEmployeeChange = (e) => {
    const { name, value } = e.target;
    setEmployeeFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const url = activeForm === 'customer' ? 'http://localhost:3001/customers' : 'http://localhost:3001/employees';
    const data = activeForm === 'customer' ? customerFormData : employeeFormData;

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
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
      <div className="form-selection">
        <button className="form-button" onClick={() => setActiveForm('customer')}>Customer Sign Up</button>
        <button className="form-button" onClick={() => setActiveForm('employee')}>Employee Sign Up</button>
      </div>

      {activeForm === 'customer' ? (
        <form onSubmit={handleSubmit}>
        <h2 className="form-title">Customer Sign Up</h2>
        
        <input className="form-input" type="text"  name="firstName" placeholder="First Name" value={customerFormData.firstName} onChange={handleCustomerChange} required />
        
        <input className="form-input" type="text" name="middleName" placeholder="Middle Name (Optional)" value={customerFormData.middleName} onChange={handleCustomerChange} />
        
        <input className="form-input" type="text" name="lastName" placeholder="Last Name" value={customerFormData.lastName} onChange={handleCustomerChange} required />
        
        <input className="form-input" type="text" name="city" placeholder="City" value={customerFormData.city} onChange={handleCustomerChange} required />
        
        <input className="form-input" type="text" name="street" placeholder="Street Name and Number" value={customerFormData.street} onChange={handleCustomerChange} required />
        
        <input className="form-input" type="text" name="postalCode" placeholder="Postal Code" value={customerFormData.postalCode} onChange={handleCustomerChange} required />
        
        <input className="form-input" type="email" name="email" placeholder="Email" value={customerFormData.email} onChange={handleCustomerChange} required />
        
        <input className="form-input" type="tel" name="phoneNumber" placeholder="Phone Number" value={customerFormData.phoneNumber} onChange={handleCustomerChange} required />
        
        <select className="form-input" name="idType" value={customerFormData.idType} onChange={handleCustomerChange} required>
          <option value="">Select ID Type</option>
          <option value="Passport">Passport</option>
          <option value="driverLicense">Driver's License</option>
          <option value="SSN">SSN</option>
        </select>
        
          <input className="form-input" type="password" name="password" placeholder="Password" value={customerFormData.password} onChange={handleCustomerChange} required />
          <div className="button-container">
            <button className="form-button" type="submit">Submit</button>
          </div>
        </form>
      ) : (
// Inside your SignUp component, assuming you have a form toggle set up as described previously
<form onSubmit={handleSubmit}>
  <h2 className="form-title">Employee Sign Up</h2>
  <input className="form-input" type="text" name="hotelID" placeholder="Hotel ID" value={employeeFormData.hotelID} onChange={handleEmployeeChange} required />
  
  <select className="form-input" name="role" value={employeeFormData.role} onChange={handleEmployeeChange} required>
    <option value="">Select Role</option>
    <option value="1">Role 1</option>
    <option value="2">Role 2</option>
    <option value="3">Role 3</option>
  </select>
  
  <input className="form-input" type="text" name="firstName" placeholder="First Name" value={employeeFormData.firstName} onChange={handleEmployeeChange} required />
  
  <input className="form-input" type="text" name="middleName" placeholder="Middle Name (Optional)" value={employeeFormData.middleName} onChange={handleEmployeeChange} />
  
  <input className="form-input" type="text" name="lastName" placeholder="Last Name" value={employeeFormData.lastName} onChange={handleEmployeeChange} required />
  
  <input className="form-input" type="text" name="street" placeholder="Street" value={employeeFormData.street} onChange={handleEmployeeChange} required />
  
  <input className="form-input" type="text" name="city" placeholder="City" value={employeeFormData.city} onChange={handleEmployeeChange} required />
  
  <input className="form-input" type="text" name="postalCode" placeholder="Postal Code" value={employeeFormData.postalCode} onChange={handleEmployeeChange} required />
  
  <input className="form-input" type="text" name="ssn" placeholder="SSN" value={employeeFormData.ssn} onChange={handleEmployeeChange} required />
  
  <input className="form-input" type="email" name="email" placeholder="Email" value={employeeFormData.email} onChange={handleEmployeeChange} required />
  
  <input className="form-input" type="password" name="password" placeholder="Password" value={employeeFormData.password} onChange={handleEmployeeChange} required />
  
  <div className="button-container">
    <button className="form-button" type="submit">Submit</button>
  </div>
</form>

      )}
    </div>
  );
}

export default SignUp;
