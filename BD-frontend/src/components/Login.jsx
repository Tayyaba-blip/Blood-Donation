// import React, { useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import styles from "./Login.module.css";

// const Login = () => {
//   const navigate = useNavigate();
//   const [loginMethod, setLoginMethod] = useState("password");
//   const [formData, setFormData] = useState({
//     identifier: "",
//     password: ""
//   });
//   const [otp, setOtp] = useState("");
//   const [otpSent, setOtpSent] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value
//     });
//   };

//   const handlePasswordLogin = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);
    
//     try {
//       const response = await axios.post('http://localhost:5000/api/auth/login', {
//         identifier: formData.identifier,
//         password: formData.password
//       });
      
//       if (response.data.success) {
//         localStorage.setItem('token', response.data.data.token);
//         localStorage.setItem('user', JSON.stringify(response.data.data));
//         navigate('/donordashboard');
//       }
//     } catch (err) {
//       setError(err.response?.data?.message || 'Login failed');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSendOTP = async () => {
//     setLoading(true);
//     setError(null);
    
//     try {
//       const response = await axios.post('http://localhost:5000/api/auth/send-login-otp', {
//         [formData.identifier.includes('@') ? 'email' : 'phone']: formData.identifier
//       });
      
//       if (response.data.success) {
//         setOtpSent(true);
//       }
//     } catch (err) {
//       setError(err.response?.data?.message || 'Failed to send OTP');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleOTPLogin = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);
    
//     try {
//       const response = await axios.post('http://localhost:5000/api/auth/verify-login-otp', {
//         [formData.identifier.includes('@') ? 'email' : 'phone']: formData.identifier,
//         otp
//       });
      
//       if (response.data.success) {
//         localStorage.setItem('token', response.data.data.token);
//         localStorage.setItem('user', JSON.stringify(response.data.data));
//         navigate('/dashboard');
//       }
//     } catch (err) {
//       setError(err.response?.data?.message || 'OTP verification failed');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className={styles["login-container"]}>
//       <div className={styles["login-card"]}>
//         <h2>Welcome Back</h2>
//         <p>Login to your account</p>

//         {/* Toggle */}
//         <div className={styles["login-method-toggle"]}>
//           <button 
//             className={loginMethod === 'password' ? styles.active : ""}
//             onClick={() => setLoginMethod('password')}
//           >
//             Password
//           </button>
//           <button 
//             className={loginMethod === 'otp' ? styles.active : ""}
//             onClick={() => setLoginMethod('otp')}
//           >
//             OTP Login
//           </button>
//         </div>

//         {error && (
//           <div className={styles["error-message"]}>
//             {error}
//           </div>
//         )}

//         {loginMethod === 'password' ? (
//           <form onSubmit={handlePasswordLogin}>
//             <div className={styles["form-group"]}>
//               <label>Email or Phone Number</label>
//               <input
//                 type="text"
//                 name="identifier"
//                 value={formData.identifier}
//                 onChange={handleChange}
//                 required
//               />
//             </div>

//             <div className={styles["form-group"]}>
//               <label>Password</label>
//               <input
//                 type="password"
//                 name="password"
//                 value={formData.password}
//                 onChange={handleChange}
//                 required
//               />
//             </div>

//             <button type="submit" disabled={loading}>
//               {loading ? "Logging in..." : "Login"}
//             </button>
//           </form>
//         ) : (
//           <div className={styles["otp-login"]}>
//             {!otpSent ? (
//               <div className={styles["otp-step"]}>
//                 <div className={styles["form-group"]}>
//                   <label>Email or Phone Number</label>
//                   <input
//                     type="text"
//                     name="identifier"
//                     value={formData.identifier}
//                     onChange={handleChange}
//                     required
//                   />
//                 </div>
//                 <button onClick={handleSendOTP} disabled={loading}>
//                   {loading ? "Sending..." : "Send OTP"}
//                 </button>
//               </div>
//             ) : (
//               <form onSubmit={handleOTPLogin}>
//                 <div className={styles["otp-info"]}>
//                   <p>OTP sent to:</p>
//                   <p className={styles["contact-info"]}>{formData.identifier}</p>
//                 </div>

//                 <div className={styles["form-group"]}>
//                   <label>Enter OTP</label>
//                   <input
//                     type="text"
//                     value={otp}
//                     onChange={(e) => setOtp(e.target.value)}
//                     maxLength="6"
//                     required
//                   />
//                 </div>

//                 <div className={styles["otp-actions"]}>
//                   <button type="button" onClick={handleSendOTP}>
//                     Resend OTP
//                   </button>
//                   <button type="submit" disabled={loading}>
//                     {loading ? "Verifying..." : "Login with OTP"}
//                   </button>
//                 </div>
//               </form>
//             )}
//           </div>
//         )}

//         <div className={styles["register-link"]}>
//           Don't have an account? <a href="/register-donor">Register here</a>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;

import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";

// ── Helper: read role from response and go to correct dashboard ──────────────
function redirectByRole(data, navigate) {
  const role = data.role;
  if (role === "organization") {
    navigate("/org/dashboard");
  } else {
    // donor or anything else
    navigate("/donor/dashboard");
  }
}

const Login = () => {
  const navigate = useNavigate();
  const [loginMethod, setLoginMethod] = useState("password");
  const [formData, setFormData] = useState({ identifier: "", password: "" });
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ── Password login ─────────────────────────────────────────────────────────
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Try donor login first
      let response;
      let isDonor = true;

      try {
        response = await axios.post("http://localhost:5000/api/auth/login", {
          identifier: formData.identifier,
          password: formData.password,
        });
      } catch (donorErr) {
        // If donor login fails (404 / 401), try org login
        if (donorErr.response?.status === 401 || donorErr.response?.status === 404) {
          isDonor = false;
          response = await axios.post("http://localhost:5000/api/org/login", {
            email: formData.identifier,
            phone: formData.identifier,
            password: formData.password,
          });
        } else {
          throw donorErr;
        }
      }

      const data = isDonor ? response.data.data : response.data.organization;
      const token = isDonor ? response.data.data.token : response.data.token;

      // Save to localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("user", JSON.stringify(data));

      redirectByRole(data, navigate);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Login failed. Check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  // ── OTP: send ──────────────────────────────────────────────────────────────
  const handleSendOTP = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/send-login-otp",
        {
          [formData.identifier.includes("@") ? "email" : "phone"]:
            formData.identifier,
        }
      );

      if (response.data.success) setOtpSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // ── OTP: verify ────────────────────────────────────────────────────────────
  const handleOTPLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/verify-login-otp",
        {
          [formData.identifier.includes("@") ? "email" : "phone"]:
            formData.identifier,
          otp,
        }
      );

      if (response.data.success) {
        const data = response.data.data;
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
        localStorage.setItem("user", JSON.stringify(data));
        redirectByRole(data, navigate);
      }
    } catch (err) {
      setError(err.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles["login-container"]}>
      <div className={styles["login-card"]}>
        <h2>Welcome Back</h2>
        <p>Login to your account</p>

        {/* Toggle */}
        <div className={styles["login-method-toggle"]}>
          <button
            className={loginMethod === "password" ? styles.active : ""}
            onClick={() => setLoginMethod("password")}
          >
            Password
          </button>
          <button
            className={loginMethod === "otp" ? styles.active : ""}
            onClick={() => setLoginMethod("otp")}
          >
            OTP Login
          </button>
        </div>

        {error && <div className={styles["error-message"]}>{error}</div>}

        {loginMethod === "password" ? (
          <form onSubmit={handlePasswordLogin}>
            <div className={styles["form-group"]}>
              <label>Email or Phone Number</label>
              <input
                type="text"
                name="identifier"
                value={formData.identifier}
                onChange={handleChange}
                placeholder="Email or phone"
                required
              />
            </div>
            <div className={styles["form-group"]}>
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        ) : (
          <div className={styles["otp-login"]}>
            {!otpSent ? (
              <div className={styles["otp-step"]}>
                <div className={styles["form-group"]}>
                  <label>Email or Phone Number</label>
                  <input
                    type="text"
                    name="identifier"
                    value={formData.identifier}
                    onChange={handleChange}
                    required
                  />
                </div>
                <button onClick={handleSendOTP} disabled={loading}>
                  {loading ? "Sending..." : "Send OTP"}
                </button>
              </div>
            ) : (
              <form onSubmit={handleOTPLogin}>
                <div className={styles["otp-info"]}>
                  <p>OTP sent to:</p>
                  <p className={styles["contact-info"]}>{formData.identifier}</p>
                </div>
                <div className={styles["form-group"]}>
                  <label>Enter OTP</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength="6"
                    required
                  />
                </div>
                <div className={styles["otp-actions"]}>
                  <button type="button" onClick={handleSendOTP}>
                    Resend OTP
                  </button>
                  <button type="submit" disabled={loading}>
                    {loading ? "Verifying..." : "Login with OTP"}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        <div className={styles["register-link"]}>
          Don't have an account?{" "}
          <a href="/register-donor">Register as Donor</a> |{" "}
          <a href="/register-organization">Register as Organization</a>
        </div>
      </div>
    </div>
  );
};

export default Login;