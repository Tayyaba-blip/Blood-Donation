import React, { useState } from "react";
import styles from "./RegisterOrganization.module.css";

const RegisterOrganization = () => {

  const [formData, setFormData] = useState({
    organizationName: "",
    address: "",
    headName: "",
    phone: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    alert("Organization Registered Successfully!");
  };

  return (
    <div className={styles["org-container"]}>

      {/* Header */}
      <div className={styles["org-header"]}>
        <h2>Register As Organization</h2>
      </div>

      {/* Form */}
      <form className={styles["org-form"]} onSubmit={handleSubmit}>

        <div className={styles["form-group"]}>
          <label>Organization Name</label>
          <input
            type="text"
            placeholder="Name"
            name="organizationName"
            onChange={handleChange}
          />
        </div>

        <div className={styles["form-group"]}>
          <label>Address</label>
          <textarea
            placeholder="Type Here"
            name="address"
            onChange={handleChange}
          ></textarea>
        </div>

        <div className={styles["form-group"]}>
          <label>Head of Organization</label>
          <input
            type="text"
            placeholder="Name"
            name="headName"
            onChange={handleChange}
          />
        </div>

        <div className={styles["form-group"]}>
          <label>Phone Number</label>
          <input
            type="text"
            placeholder="Number"
            name="phone"
            onChange={handleChange}
          />
        </div>

        <div className={styles["submit-row"]}>
          <button type="submit">
            Submit ✓
          </button>
        </div>

      </form>
    </div>
  );
};

export default RegisterOrganization;