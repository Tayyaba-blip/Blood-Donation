import Admin from "../models/Admin.js";
import Donor from "../models/Donor.js";
import Organization from "../models/Organization.js";
import jwt from "jsonwebtoken";

function generateToken(id, role) {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

// POST /api/admin/login
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) return res.status(401).json({ error: "Invalid credentials." });

    const match = await admin.comparePassword(password);
    if (!match) return res.status(401).json({ error: "Invalid credentials." });

    const token = generateToken(admin._id, "admin");

    res.json({
      token,
      admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/admin/overview
export const getOverview = async (req, res) => {
  try {
    const donors = await Donor.find().select("-password");
    const organizations = await Organization.find().select("-password");

    const totalDonors = donors.length;
    const totalOrgs = organizations.length;
    const eligibleDonors = donors.filter((d) => {
      if (!d.lastDonationDate) return true;
      const diff = Math.floor((new Date() - new Date(d.lastDonationDate)) / 86400000);
      return diff >= 90;
    }).length;

    let totalStockMl = 0;
    organizations.forEach((org) => {
      if (org.bloodStock) {
        org.bloodStock.forEach((ml) => (totalStockMl += ml));
      }
    });

    res.json({
      stats: {
        totalDonors,
        totalOrgs,
        eligibleDonors,
        notEligibleDonors: totalDonors - eligibleDonors,
        totalStockMl,
      },
      donors,
      organizations,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};