const bcrypt = require('bcryptjs');
const { connect } = require('../_db');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: 'All fields are required' });

    const { User } = await connect();
    const normalized = email.toLowerCase();
    const exists = await User.findOne({ email: normalized });
    if (exists) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    await User.create({ email: normalized, password: hashed });
    res.json({ message: 'Registered successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
