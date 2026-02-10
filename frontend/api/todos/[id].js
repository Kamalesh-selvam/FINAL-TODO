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
  const userId = getTokenUserId(req);
  if (!userId) return res.status(401).json({ message: 'Not authorized' });

  const { id } = req.query || {};
  if (!id) return res.status(400).json({ message: 'Missing id' });

  try {
    const { Todo } = await connect();

    if (req.method === 'PUT') {
      const { completed, title } = req.body || {};
      const todo = await Todo.findOne({ _id: id, user: userId });
      if (!todo) return res.status(404).json({ message: 'Todo not found' });
      if (completed !== undefined) todo.completed = completed;
      if (title !== undefined) todo.title = title;
      const updated = await todo.save();
      return res.json(updated);
    }

    if (req.method === 'DELETE') {
      const todo = await Todo.findOneAndDelete({ _id: id, user: userId });
      if (!todo) return res.status(404).json({ message: 'Todo not found' });
      return res.json({ message: 'Todo deleted' });
    }

    res.status(405).end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
