import Donor from "../models/Donor.js";

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