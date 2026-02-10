
import { useEffect, useState } from "react";
import Login from "./Login";
import Register from "./Register";
import { AnimatePresence, motion } from "framer-motion";

export default function App() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("token"));
  const [showRegister, setShowRegister] = useState(false);
  const [dark, setDark] = useState(
    JSON.parse(localStorage.getItem("darkMode") || "false")
  );
  useEffect(() => {
  const root = document.documentElement;
  if (dark) {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}, [dark]);

  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [filter, setFilter] = useState("all");

  const token = localStorage.getItem("token");

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(dark));
  }, [dark]);

  useEffect(() => {
    if (!token) return;
    fetch("/api/todos", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
})
    .then((r) => r.json())
    .then(setTodos);
  }, [token]);

  const addTodo = async () => {
    if (!title.trim()) return;
      const res = await fetch("/api/todos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title }),
    });
    const newTodo = await res.json();
    setTodos((p) => [newTodo, ...p]);
    setTitle("");
  };

  const toggleTodo = async (todo) => {
    const completed = !todo.completed;
    setTodos((p) =>
      p.map((t) => (t._id === todo._id ? { ...t, completed } : t))
    );
      await fetch(`/api/todos/${todo._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ completed }),
    });
  };

  const saveEdit = async (id) => {
    if (!editText.trim()) {
      setEditingId(null);
      return;
    }
    setTodos((p) =>
      p.map((t) => (t._id === id ? { ...t, title: editText } : t))
    );
      await fetch(`/api/todos/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title: editText }),
    });
    setEditingId(null);
    setEditText("");
  };

  const deleteTodo = async (id) => {
    setTodos((p) => p.filter((t) => t._id !== id));
      await fetch(`/api/todos/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    setLoggedIn(false);
  };

  const filtered = todos.filter((t) => {
    if (filter === "active") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  if (!loggedIn) {
    return showRegister ? (
      <Register onSwitch={() => setShowRegister(false)} />
    ) : (
      <Login
        onLogin={() => setLoggedIn(true)}
        onSwitch={() => setShowRegister(true)}
      />
    );
  }

  return (
    <div className={dark ? "dark" : ""}>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex justify-center px-4 py-12">
        <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-semibold dark:text-white">
              Tasks
            </h1>
            <div className="flex gap-3">
              <button onClick={() => setDark(!dark)}>
                {dark ? "☀️" : "🌙"}
              </button>
              <button
                onClick={logout}
                className="text-sm text-red-500"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Add */}
          <div className="flex gap-2 mb-4">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTodo()}
              placeholder="Add a new task"
              className="flex-1 px-4 py-2 rounded-xl border dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-400"
            />
            <button
              onClick={addTodo}
              className="px-5 rounded-xl bg-indigo-600 text-white"
            >
              Add
            </button>
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-4">
            {["all", "active", "completed"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium ${
                  filter === f
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* List */}
          <ul className="space-y-2">
            <AnimatePresence>
              {filtered.map((todo) => (
                <motion.li
                  key={todo._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => toggleTodo(todo)}
                      className="w-5 h-5 accent-indigo-600"
                    />
                    {editingId === todo._id ? (
                      <input
                        autoFocus
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onBlur={() => saveEdit(todo._id)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && saveEdit(todo._id)
                        }
                        className="flex-1 bg-transparent border-b dark:text-white"
                      />
                    ) : (
                      <span
                        onDoubleClick={() => {
                          setEditingId(todo._id);
                          setEditText(todo.title);
                        }}
                        className={`flex-1 cursor-pointer ${
                          todo.completed
                            ? "line-through text-gray-400"
                            : "dark:text-white"
                        }`}
                      >
                        {todo.title}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => deleteTodo(todo._id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    🗑️
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>

          {todos.length === 0 && (
            <p className="text-center text-gray-400 mt-6">
              No tasks yet ✨
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
