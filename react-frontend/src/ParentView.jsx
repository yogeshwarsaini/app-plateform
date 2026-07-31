import { useState, useEffect } from "react";
import { GraduationCap, CheckCircle2, CalendarDays, FileText, LogOut } from "lucide-react";
import { getMyStudent } from "./api";

const rupee = (n) => "₹" + n.toLocaleString("en-IN");

export default function ParentView({ user, onLogout }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getMyStudent().then(setData).catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="min-h-screen bg-sky-50 flex items-center justify-center text-red-600">{error}</div>;
  if (!data) return <div className="min-h-screen bg-sky-50 flex items-center justify-center text-slate-500">Loading...</div>;

  const months = (data.fees || []).filter((f) => f.type === "monthly");
  const exams = (data.fees || []).filter((f) => f.type === "exam");

  return (
    <div className="min-h-screen bg-sky-50 text-slate-800">
      <header className="bg-sky-700 text-white">
        <div className="max-w-3xl mx-auto px-5 py-4 flex items-center gap-3">
          <div className="bg-white text-sky-700 rounded-full w-11 h-11 flex items-center justify-center">
            <GraduationCap size={22} />
          </div>
          <div>
            <h1 className="text-base font-medium leading-tight">Yogeshwar Bal Niketan Shiksha Deep</h1>
            <p className="text-sky-100 text-xs">Parent portal</p>
          </div>
          <button onClick={onLogout} className="ml-auto text-xs bg-sky-800 hover:bg-sky-900 px-3 py-1.5 rounded-md flex items-center gap-1.5">
            <LogOut size={14} /> Logout
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 py-6">
        <div className="bg-white border border-sky-100 rounded-xl p-5 mb-4">
          <h2 className="text-xl font-medium text-slate-900">{data.name}</h2>
          <p className="text-sm text-slate-500">Class {data.cls} · Roll {data.roll_no}</p>
          <div className="grid grid-cols-3 gap-3 mt-4">
            <Stat label="Total fees" value={rupee(data.total_fees)} />
            <Stat label="Jama hui" value={rupee(data.paid)} tone="green" />
            <Stat label="Baaki" value={rupee(data.pending)} tone={data.pending ? "amber" : "green"} />
          </div>
        </div>

        <Section icon={<CalendarDays size={16} />} title="Monthly fees" items={months} grid />
        <Section icon={<FileText size={16} />} title="Exam fees" items={exams} />
      </main>
    </div>
  );
}

function Stat({ label, value, tone }) {
  const c = { green: "text-green-600", amber: "text-amber-600" };
  return (
    <div className="bg-sky-50 rounded-lg p-3 text-center">
      <div className={`text-lg font-medium ${c[tone] || "text-slate-900"}`}>{value}</div>
      <div className="text-xs text-slate-500 mt-0.5">{label}</div>
    </div>
  );
}

function Section({ icon, title, items, grid }) {
  return (
    <div className="bg-white border border-sky-100 rounded-xl p-5 mb-4">
      <h3 className="font-medium text-slate-900 mb-4 flex items-center gap-2">{icon} {title}</h3>
      <div className={grid ? "grid grid-cols-2 sm:grid-cols-3 gap-2" : "space-y-2"}>
        {items.map((f) => {
          const paid = f.status === "paid";
          return (
            <div key={f.id} className={`rounded-lg border px-3 py-2.5 flex items-center justify-between ${paid ? "border-green-200 bg-green-50" : "border-sky-100"}`}>
              <div>
                <div className={`font-medium text-sm ${paid ? "text-green-800" : "text-slate-900"}`}>{f.label}</div>
                <div className={`text-xs ${paid ? "text-green-600" : "text-slate-500"}`}>{rupee(f.amount)}</div>
              </div>
              {paid
                ? <span className="text-xs font-medium text-green-700 flex items-center gap-1"><CheckCircle2 size={13} /> Paid</span>
                : <span className="text-xs font-medium text-amber-700">Pending</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
