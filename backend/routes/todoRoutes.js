const express = require("express");
const Todo = require("../models/Todo");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * GET todos → ONLY for logged-in user
 */
router.get("/", protect, async (req, res) => {
  const todos = await Todo.find({ user: req.user }).sort({
    createdAt: -1,
  });
  res.json(todos);
});

/**
 * CREATE todo → assign to logged-in user
 */
router.post("/", protect, async (req, res) => {
  const todo = new Todo({
    title: req.body.title,
    completed: false,
    user: req.user, // 🔐 attach user id
  });

  const saved = await todo.save();
  res.status(201).json(saved);
});

/**
 * UPDATE todo (only owner can update)
 */
router.put("/:id", protect, async (req, res) => {
  const { completed, title } = req.body;

  const todo = await Todo.findOne({
    _id: req.params.id,
    user: req.user, // 🔐 ownership check
  });

  if (!todo) {
    return res.status(404).json({ message: "Todo not found" });
  }

  if (completed !== undefined) todo.completed = completed;
  if (title !== undefined) todo.title = title;

  const updated = await todo.save();
  res.json(updated);
});

/**
 * DELETE todo (only owner can delete)
 */
router.delete("/:id", protect, async (req, res) => {
  const todo = await Todo.findOneAndDelete({
    _id: req.params.id,
    user: req.user, // 🔐 ownership check
  });

  if (!todo) {
    return res.status(404).json({ message: "Todo not found" });
  }

  res.json({ message: "Todo deleted" });
});

module.exports = router;
