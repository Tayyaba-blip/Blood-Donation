import express from "express";
import { registerDonor, getDonors } from "../controllers/donorController.js";

const router = express.Router();

// Register new donor
router.post("/register", registerDonor);

// Get all donors
router.get("/", getDonors);

export default router;