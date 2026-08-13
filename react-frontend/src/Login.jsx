// import { useState } from "react";
// import { GraduationCap, LogIn } from "lucide-react";
// import { login as apiLogin } from "./api";

// export default function Login({ onLogin }) {
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [busy, setBusy] = useState(false);

//   function submit() {
//     if (!username || !password) {
//       setError("Email/phone aur password daalo");
//       return;
//     }
//     setBusy(true);
//     setError("");
//     apiLogin(username, password)
//       .then((data) => onLogin(data))   // data: { token, user }
//       .catch((err) => setError(err.message))
//       .finally(() => setBusy(false));
//   }

//   return (
//     <div className="min-h-screen bg-sky-50 flex items-center justify-center p-4">
//       <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-6 border border-sky-100">
//         <div className="flex flex-col items-center mb-6">
//           <div className="bg-sky-700 text-white rounded-full w-16 h-16 flex items-center justify-center mb-3">
//             <GraduationCap size={28} />
//           </div>
//           <h1 className="text-lg font-medium text-slate-900 text-center">Yogeshwar Bal Niketan Shiksha Deep</h1>
//           <p className="text-sm text-slate-500">Fees portal — login</p>
//         </div>

//         <label className="text-xs text-slate-500 mb-1 block">Email ya phone</label>
//         <input value={username} onChange={(e) => setUsername(e.target.value)}
//           onKeyDown={(e) => e.key === "Enter" && submit()}
//           placeholder="admin@school.com"
//           className="w-full border border-slate-200 rounded-lg px-3 py-2 mb-3 outline-none focus:border-sky-500 transition" />

//         <label className="text-xs text-slate-500 mb-1 block">Password</label>
//         <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
//           onKeyDown={(e) => e.key === "Enter" && submit()}
//           placeholder="••••••"
//           className="w-full border border-slate-200 rounded-lg px-3 py-2 mb-4 outline-none focus:border-sky-500 transition" />

//         {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

//         <button onClick={submit} disabled={busy}
//           className="w-full bg-sky-600 text-white font-medium py-2.5 rounded-lg hover:bg-sky-500 disabled:opacity-50 transition flex items-center justify-center gap-2">
//           <LogIn size={16} /> {busy ? "Login ho raha..." : "Login"}
//         </button>
//       </div>
//     </div>
//   );
// }

import { useState } from "react";
import { GraduationCap, LogIn, UserPlus } from "lucide-react";
import { login as apiLogin, signup as apiSignup } from "./api";

export default function Login({ onLogin }) {
  const [mode, setMode] = useState("login"); // "login" ya "signup"

  return (
    <div className="min-h-screen bg-sky-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-6 border border-sky-100">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-sky-700 text-white rounded-full w-16 h-16 flex items-center justify-center mb-3">
            <GraduationCap size={28} />
          </div>
          <h1 className="text-lg font-medium text-slate-900 text-center">Yogeshwar Bal Niketan Shiksha Deep</h1>
          <p className="text-sm text-slate-500">Fees portal</p>
        </div>

        {mode === "login"
          ? <LoginForm onLogin={onLogin} />
          : <SignupForm onLogin={onLogin} />}

        <button
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          className="w-full text-center text-sm text-sky-600 hover:text-sky-700 mt-4"
        >
          {mode === "login"
            ? "Naya parent ho? Account banao"
            : "Already account hai? Login karo"}
        </button>
      </div>
    </div>
  );
}

function LoginForm({ onLogin }) {
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
      .then((data) => onLogin(data))
      .catch((err) => setError(err.message))
      .finally(() => setBusy(false));
  }

  return (
    <>
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
    </>
  );
}

function SignupForm({ onLogin }) {
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "", admission_no: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  function submit() {
   if (!form.name || !form.phone || !form.email || !form.password || !form.admission_no) {
  setError("Naam, email, phone, password aur admission number zaroori hai");
  return;
}
    setBusy(true);
    setError("");
    apiSignup(form)
      .then((data) => onLogin(data))
      .catch((err) => setError(err.message))
      .finally(() => setBusy(false));
  }

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(form.email)) {
  setError("Sahi email address daalo (example: name@gmail.com)");
  return;
}

  return (
    <>
      <p className="text-xs text-slate-500 mb-3">Apne bachche ka <strong>admission number</strong> school se le lo — usse aapka account bachche se juda jayega.</p>

      <label className="text-xs text-slate-500 mb-1 block">Aapka naam</label>
      <input value={form.name} onChange={set("name")} placeholder="Rakesh Sharma"
        className="w-full border border-slate-200 rounded-lg px-3 py-2 mb-3 outline-none focus:border-sky-500 transition" />

      <label className="text-xs text-slate-500 mb-1 block">Phone</label>
      <input value={form.phone} onChange={set("phone")} placeholder="9876543210"
        className="w-full border border-slate-200 rounded-lg px-3 py-2 mb-3 outline-none focus:border-sky-500 transition" />

      <label className="text-xs text-slate-500 mb-1 block">Email <span className="text-red-500">*</span></label>
      <input value={form.email} onChange={set("email")} placeholder="rakesh@example.com"
        className="w-full border border-slate-200 rounded-lg px-3 py-2 mb-3 outline-none focus:border-sky-500 transition" />

      <label className="text-xs text-slate-500 mb-1 block">Password</label>
      <input type="password" value={form.password} onChange={set("password")} placeholder="••••••"
        className="w-full border border-slate-200 rounded-lg px-3 py-2 mb-3 outline-none focus:border-sky-500 transition" />

      <label className="text-xs text-slate-500 mb-1 block">Bachche ka Admission Number</label>
      <input value={form.admission_no} onChange={set("admission_no")} placeholder="ADM004"
        className="w-full border border-slate-200 rounded-lg px-3 py-2 mb-4 outline-none focus:border-sky-500 transition" />

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

      <button onClick={submit} disabled={busy}
        className="w-full bg-sky-600 text-white font-medium py-2.5 rounded-lg hover:bg-sky-500 disabled:opacity-50 transition flex items-center justify-center gap-2">
        <UserPlus size={16} /> {busy ? "Account ban raha..." : "Account banao"}
      </button>
    </>
  );
}