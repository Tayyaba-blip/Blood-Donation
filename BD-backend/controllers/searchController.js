import Organization from "../models/Organization.js";

export const searchBlood = async (req, res) => {
  try {
    const { bloodGroup, province, district } = req.query;

    if (!province || !district) {
      return res.status(400).json({ error: "Province and district are required." });
    }

    // Find all active orgs in the given province + district
    const orgs = await Organization.find({
      isActive: true,
      $or: [
        {
          district: { $regex: district, $options: "i" },
          province: { $regex: province, $options: "i" },
        },
        {
          // fallback for orgs without district/province fields
          address: { $regex: district, $options: "i" },
        },
      ],
    }).select("-password -donors");

    if (orgs.length === 0) {
      return res.json({ results: [] });
    }

    // Build results from blood stock
    const results = orgs
      .map((org) => {
        // Convert the bloodStock Map to a plain object
        const stock = {};
        if (org.bloodStock) {
          org.bloodStock.forEach((value, key) => {
            if (value > 0) stock[key] = value;  // only include groups with stock > 0
          });
        }

        const requestedStock = bloodGroup ? (org.bloodStock?.get(bloodGroup) || 0) : null;
        const totalStock     = Object.values(stock).reduce((s, n) => s + n, 0);

        return {
          _id:              org._id,
          organizationName: org.organizationName,
          address:          org.address,
          district:         org.district,
          province:         org.province,
          phone:            org.phone,
          email:            org.email,
          stock,            // e.g. { "O+": 900, "A+": 450 }
          requestedStock,   // ml available for the requested blood group
          totalStock,       // total ml across all groups
        };
      })
      .filter((org) => {
        if (bloodGroup) return org.requestedStock > 0;  // must have that blood group in stock
        return org.totalStock > 0;                       // must have any blood in stock
      })
      .sort((a, b) => {
        if (bloodGroup) return b.requestedStock - a.requestedStock;
        return b.totalStock - a.totalStock;
      });

    res.json({ results });
  } catch (err) {
    console.error("searchBlood error:", err);
    res.status(500).json({ error: err.message });
  }
};