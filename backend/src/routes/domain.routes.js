import express from "express";

import {
    createDomain,
    getAllDomains
} from "../controllers/domain.controller.js";

const router = express.Router();

router.post("/", createDomain);

router.get("/", getAllDomains);

export default router;
