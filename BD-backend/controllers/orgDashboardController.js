import Organization from "../models/Organization.js";
import Donor from "../models/Donor.js";
import Notification from "../models/Notification.js";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

function buildStockMap(org) {
  const stock = {};
  BLOOD_GROUPS.forEach((bg) => {
    stock[bg] = org.bloodStock?.get(bg) || 0;
  });
  return stock;
}

// PUT /api/org/update-location
export const updateOrgLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ error: "Latitude and longitude are required." });
    }
    await Organization.findByIdAndUpdate(req.orgId, {
      location: { type: "Point", coordinates: [longitude, latitude] },
    });
    res.json({ message: "Location updated." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/org/profile
export const getOrgProfile = async (req, res) => {
  try {
    const org = await Organization.findById(req.orgId).select("-password");
    if (!org) return res.status(404).json({ error: "Organization not found." });
    res.json({ ...org.toJSON(), bloodStock: buildStockMap(org) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/org/donors
export const getLinkedDonors = async (req, res) => {
  try {
    // ✅ updated: query linkedOrganizations array
    const donors = await Donor.find({
      "linkedOrganizations.organization": req.orgId,
    })
      .select("-password")
      .sort({ createdAt: -1 });
    res.json(donors.map((d) => d.toJSON()));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/org/donors/:donorId
export const getDonorById = async (req, res) => {
  try {
    // ✅ updated: query linkedOrganizations array
    const donor = await Donor.findOne({
      _id: req.params.donorId,
      "linkedOrganizations.organization": req.orgId,
    }).select("-password");
    if (!donor) return res.status(404).json({ error: "Donor not found." });
    res.json(donor.toJSON());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/org/donations/record
export const recordDonation = async (req, res) => {
  try {
    const { donorId, units, date, location } = req.body;

    if (!donorId || !units || !date) {
      return res.status(400).json({ error: "donorId, units and date are required." });
    }

    // ✅ single org fetch, no duplicate declaration
    const org = await Organization.findById(req.orgId);
    if (!org) return res.status(404).json({ error: "Organization not found." });

    // ✅ updated: query linkedOrganizations array
    const donor = await Donor.findOne({
      _id: donorId,
      "linkedOrganizations.organization": req.orgId,
    });
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

    // Update donor record
    donor.donationHistory.push({
      date,
      units: Number(units),
      location: location || "",
      orgId: req.orgId,
      orgName: org.organizationName,
    });
    donor.lastDonationDate = date;
    await donor.save();

    // Increase org blood stock
    if (!org.bloodStock) org.bloodStock = new Map();
    const current = org.bloodStock.get(bloodGroup) || 0;
    org.bloodStock.set(bloodGroup, current + Number(units));
    org.markModified("bloodStock");
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

// POST /api/org/stock/dispense
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

    org.bloodStock.set(bloodGroup, current - Number(units));
    org.markModified("bloodStock");

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

// GET /api/org/stock
export const getStock = async (req, res) => {
  try {
    const org = await Organization.findById(req.orgId).select("bloodStock dispenseHistory");
    if (!org) return res.status(404).json({ error: "Organization not found." });
    res.json({
      bloodStock: buildStockMap(org),
      dispenseHistory: (org.dispenseHistory || []).slice(-20).reverse(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/org/stats
export const getOrgStats = async (req, res) => {
  try {
    const [donors, org] = await Promise.all([
      // ✅ updated: query linkedOrganizations array
      Donor.find({ "linkedOrganizations.organization": req.orgId }),
      Organization.findById(req.orgId).select("bloodStock dispenseHistory"),
    ]);

    const total       = donors.length;
    const eligible    = donors.filter((d) => d.isEligible).length;
    const notEligible = total - eligible;

    const bloodGroups = {};
    donors.forEach((d) => {
      if (d.bloodGroup) bloodGroups[d.bloodGroup] = (bloodGroups[d.bloodGroup] || 0) + 1;
    });

    const totalDonations = donors.reduce(
      (sum, d) => sum + (d.donationHistory?.length || 0), 0
    );

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
      recentDonations: allDonations.slice(0, 5),
      bloodStock:      buildStockMap(org),
      dispenseHistory: (org.dispenseHistory || []).slice(-5).reverse(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};