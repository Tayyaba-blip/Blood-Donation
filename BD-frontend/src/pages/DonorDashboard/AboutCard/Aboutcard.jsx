import styles from "./Aboutcard.module.css";

export default function AboutCard({ donor }) {
  const rows = [
    ["Full Name",          `${donor.firstName} ${donor.lastName}`],
    ["Email",              donor.email],
    ["Phone",              donor.phone],
    ["Age",                donor.age],
    ["Blood Group",        donor.bloodGroup],
    ["District",           donor.district],
    ["Province",           donor.province],
    ["Pincode",            donor.pincode],
    ["Address",            donor.address],
    ["Last Donation Date", donor.lastDonationDate || "N/A"],
  ];

  return (
    <div className={styles.card}>
      <h2 className={styles.title}>About</h2>
      {rows.map(([label, value]) => (
        <div key={label} className={styles.row}>
          <span className={styles.label}>{label}</span>
          <span className={styles.value}>{value || "—"}</span>
        </div>
      ))}
    </div>
  );
}