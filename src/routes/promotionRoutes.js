import express from "express";
import {
  getAllPromotions,
  createPromotion,
  updatePromotionStatus,
  deletePromotion,
} from "../controllers/promotionController.js";

const router = express.Router();

router.get("/", getAllPromotions);
router.post("/", createPromotion);
router.put("/:id/status", updatePromotionStatus);
router.delete("/:id", deletePromotion);

export default router;
