import express from "express";
import { protect } from "../middleware/protect.js";
import { getProfile, updateProfile } from "../controllers/userController.js";

const router = express.Router();
router.use(protect);
router.get("/users/me", getProfile);

router.patch("/users/me", updateProfile);

export default router;
