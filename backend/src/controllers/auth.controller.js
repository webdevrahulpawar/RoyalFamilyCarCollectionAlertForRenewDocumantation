const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const { env } = require("../startup");

async function login(req, res) {
  const { username, password } = req.body;

  const user = await User.findOne({ username }).select("+passwordHash");
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign(
    { sub: user._id.toString(), username: user.username, role: user.role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN },
  );

  return res.json({ token });
}

module.exports = { login };

