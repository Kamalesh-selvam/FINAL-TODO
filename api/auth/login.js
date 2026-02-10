const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { connect } = require('../_db');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: 'All fields are required' });

    const { User } = await connect();
    const normalized = email.toLowerCase();
    const user = await User.findOne({ email: normalized });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
