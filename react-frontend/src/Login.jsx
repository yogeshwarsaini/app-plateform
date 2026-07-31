import { useState } from "react";
import { GraduationCap, LogIn } from "lucide-react";
import { login as apiLogin } from "./api";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function submit() {
    if (!username || !password) {
      setError("Email/phone aur password daalo");
      return;
    }
    setBusy(true);
    setError("");
    apiLogin(username, password)
      .then((data) => onLogin(data))   // data: { token, user }
      .catch((err) => setError(err.message))
      .finally(() => setBusy(false));
  }

  return (
    <div className="min-h-screen bg-sky-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-6 border border-sky-100">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-sky-700 text-white rounded-full w-16 h-16 flex items-center justify-center mb-3">
            <GraduationCap size={28} />
          </div>
          <h1 className="text-lg font-medium text-slate-900 text-center">Yogeshwar Bal Niketan Shiksha Deep</h1>
          <p className="text-sm text-slate-500">Fees portal — login</p>
        </div>

        <label className="text-xs text-slate-500 mb-1 block">Email ya phone</label>
        <input value={username} onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="admin@school.com"
          className="w-full border border-slate-200 rounded-lg px-3 py-2 mb-3 outline-none focus:border-sky-500 transition" />

        <label className="text-xs text-slate-500 mb-1 block">Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="••••••"
          className="w-full border border-slate-200 rounded-lg px-3 py-2 mb-4 outline-none focus:border-sky-500 transition" />

        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

        <button onClick={submit} disabled={busy}
          className="w-full bg-sky-600 text-white font-medium py-2.5 rounded-lg hover:bg-sky-500 disabled:opacity-50 transition flex items-center justify-center gap-2">
          <LogIn size={16} /> {busy ? "Login ho raha..." : "Login"}
        </button>
      </div>
    </div>
  );
}