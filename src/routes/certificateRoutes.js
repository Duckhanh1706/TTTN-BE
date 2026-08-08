import express from "express";
import {
  getAllCertificates,
  deleteCertificate,
} from "../controllers/certificateController.js";

const router = express.Router();

router.get("/", getAllCertificates);
router.delete("/:id", deleteCertificate);

export default router;
