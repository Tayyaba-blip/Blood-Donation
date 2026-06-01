import React, { useState } from "react";
import "./FindBlood.css";

const FindBlood = () => {

  const [formData, setFormData] = useState({
    bloodGroup: "",
    state: "",
    district: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = () => {
    console.log(formData);
    alert("Searching for donors...");
  };

  return (
    <div className="findblood-container">

      <div className="findblood-card">

        {/* Left Gradient Panel */}
        <div className="findblood-left"></div>

        {/* Right Form */}
        <div className="findblood-right">

          <h2>Recipient Details</h2>

          {/* Blood Group */}
          <div className="form-group">
            <label>Blood Group</label>
            <select name="bloodGroup" onChange={handleChange}>
              <option>Select Blood Group</option>
              <option>A+</option>
              <option>A-</option>
              <option>B+</option>
              <option>B-</option>
              <option>AB+</option>
              <option>AB-</option>
              <option>O+</option>
              <option>O-</option>
            </select>
          </div>

          {/* Current Location */}
          <button className="location-btn">
            Current Location
          </button>

          <p className="or-text">OR</p>

          {/* State */}
          <div className="form-group">
            <label>State</label>
            <select name="state" onChange={handleChange}>
              <option>Select State</option>
              <option>Punjab</option>
              <option>Sindh</option>
              <option>KPK</option>
              <option>Balochistan</option>
            </select>
          </div>

          {/* District */}
          <div className="form-group">
            <label>District</label>
            <select name="district" onChange={handleChange}>
              <option>Select District</option>
              <option>Lahore</option>
              <option>Karachi</option>
              <option>Islamabad</option>
            </select>
          </div>

          {/* Proceed Button */}
          <div className="proceed-row">
            <button className="proceed-btn" onClick={handleSubmit}>
              Proceed →
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};

export default FindBlood;