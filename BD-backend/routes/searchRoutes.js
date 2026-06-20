import express from "express";
import { searchBlood } from "../controllers/searchController.js";

const router = express.Router();

// GET /api/search/blood?bloodGroup=O%2B&province=Punjab&district=Lahore
router.get("/blood", searchBlood);

export default router;