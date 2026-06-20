import Organization from "../models/Organization.js";
import Donor from "../models/Donor.js";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

// Helper: get or init stock map on the org
function buildStockMap(org) {
  const stock = {};
  BLOOD_GROUPS.forEach((bg) => {
    stock[bg] = org.bloodStock?.get(bg) || 0;
  });
  return stock;
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/org/profile
// ─────────────────────────────────────────────────────────────────────────────
export const getOrgProfile = async (req, res) => {
  try {
    const org = await Organization.findById(req.orgId).select("-password");
    if (!org) return res.status(404).json({ error: "Organization not found." });
    res.json({ ...org.toJSON(), bloodStock: buildStockMap(org) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/org/donors
// ─────────────────────────────────────────────────────────────────────────────
export const getLinkedDonors = async (req, res) => {
  try {
    const donors = await Donor.find({ linkedOrganization: req.orgId })
      .select("-password")
      .sort({ createdAt: -1 });
    res.json(donors.map((d) => d.toJSON()));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/org/donors/:donorId
// ─────────────────────────────────────────────────────────────────────────────
export const getDonorById = async (req, res) => {
  try {
    const donor = await Donor.findOne({
      _id: req.params.donorId,
      linkedOrganization: req.orgId,
    }).select("-password");
    if (!donor) return res.status(404).json({ error: "Donor not found." });
    res.json(donor.toJSON());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/org/donations/record
// Donor gives blood → update donor history + increase org stock
// Body: { donorId, units, date, location }
// ─────────────────────────────────────────────────────────────────────────────
export const recordDonation = async (req, res) => {
  try {
    const { donorId, units, date, location } = req.body;

    if (!donorId || !units || !date) {
      return res.status(400).json({ error: "donorId, units and date are required." });
    }

    const donor = await Donor.findOne({ _id: donorId, linkedOrganization: req.orgId });
    if (!donor) return res.status(404).json({ error: "Donor not found or not linked to your organization." });

    if (!donor.isEligible) {
      return res.status(400).json({
        error: `Donor is not eligible yet. Eligible in ${donor.daysUntilEligible} days.`,
      });
    }

    const bloodGroup = donor.bloodGroup;
    if (!bloodGroup) {
      return res.status(400).json({ error: "Donor has no blood group set in their profile." });
    }

    // 1. Update donor record
    donor.donationHistory.push({ date, units: Number(units), location: location || "" });
    donor.lastDonationDate = date;
    await donor.save();

    // 2. Increase org blood stock for that blood group
    const org = await Organization.findById(req.orgId);
    if (!org.bloodStock) org.bloodStock = new Map();
    const current = org.bloodStock.get(bloodGroup) || 0;
    org.bloodStock.set(bloodGroup, current + Number(units));
    org.markModified("bloodStock"); // needed for Map fields in Mongoose
    await org.save();

    res.json({
      message: `Donation recorded. ${bloodGroup} stock updated to ${org.bloodStock.get(bloodGroup)} ml.`,
      donor: donor.toJSON(),
      bloodStock: buildStockMap(org),
    });
  } catch (err) {
    console.error("recordDonation error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/org/stock/dispense
// Blood is given to a recipient → decrease org stock
// Body: { bloodGroup, units, recipientName, date }
// ─────────────────────────────────────────────────────────────────────────────
export const dispenseBlood = async (req, res) => {
  try {
    const { bloodGroup, units, recipientName, date } = req.body;

    if (!bloodGroup || !units || !date) {
      return res.status(400).json({ error: "bloodGroup, units and date are required." });
    }

    if (!BLOOD_GROUPS.includes(bloodGroup)) {
      return res.status(400).json({ error: "Invalid blood group." });
    }

    const org = await Organization.findById(req.orgId);
    if (!org.bloodStock) org.bloodStock = new Map();

    const current = org.bloodStock.get(bloodGroup) || 0;
    if (current < Number(units)) {
      return res.status(400).json({
        error: `Not enough ${bloodGroup} stock. Available: ${current} ml, Requested: ${units} ml.`,
      });
    }

    // Decrease stock
    org.bloodStock.set(bloodGroup, current - Number(units));
    org.markModified("bloodStock");

    // Log it in dispenseHistory
    if (!org.dispenseHistory) org.dispenseHistory = [];
    org.dispenseHistory.push({
      bloodGroup,
      units: Number(units),
      recipientName: recipientName || "Anonymous",
      date,
    });

    await org.save();

    res.json({
      message: `${units} ml of ${bloodGroup} dispensed. Remaining: ${org.bloodStock.get(bloodGroup)} ml.`,
      bloodStock: buildStockMap(org),
    });
  } catch (err) {
    console.error("dispenseBlood error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/org/stock
// Get current blood stock levels
// ─────────────────────────────────────────────────────────────────────────────
export const getStock = async (req, res) => {
  try {
    const org = await Organization.findById(req.orgId).select("bloodStock dispenseHistory");
    if (!org) return res.status(404).json({ error: "Organization not found." });
    res.json({
      bloodStock: buildStockMap(org),
      dispenseHistory: (org.dispenseHistory || []).slice(-20).reverse(), // last 20
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/org/stats
// ─────────────────────────────────────────────────────────────────────────────
export const getOrgStats = async (req, res) => {
  try {
    const [donors, org] = await Promise.all([
      Donor.find({ linkedOrganization: req.orgId }),
      Organization.findById(req.orgId).select("bloodStock dispenseHistory"),
    ]);

    const total        = donors.length;
    const eligible     = donors.filter((d) => d.isEligible).length;
    const notEligible  = total - eligible;

    const bloodGroups = {};
    donors.forEach((d) => {
      if (d.bloodGroup) bloodGroups[d.bloodGroup] = (bloodGroups[d.bloodGroup] || 0) + 1;
    });

    const totalDonations = donors.reduce((sum, d) => sum + (d.donationHistory?.length || 0), 0);

    const allDonations = [];
    donors.forEach((d) => {
      (d.donationHistory || []).forEach((entry) => {
        allDonations.push({
          donorName:  `${d.firstName} ${d.lastName}`,
          bloodGroup: d.bloodGroup,
          date:       entry.date,
          units:      entry.units,
          location:   entry.location,
        });
      });
    });
    allDonations.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      total,
      eligible,
      notEligible,
      bloodGroups,
      totalDonations,
      recentDonations:  allDonations.slice(0, 5),
      bloodStock:       buildStockMap(org),
      dispenseHistory:  (org.dispenseHistory || []).slice(-5).reverse(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};