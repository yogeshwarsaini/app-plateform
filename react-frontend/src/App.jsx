import { getStudents , getStudent , makePayment , addStudent , deleteStudent , setAuthToken } from "./api";
import { useState, useMemo , useEffect } from "react";
import ParentView from "./ParentView";
import Login from "./Login";
import {
  Search, Wallet, Clock, Users, CheckCircle2, X, ArrowLeft, Printer,
  IndianRupee, CalendarDays, FileText, Sun, Moon, Plus, Coins, Trash2,
} from "lucide-react";
//import { useState, useMemo, useEffect } from "react";

/*
  ============================================================
  BACKEND CONNECT (abhi mock data pe chal raha):
    const API_URL = process.env.REACT_APP_API_URL;
    GET  /api/v1/students?q=...           -> search (name/father/class)
    GET  /api/v1/students/:id             -> months + exams + custom payments
    POST /api/v1/students/:id/payments    -> { feeId|custom, amount, mode, note }
  Backend (FastAPI) + DB schema chahiye to bata dena.
  ============================================================
*/

const SESSION_MONTHS = ["April","May","June","July","August","September","October","November","December","January","February","March"];

function buildFees(monthlyFee, examFees, paidMonths, paidExams) {
  const fees = [];
  SESSION_MONTHS.forEach((m, i) => {
    const isPaid = paidMonths.includes(m);
    fees.push({ id: "m" + i, type: "monthly", label: m, amount: monthlyFee, paidOn: isPaid ? "2026-0" + ((i % 9) + 1) + "-08" : null, mode: isPaid ? "Cash" : null });
  });
  examFees.forEach((ex, i) => {
    const isPaid = paidExams.includes(ex.name);
    fees.push({ id: "e" + i, type: "exam", label: ex.name, amount: ex.amount, paidOn: isPaid ? "2026-07-15" : null, mode: isPaid ? "Online" : null });
  });
  return fees;
}

const EXAM_FEES = [
  { name: "Quarterly exam", amount: 800 },
  { name: "Half-yearly exam", amount: 900 },
  { name: "Annual exam", amount: 1000 },
];

const MOCK_STUDENTS = [
  { id: 1, name: "Aarav Sharma", cls: "8-A", roll: "12", father: "Rakesh Sharma", phone: "98765-43210",
    fees: buildFees(1500, EXAM_FEES, ["April","May","June"], ["Quarterly exam"]),
    custom: [{ id: "c1", amount: 500, note: "Late fine", mode: "Cash", date: "2026-05-20" }] },
  { id: 2, name: "Diya Patel", cls: "10-B", roll: "07", father: "Nilesh Patel", phone: "99887-66554",
    fees: buildFees(1800, EXAM_FEES, SESSION_MONTHS, ["Quarterly exam","Half-yearly exam","Annual exam"]), custom: [] },
  { id: 3, name: "Kabir Singh", cls: "6-C", roll: "21", father: "Harpreet Singh", phone: "97000-12345",
    fees: buildFees(1200, EXAM_FEES, [], []), custom: [] },
];

const rupee = (n) => "₹" + n.toLocaleString("en-IN");

function makeTheme(dark) {
  return {
    page: dark ? "bg-slate-900 text-slate-100" : "bg-sky-50 text-slate-800",
    header: dark ? "bg-slate-950" : "bg-sky-700",
    card: dark ? "bg-slate-800 border-slate-700" : "bg-white border-sky-100",
    soft: dark ? "bg-slate-700" : "bg-sky-50",
    border: dark ? "border-slate-700" : "border-sky-100",
    muted: dark ? "text-slate-400" : "text-slate-500",
    input: dark ? "bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-sky-400"
                : "bg-white border-slate-200 focus:border-sky-500",
    divide: dark ? "divide-slate-700" : "divide-sky-100",
    hover: dark ? "hover:bg-slate-700" : "hover:bg-sky-50",
    modal: dark ? "bg-slate-800 text-slate-100" : "bg-white text-slate-800",
    title: dark ? "text-white" : "text-slate-900",
  };
}

export default function App() {
  const [dark, setDark] = useState(false);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState(null);   // { token, user } — null = logged out
useEffect(() => {
    if (auth && auth.user.role === "admin") {
      getStudents()
        .then((data) => setStudents(data))
        .catch((err) => console.error("Backend error:", err))
        .finally(() => setLoading(false));
    }
  }, [auth]);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const T = makeTheme(dark);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s) =>
    (s.name || "").toLowerCase().includes(q) ||
    (s.father_name || s.father || "").toLowerCase().includes(q) ||
    (s.cls || "").toLowerCase().includes(q) ||
    (s.roll_no || s.roll || "").includes(q));
  }, [students, query]);

  const [addOpen, setAddOpen] = useState(false);

  function refreshList() {
    getStudents().then((data) => setStudents(data)).catch(console.error);
  }

  function handleAddStudent(form) {
    addStudent(form)
      .then(() => {
        setAddOpen(false);
        refreshList();   // list dobara load (naya student dikhe)
      })
      .catch((err) => alert(err.message));
  }
  
  const [detail, setDetail] = useState(null);

  function handleDeleteStudent(student) {
    if (!window.confirm(`${student.name} ko delete karna hai? Ye permanent hai.`)) return;
    deleteStudent(student.id)
      .then(() => {
        setSelectedId(null);
        setDetail(null);
        refreshList();
      })
      .catch((err) => alert(err.message));
  }

  function openStudent(id) {
    setSelectedId(id);
    setDetail(null);
    getStudent(id)
      .then((data) => {
        setDetail({
          id: data.id,
          name: data.name,
          father: data.father_name || "",
          cls: data.cls || "",
          roll: data.roll_no || "",
          phone: data.phone || "",
          fees: (data.fees || []).map((f) => ({
            id: String(f.id),
            type: f.type,
            label: f.label,
            amount: Number(f.amount),
            paidOn: f.status === "paid" ? "paid" : null,
            mode: null,
          })),
          custom: (data.custom || []).map((c) => ({
            id: String(c.id),
            amount: c.amount,
            note: c.note,
            mode: c.mode,
            date: c.date,
          })),
        });
      })
      .catch((err) => console.error("Detail error:", err));
  }

  const selected = detail;

  function statsOf(s) {
    let total = 0, paid = 0;
    for (const f of (s.fees || [])) {        // fees na ho to khali list
      total += f.amount; if (f.paidOn) paid += f.amount;
    }
    const customPaid = (s.custom || []).reduce((a, c) => a + c.amount, 0);
    const jama = paid + customPaid;
    return { total, jama, pending: Math.max(total - jama, 0) };
  
   } 


  const totals = useMemo(() => {
    let collected = 0, pending = 0;
    for (const s of students) { const st = statsOf(s); collected += st.jama; pending += st.pending; }
    return { collected, pending, count: students.length };
  }, [students]);

  function payItem(student, fee, mode) {
    const today = new Date().toISOString().slice(0, 10);
    makePayment(student.id, { fee_id: Number(fee.id), amount: fee.amount, mode })
      .then(() => {
        // detail page me us fee ko paid dikhao
        setDetail((prev) => prev && prev.id === student.id
          ? { ...prev, fees: (prev.fees || []).map((f) => f.id === fee.id ? { ...f, paidOn: today, mode } : f) }
          : prev);
        setReceipt({ student, title: fee.label, amount: fee.amount, mode, date: today, ref: fee.id + "-" + student.id });
      })
      .catch((err) => alert("Payment fail: " + err.message));
  }

  function payCustom(student, amount, note, mode) {
    const amt = parseInt(amount, 10);
    if (!amt || amt <= 0) return;
    const today = new Date().toISOString().slice(0, 10);
    makePayment(student.id, { fee_id: null, amount: amt, mode, note: note || "Custom payment" })
      .then(() => {
        const rec = { id: "c" + Date.now(), amount: amt, note: note || "Custom payment", mode, date: today };
        setDetail((prev) => prev && prev.id === student.id
          ? { ...prev, custom: [...(prev.custom || []), rec] }
          : prev);
        setReceipt({ student, title: rec.note, amount: amt, mode, date: today, ref: rec.id });
      })
      .catch((err) => alert("Payment fail: " + err.message));
  }

    if (!auth) {
    return <Login onLogin={(data) => { setAuthToken(data.token); setAuth(data); }} />;
  }

  // parent hai to parent view dikhao
  if (auth.user.role === "parent") {
    return <ParentView user={auth.user} onLogout={() => { setAuthToken(null); setAuth(null); }} />;
  }


  return (
    
    <div className={`min-h-screen transition-colors ${T.page}`}>
      <header className={`${T.header} text-white`}>
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center gap-3">
          <div className="bg-white text-sky-700 rounded-full w-12 h-12 flex flex-col items-center justify-center shrink-0 border-2 border-sky-300">
            <span className="text-sm font-medium leading-none">YBN</span>
          </div>
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-medium leading-tight truncate">Yogeshwar Bal Niketan Shiksha Deep</h1>
            <p className="text-sky-100 text-xs">Fees collection portal</p>
          </div>
          <div className="ml-auto flex items-center gap-2 shrink-0">
            <button onClick={() => setDark(!dark)} aria-label="Theme toggle"
              className="bg-sky-600 hover:bg-sky-500 rounded-full p-2 transition">
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <span className="hidden sm:inline text-xs bg-sky-800 px-2 py-1 rounded-md">{auth?.user?.name}</span>
            <button onClick={() => setAuth(null)}
              className="text-xs bg-sky-800 hover:bg-sky-900 px-3 py-1.5 rounded-md transition">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-5 py-6">
        {!selected ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              <SummaryCard T={T} icon={<Wallet size={18} />} label="Total collected" value={rupee(totals.collected)} tone="green" />
              <SummaryCard T={T} icon={<Clock size={18} />} label="Pending fees" value={rupee(totals.pending)} tone="amber" />
              <SummaryCard T={T} icon={<Users size={18} />} label="Total students" value={totals.count} tone="sky" />
            </div>

            <div className="flex justify-end mb-3">
              <button onClick={() => setAddOpen(true)}
                className="inline-flex items-center gap-1.5 text-sm font-medium bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-500 transition">
                <Plus size={16} /> Naya student
              </button>
            </div>

            <div className="relative mb-4">
              <Search size={18} className={`absolute left-3 top-3 pointer-events-none ${T.muted}`} />
              <input value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="Dhoondho — student naam, father name, ya class"
                className={`w-full border rounded-xl pl-10 pr-4 py-2.5 outline-none transition ${T.input}`} />
            </div>

            <div className={`border rounded-xl divide-y ${T.card} ${T.divide}`}>
              {filtered.length === 0 ? (
                <div className={`p-8 text-center text-sm ${T.muted}`}>Koi student nahi mila. Naam, father name ya class check karo.</div>
              ) : filtered.map((s) => {
                const pending = s.pending_fees !== undefined ? s.pending_fees : statsOf(s).pending;
                return (
                  <button key={s.id} onClick={() => openStudent(s.id)}
                    className={`w-full flex items-center gap-3 p-3.5 text-left transition ${T.hover}`}>
                    <div className="bg-sky-100 text-sky-700 rounded-full w-10 h-10 flex items-center justify-center font-medium shrink-0">{s.name.charAt(0)}</div>
                    <div className="min-w-0">
                      <div className={`font-medium truncate ${T.title}`}>{s.name}</div>
                    <div className={`text-xs truncate ${T.muted}`}>Class {s.cls} · Roll {s.roll_no} · {s.father_name}</div>                    </div>
                    <div className="ml-auto text-right shrink-0">
                      {pending === 0
                        ? <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded-md"><CheckCircle2 size={13} /> Fully paid</span>
                        : <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-1 rounded-md">{rupee(pending)} baaki</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <StudentDetail T={T} student={selected} stats={statsOf(selected)}
            onBack={() => { setSelectedId(null); setDetail(null); }} onPayItem={payItem} onPayCustom={payCustom}
            onDelete={handleDeleteStudent} />
        )}
      </main>

      {receipt && <ReceiptModal T={T} data={receipt} onClose={() => setReceipt(null)} />}
      {addOpen && <AddStudentModal T={T} onClose={() => setAddOpen(false)} onSave={handleAddStudent} />}

    </div>
    
  );
  
}

function SummaryCard({ T, icon, label, value, tone }) {
  const tones = { green: "bg-green-50 text-green-700", amber: "bg-amber-50 text-amber-700", sky: "bg-sky-100 text-sky-700" };
  return (
    <div className={`border rounded-xl p-4 ${T.card}`}>
      <div className={`inline-flex rounded-lg p-2 mb-3 ${tones[tone]}`}>{icon}</div>
      <div className={`text-2xl font-medium ${T.title}`}>{value}</div>
      <div className={`text-xs mt-0.5 ${T.muted}`}>{label}</div>
    </div>
  );
  
}

function StudentDetail({ T, student, stats, onBack, onPayItem, onPayCustom, onDelete }) {  
  const [collect, setCollect] = useState(null);
  const [customOpen, setCustomOpen] = useState(false);
  const months = (student.fees || []).filter((f) => f.type === "monthly");
  const exams = (student.fees || []).filter((f) => f.type === "exam");

  return (
    <div>
      <button onClick={onBack} className={`inline-flex items-center gap-1.5 text-sm mb-4 transition ${T.muted} hover:text-sky-600`}>
        <ArrowLeft size={16} /> Saare students
      </button>

      <div className={`border rounded-xl p-5 mb-4 ${T.card}`}>
        <div className="flex items-start gap-4">
          <div className="bg-sky-600 text-white rounded-full w-14 h-14 flex items-center justify-center text-xl font-medium shrink-0">{student.name.charAt(0)}</div>
          <div>
            <h2 className={`text-xl font-medium ${T.title}`}>{student.name}</h2>
            <p className={`text-sm ${T.muted}`}>Class {student.cls} · Roll {student.roll}</p>
            <p className={`text-xs mt-1 ${T.muted}`}>Father: {student.father} · {student.phone}</p>
          </div>
          <button onClick={() => setCustomOpen(true)}
            className="ml-auto shrink-0 inline-flex items-center gap-1.5 text-sm font-medium bg-sky-600 text-white px-3 py-2 rounded-lg hover:bg-sky-500 transition">
            <Plus size={15} /> Custom payment
          </button>
           <button onClick={() => onDelete(student)}
            className="shrink-0 inline-flex items-center gap-1.5 text-sm font-medium bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 transition">
            <Trash2 size={15} /> Delete
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-5">
          <FeeStat T={T} label="Total fees" value={rupee(stats.total)} />
          <FeeStat T={T} label="Jama hui" value={rupee(stats.jama)} tone="green" />
          <FeeStat T={T} label="Baaki" value={rupee(stats.pending)} tone={stats.pending ? "amber" : "green"} />
        </div>
      </div>

      <FeeSection T={T} icon={<CalendarDays size={16} />} title="Monthly fees" items={months} onCollect={setCollect} grid />
      <FeeSection T={T} icon={<FileText size={16} />} title="Exam fees" items={exams} onCollect={setCollect} />

      {(student.custom || []).length > 0 && (
        <div className={`border rounded-xl p-5 mb-4 ${T.card}`}>
          <h3 className={`font-medium mb-4 flex items-center gap-2 ${T.title}`}><Coins size={16} /> Custom / other payments</h3>
          <div className="space-y-2">
            {[...student.custom].reverse().map((c) => (
              <div key={c.id} className={`flex items-center justify-between border rounded-lg px-3 py-2 ${T.border}`}>
                <div><div className={`font-medium text-sm ${T.title}`}>{rupee(c.amount)}</div><div className={`text-xs ${T.muted}`}>{c.note} · {c.mode}</div></div>
                <div className={`text-xs ${T.muted}`}>{c.date}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {collect && <CollectModal T={T} student={student} fee={collect} onClose={() => setCollect(null)}
        onConfirm={(mode) => { onPayItem(student, collect, mode); setCollect(null); }} />}
      {customOpen && <CustomModal T={T} student={student} onClose={() => setCustomOpen(false)}
        onConfirm={(amt, note, mode) => { onPayCustom(student, amt, note, mode); setCustomOpen(false); }} />}
    </div>
  );
}

function FeeSection({ T, icon, title, items, onCollect, grid }) {
  return (
    <div className={`border rounded-xl p-5 mb-4 ${T.card}`}>
      <h3 className={`font-medium mb-4 flex items-center gap-2 ${T.title}`}>{icon} {title}</h3>
      <div className={grid ? "grid grid-cols-2 sm:grid-cols-3 gap-2" : "space-y-2"}>
        {items.map((f) => <FeeItem key={f.id} T={T} fee={f} onCollect={onCollect} />)}
      </div>
    </div>
  );
}

function FeeItem({ T, fee, onCollect }) {
  const paid = !!fee.paidOn;
  return (
    <div className={`rounded-lg border px-3 py-2.5 flex items-center justify-between gap-2 ${paid ? "border-green-200 bg-green-50" : T.border}`}>
      <div className="min-w-0">
        <div className={`font-medium text-sm truncate ${paid ? "text-green-800" : T.title}`}>{fee.label}</div>
        <div className={`text-xs ${paid ? "text-green-600" : T.muted}`}>{rupee(fee.amount)}</div>
      </div>
      {paid
        ? <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 shrink-0"><CheckCircle2 size={14} /> Paid</span>
        : <button onClick={() => onCollect(fee)} className="text-xs font-medium bg-sky-600 text-white px-2.5 py-1 rounded-md hover:bg-sky-500 transition shrink-0">Jama karo</button>}
    </div>
  );
}

function CollectModal({ T, student, fee, onClose, onConfirm }) {
  const [mode, setMode] = useState("Cash");
  return (
    <Overlay>
      <div className={`rounded-2xl max-w-sm w-full p-5 ${T.modal}`}>
        <ModalHead T={T} title="Fees jama karo" onClose={onClose} />
        <div className={`rounded-lg p-3 mb-4 text-sm ${T.soft}`}>
          <Row T={T} label="Student" value={student.name} />
          <Row T={T} label="Fees" value={fee.label} />
          <Row T={T} label="Amount" value={rupee(fee.amount)} bold />
        </div>
        <ModePicker T={T} mode={mode} setMode={setMode} />
        <button onClick={() => onConfirm(mode)} className="w-full bg-sky-600 text-white font-medium py-2.5 rounded-lg hover:bg-sky-500 transition">{rupee(fee.amount)} confirm karo</button>
      </div>
    </Overlay>
  );
}

function CustomModal({ T, student, onClose, onConfirm }) {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [mode, setMode] = useState("Cash");
  return (
    <Overlay>
      <div className={`rounded-2xl max-w-sm w-full p-5 ${T.modal}`}>
        <ModalHead T={T} title="Custom payment" onClose={onClose} />
        <p className={`text-xs mb-4 ${T.muted}`}>Guardian koi bhi amount de raha hai (advance, fine, ya partial) — yahan record karo.</p>
        <label className={`text-xs mb-1 block ${T.muted}`}>Amount (₹)</label>
        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Jaise 2000"
          className={`w-full border rounded-lg px-3 py-2 mb-3 outline-none transition ${T.input}`} />
        <label className={`text-xs mb-1 block ${T.muted}`}>Note / reason</label>
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Jaise advance fees, late fine"
          className={`w-full border rounded-lg px-3 py-2 mb-3 outline-none transition ${T.input}`} />
        <ModePicker T={T} mode={mode} setMode={setMode} />
        <button onClick={() => onConfirm(amount, note, mode)} disabled={!amount || parseInt(amount, 10) <= 0}
          className="w-full bg-sky-600 text-white font-medium py-2.5 rounded-lg hover:bg-sky-500 disabled:opacity-40 disabled:cursor-not-allowed transition">Payment record karo</button>
      </div>
    </Overlay>
  );
}

function ModePicker({ T, mode, setMode }) {
  return (
    <>
      <label className={`text-xs mb-1 block ${T.muted}`}>Payment mode</label>
      <div className="flex gap-2 mb-5">
        {["Cash", "Online", "Cheque"].map((m) => (
          <button key={m} onClick={() => setMode(m)}
            className={`flex-1 text-sm py-2 rounded-lg border transition ${mode === m ? "bg-sky-600 text-white border-sky-600" : `${T.border} ${T.muted} hover:border-sky-400`}`}>{m}</button>
        ))}
      </div>
    </>
  );
}

function FeeStat({ T, label, value, tone }) {
  const tones = { green: "text-green-600", amber: "text-amber-600" };
  return (
    <div className={`rounded-lg p-3 text-center ${T.soft}`}>
      <div className={`text-lg font-medium ${tones[tone] || T.title}`}>{value}</div>
      <div className={`text-xs mt-0.5 ${T.muted}`}>{label}</div>
    </div>
  );
}

function ReceiptModal({ T, data, onClose }) {
  const { student, title, amount, mode, date, ref } = data;
  return (
    <Overlay>
      <div className={`rounded-2xl max-w-sm w-full overflow-hidden ${T.modal}`}>
        <div className="bg-green-50 text-green-700 p-5 text-center">
          <CheckCircle2 size={40} className="mx-auto mb-2" />
          <h3 className="font-medium text-lg">Payment ho gaya!</h3>
          <p className="text-sm">{rupee(amount)} jama hua</p>
        </div>
        <div className="p-5 space-y-2 text-sm">
          <Row T={T} label="Student" value={student.name} />
          <Row T={T} label="Class / Roll" value={`${student.cls} · ${student.roll}`} />
          <Row T={T} label="For" value={title} />
          <Row T={T} label="Amount" value={rupee(amount)} bold />
          <Row T={T} label="Mode" value={mode} />
          <Row T={T} label="Date" value={date} />
          <div className={`text-xs text-center pt-2 ${T.muted}`}>Receipt #{ref}</div>
        </div>
        <div className="flex gap-2 p-4 pt-0">
          <button onClick={() => window.print()} className={`flex-1 border rounded-lg py-2 text-sm flex items-center justify-center gap-1.5 ${T.border} ${T.hover} transition`}><Printer size={15} /> Print</button>
          <button onClick={onClose} className="flex-1 bg-sky-600 text-white rounded-lg py-2 text-sm flex items-center justify-center gap-1.5 hover:bg-sky-500 transition"><X size={15} /> Band karo</button>
        </div>
      </div>
    </Overlay>
  );
}

function Overlay({ children }) {
  return <div className="fixed inset-0 bg-slate-900 bg-opacity-50 flex items-center justify-center p-4 z-50">{children}</div>;
}

function ModalHead({ T, title, onClose }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className={`font-medium text-lg flex items-center gap-2 ${T.title}`}><IndianRupee size={18} /> {title}</h3>
      <button onClick={onClose} className={`${T.muted} hover:text-sky-600`}><X size={18} /></button>
    </div>
  );
}

function Row({ T, label, value, bold }) {
  return (
    <div className="flex justify-between">
      <span className={T.muted}>{label}</span>
      <span className={bold ? `font-medium ${T.title}` : ""}>{value}</span>
    </div>
  );
}

function AddStudentModal({ T, onClose, onSave }) {
  const [form, setForm] = useState({
    admission_no: "", name: "", father_name: "", cls: "", roll_no: "", phone: "", monthly_fee: "1500",
  });

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  function submit() {
    if (!form.admission_no || !form.name || !form.cls) {
      alert("Admission no, naam aur class zaroori hai");
      return;
    }
    onSave({ ...form, monthly_fee: Number(form.monthly_fee) || 1500 });
  }

  return (
    <Overlay>
      <div className={`rounded-2xl max-w-md w-full p-5 ${T.modal}`}>
        <ModalHead T={T} title="Naya student add karo" onClose={onClose} />
        <div className="grid grid-cols-2 gap-3">
          <Field T={T} label="Admission no *" value={form.admission_no} onChange={set("admission_no")} />
          <Field T={T} label="Naam *" value={form.name} onChange={set("name")} />
          <Field T={T} label="Father name" value={form.father_name} onChange={set("father_name")} />
          <Field T={T} label="Class *" value={form.cls} onChange={set("cls")} placeholder="8-A" />
          <Field T={T} label="Roll no" value={form.roll_no} onChange={set("roll_no")} />
          <Field T={T} label="Phone" value={form.phone} onChange={set("phone")} />
          <Field T={T} label="Monthly fee (₹)" value={form.monthly_fee} onChange={set("monthly_fee")} type="number" />
        </div>
        <button onClick={submit}
          className="w-full bg-sky-600 text-white font-medium py-2.5 rounded-lg hover:bg-sky-500 transition mt-4">
          Student add karo
        </button>
      </div>
    </Overlay>
  );
}

function Field({ T, label, value, onChange, placeholder, type }) {
  return (
    <div>
      <label className={`text-xs mb-1 block ${T.muted}`}>{label}</label>
      <input type={type || "text"} value={value} onChange={onChange} placeholder={placeholder || ""}
        className={`w-full border rounded-lg px-3 py-2 outline-none transition ${T.input}`} />
    </div>
  );
}