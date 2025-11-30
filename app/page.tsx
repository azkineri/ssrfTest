"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";

interface Todo {
  id: string;
  title: string;
  completed: boolean;
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [loading, setLoading] = useState(true);

  // Authentication form states
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && session) {
      fetchTodos();
    } else if (!isPending) {
      setLoading(false);
    }
  }, [session, isPending]);

  const fetchTodos = async () => {
    const res = await fetch("/api/todos");
    if (res.ok) {
      const data = await res.json();
      setTodos(data);
    }
    setLoading(false);
  };

  const addTodo = async () => {
    if (!newTodo.trim()) return;
    const res = await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTodo }),
    });
    if (res.ok) {
      setNewTodo("");
      fetchTodos();
    }
  };

  const toggleTodo = async (id: string, completed: boolean) => {
    const res = await fetch(`/api/todos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !completed }),
    });
    if (res.ok) {
      fetchTodos();
    }
  };

  const deleteTodo = async (id: string) => {
    const res = await fetch(`/api/todos/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      fetchTodos();
    }
  };

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          setTodos([]);
        },
      },
    });
  };

  const handleLogin = async () => {
    setAuthError("");
    await authClient.signIn.email({
      email,
      password,
    }, {
      onSuccess: () => {
        fetchTodos();
      },
      onError: (ctx) => {
        setAuthError(ctx.error.message);
      },
    });
  };

  const handleRegister = async () => {
    setAuthError("");
    await authClient.signUp.email({
      email,
      password,
      name,
    }, {
      onSuccess: () => {
        fetchTodos();
      },
      onError: (ctx) => {
        setAuthError(ctx.error.message);
      },
    });
  };

  if (isPending || loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  // Show authentication forms if not logged in
  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
          <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">
            {isLogin ? "Login" : "Register"}
          </h2>
          {authError && <div className="mb-4 text-red-500 text-center">{authError}</div>}

          {!isLogin && (
            <div className="mb-4">
              <label className="mb-2 block text-sm font-bold text-gray-700" htmlFor="name">
                Name
              </label>
              <input
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none text-black"
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>
          )}

          <div className="mb-4">
            <label className="mb-2 block text-sm font-bold text-gray-700" htmlFor="email">
              Email
            </label>
            <input
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none text-black"
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </div>

          <div className="mb-6">
            <label className="mb-2 block text-sm font-bold text-gray-700" htmlFor="password">
              Password
            </label>
            <input
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none text-black"
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              onKeyDown={(e) => e.key === "Enter" && (isLogin ? handleLogin() : handleRegister())}
            />
          </div>

          <button
            className={`w-full rounded-md px-4 py-2 text-white focus:outline-none ${isLogin ? "bg-blue-500 hover:bg-blue-600" : "bg-green-500 hover:bg-green-600"
              }`}
            onClick={isLogin ? handleLogin : handleRegister}
          >
            {isLogin ? "Sign In" : "Sign Up"}
          </button>

          <p className="mt-4 text-center text-sm text-gray-600">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setAuthError("");
              }}
              className="text-blue-500 hover:underline"
            >
              {isLogin ? "Register" : "Login"}
            </button>
          </p>
        </div>
      </div>
    );
  }

  // Show ToDo list for authenticated users
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-2xl rounded-lg bg-white p-6 shadow-md">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">My ToDos</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Welcome, {session.user.name}</span>
            <button
              onClick={handleLogout}
              className="rounded-md bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="mb-6 flex gap-2">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add a new todo..."
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none text-black"
            onKeyDown={(e) => e.key === "Enter" && addTodo()}
          />
          <button
            onClick={addTodo}
            className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Add
          </button>
        </div>

        <ul className="space-y-2">
          {todos.map((todo) => (
            <li
              key={todo.id}
              className="flex items-center justify-between rounded-md border border-gray-200 p-3 hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id, todo.completed)}
                  className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span
                  className={`text-lg ${todo.completed ? "text-gray-400 line-through" : "text-gray-800"
                    }`}
                >
                  {todo.title}
                </span>
              </div>
              <button
                onClick={() => deleteTodo(todo.id)}
                className="text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
        {todos.length === 0 && (
          <p className="text-center text-gray-500">No todos yet. Add one above!</p>
        )}
      </div>
    </div>
  );
}
