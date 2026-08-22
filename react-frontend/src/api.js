// Backend ka address — local pe abhi
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

let authToken = null;
export function setAuthToken(t) { authToken = t; }



function authHeaders() {
  return authToken ? { Authorization: `Bearer ${authToken}` } : {};
}
// Saare students (ya search)
export async function getStudents(query = "") {
   const res = await fetch(`${API_URL}/api/v1/students?q=${encodeURIComponent(query)}`, {
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error("Students laane me dikkat");
  return res.json();
}

// Ek student + uski fees
export async function getStudent(id) {
  const res = await fetch(`${API_URL}/api/v1/students/${id}`, {
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error("Student nahi mila");
  return res.json();
}

export async function makePayment(studentId, payload) {
  const res = await fetch(`${API_URL}/api/v1/students/${studentId}/payments`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Payment me dikkat");
  return res.json();
}

export async function addStudent(payload) {
  const res = await fetch(`${API_URL}/api/v1/students`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Student add me dikkat");
  }
  return res.json();
}

export async function login(username, password) {
  const res = await fetch(`${API_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Login fail");
  }
  return res.json();
}

export async function getMyStudent() {
  const res = await fetch(`${API_URL}/api/v1/auth/me/student`, {
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error("Data laane me dikkat");
  return res.json();
}

export async function signup(payload) {
  const res = await fetch(`${API_URL}/api/v1/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Signup fail");
  }
  return res.json();
}

export async function deleteStudent(id) {
  const res = await fetch(`${API_URL}/api/v1/students/${id}`, {
    method: "DELETE",
    headers: { ...authHeaders() },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Delete fail");
  }
  return res.json();
}

export async function forgotPassword(payload) {
  const res = await fetch(`${API_URL}/api/v1/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Reset fail");
  }
  return res.json();
}
