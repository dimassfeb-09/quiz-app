import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import supabase from "../utils/supabase";

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (email && password) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        alert("Login failed: " + error.message);
        return;
      }

      localStorage.setItem("email", email);
      navigate("/");
    } else {
      alert("Masukkan email dan password!");
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("email");
    if (storedUser) {
      navigate("/");
    }
  }, []);

  return (
    <div className="w-full h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-semibold text-center text-gray-700 mb-6">
          Login
        </h1>
        <div className="mb-4">
          <label className="block text-gray-600 text-sm font-medium mb-2">
            Email
          </label>
          <input
            type="text"
            className="w-full text-black p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-600 text-sm font-medium mb-2">
            Password
          </label>
          <input
            type="password"
            className="w-full p-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button
          onClick={handleLogin}
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Login
        </button>
        <p className="text-center text-gray-600 text-sm mt-4">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-500">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
