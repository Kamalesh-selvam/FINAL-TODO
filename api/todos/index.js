const jwt = require('jsonwebtoken');
const { connect } = require('../_db');

function getTokenUserId(req) {
  const header = req.headers.authorization || '';
  const token = header.split(' ')[1];
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id;
  } catch (e) {
    return null;
  }
}

module.exports = async (req, res) => {
  const { method } = req;
  const userId = getTokenUserId(req);
  if (!userId) return res.status(401).json({ message: 'Not authorized' });

  try {
    const { Todo } = await connect();

    if (method === 'GET') {
      const todos = await Todo.find({ user: userId }).sort({ createdAt: -1 });
      return res.json(todos);
    }

    if (method === 'POST') {
      const { title } = req.body || {};
      if (!title) return res.status(400).json({ message: 'Title required' });
      const todo = await Todo.create({ title, completed: false, user: userId });
      return res.status(201).json(todo);
    }

    res.status(405).end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
