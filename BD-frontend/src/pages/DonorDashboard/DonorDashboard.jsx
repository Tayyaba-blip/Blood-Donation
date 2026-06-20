import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./DonorDashboard.module.css";

import ProfileCard from "./ProfileCard/Profilecard"
import AboutCard from "./AboutCard/Aboutcard";
import EligibilityCard from "./EligibilityCard/Eligibilitycard";
import HealthCard from "./HealthCard/Healthcard";
import DonationHistory from "./DonationHistory/Donationhistory";
import QRModal from "./QRModal/QRmodal";

export default function DonorDashboard() {
  const [donor, setDonor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showQR, setShowQR] = useState(false);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  useEffect(() => {
    fetch("http://localhost:5000/api/donor/profile", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setDonor(data);
      })
      .catch(() => setError("Failed to load profile."))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className={styles.center}>Loading your dashboard…</div>;
  if (error)   return <div className={styles.center}>⚠ {error}</div>;
  if (!donor)  return null;

  return (
    <div className={styles.page}>

      {/* ── Nav ── */}
      <nav className={styles.nav}>
        <div className={styles.logo}>
          <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="19" stroke="#7f1d1d" strokeWidth="2" />
            <path
              d="M20 8 C14 14 10 18 10 23 a10 10 0 0 0 20 0 C30 18 26 14 20 8z"
              fill="#9f1239"
            />
          </svg>
        </div>
       
        <div className={styles.navRight}>
          <span className={styles.notifIcon}>🔔</span>
          <div className={styles.avatar}>
            {donor.firstName?.[0]}{donor.lastName?.[0]}
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            Log Out
          </button>
        </div>
      </nav>

      {/* ── Body ── */}
      <div className={styles.body}>
        <ProfileCard donor={donor} onShowQR={() => setShowQR(true)} />

        <div className={styles.grid}>
          <AboutCard donor={donor} />

          <div className={styles.rightCol}>
            <EligibilityCard donor={donor} />
            <HealthCard donor={donor} />
            <DonationHistory donor={donor} />
          </div>
        </div>
      </div>

      {showQR && <QRModal donor={donor} onClose={() => setShowQR(false)} />}
    </div>
  );
}