const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

const todoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    completed: { type: Boolean, default: false },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

let cached = global._mongo;
if (!cached) cached = global._mongo = { conn: null, promise: null };

async function connect() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    const opts = { useNewUrlParser: true, useUnifiedTopology: true };
    cached.promise = mongoose.connect(process.env.MONGO_URI, opts).then((mongoose) => {
      const User = mongoose.models.User || mongoose.model('User', userSchema);
      const Todo = mongoose.models.Todo || mongoose.model('Todo', todoSchema);
      cached.conn = { mongoose, User, Todo };
      return cached.conn;
    });
  }
module.exports = { connect };
