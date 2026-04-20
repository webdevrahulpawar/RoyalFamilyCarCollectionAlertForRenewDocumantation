const express = require("express");
const { z } = require("zod");

const { login } = require("../controllers/auth.controller");
const { validateBody } = require("../middleware/validateRequest");

const router = express.Router();

router.post(
  "/login",
  validateBody(
    z.object({
      username: z.string().min(1),
      password: z.string().min(1),
    }),
  ),
  login,
);

module.exports = router;

