import Donor from "../models/Donor.js";
import Organization from "../models/Organization.js";

// Register donor
export const registerDonor = async (req, res) => {
  try {

    const donor = new Donor(req.body);

    const savedDonor = await donor.save();

    res.status(201).json({
      message: "Donor registered successfully",
      donor: savedDonor
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};


// Get all donors
export const getDonors = async (req, res) => {

  try {

    const donors = await Donor.find();

    res.json(donors);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/donor/profile
// ─────────────────────────────────────────────────────────────────────────────
export const getDonorProfile = async (req, res) => {
  try {
    const donor = await Donor.findById(req.userId)
      .select("-password")
      .populate("linkedOrganization", "organizationName address phone orgCode");
 
    if (!donor) return res.status(404).json({ error: "Donor not found." });
    res.json(donor.toJSON());
  } catch {
    res.status(500).json({ error: "Server error." });
  }
};
 
// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/donor/profile
// Update profile — if organizationCode changed, resolve + link the org
// ─────────────────────────────────────────────────────────────────────────────
export const updateDonorProfile = async (req, res) => {
  try {
    const {
      firstName, lastName, phone, email, address,
      age, bloodGroup, district, province, pincode,
      lastDonationDate,
      healthIssues, currentMedications, recentSurgery,
      smoker, alcoholic, allergies,
      organizationCode,   // ← new field
    } = req.body;
 
    const donor = await Donor.findById(req.userId);
    if (!donor) return res.status(404).json({ error: "Donor not found." });
 
    // If a new org code was provided, resolve it
    let linkedOrganization = donor.linkedOrganization;
    let resolvedOrgCode = donor.organizationCode;
 
    if (organizationCode && organizationCode !== donor.organizationCode) {
      const org = await Organization.findOne({ orgCode: organizationCode.toUpperCase() });
      if (!org) return res.status(400).json({ error: "Invalid organization code. Please check and try again." });
 
      // Add donor to org's donors array if not already there
      if (!org.donors.includes(donor._id)) {
        org.donors.push(donor._id);
        await org.save();
      }
 
      linkedOrganization = org._id;
      resolvedOrgCode = organizationCode.toUpperCase();
    }
 
    // Apply all updates
    Object.assign(donor, {
      firstName, lastName, phone, email, address,
      age, bloodGroup, district, province, pincode,
      lastDonationDate,
      healthIssues, currentMedications, recentSurgery,
      smoker, alcoholic, allergies,
      organizationCode: resolvedOrgCode,
      linkedOrganization,
    });
 
    await donor.save();
 
    const updated = await Donor.findById(donor._id)
      .select("-password")
      .populate("linkedOrganization", "organizationName address phone orgCode");
 
    res.json(updated.toJSON());
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error." });
  }
};