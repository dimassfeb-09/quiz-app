import { useState, useEffect } from "react";
import supabase from "../utils/supabase";
import { Link, useNavigate } from "react-router-dom";

const Register: React.FC = () => {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (email && password) {
      try {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: name,
            },
          },
        });

        if (error) {
          alert("Terjadi kesalahan saat mendaftar: " + error.message);
          return;
        }

        alert(
          "Registrasi berhasil! Silakan periksa email Anda untuk mengkonfirmasi akun."
        );
        navigate("/login");
      } catch (err: any) {
        alert("Terjadi kesalahan saat mendaftar: " + err.message);
      }
    } else {
      alert("Masukkan email dan password!");
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("email");
      if (storedUser) {
        navigate("/");
      }
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-semibold text-center text-gray-700 mb-6">
          Register
        </h1>
        <div className="mb-4">
          <label className="block text-gray-600 text-sm font-medium mb-2">
            Name
          </label>
          <input
            type="text"
            className="w-full text-black p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-600 text-sm font-medium mb-2">
            Email
          </label>
          <input
            type="email"
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
          onClick={handleRegister}
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Register
        </button>
        <p className="text-center text-gray-600 text-sm mt-4">
          Do you have an account?{" "}
          <Link to="/login" className="text-blue-500">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
