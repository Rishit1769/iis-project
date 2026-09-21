"use client";

import { useEffect, useState } from "react";

type Teacher = {
  id: string;
  name: string;
  email: string;
  approvalStatus: string;
  createdAt: string;
};

export default function AdminPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [error, setError] = useState("");

  const loadTeachers = () => {
    fetch("/api/admin/teachers")
      .then((response) => response.json())
      .then((data) => (Array.isArray(data) ? setTeachers(data) : setError(data.error || "Unable to load teachers")))
      .catch(() => setError("Unable to load teachers"));
  };

  useEffect(loadTeachers, []);

  const updateStatus = async (id: string, status: "APPROVED" | "REJECTED") => {
    const response = await fetch("/api/admin/teachers", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (response.ok) loadTeachers();
    else setError((await response.json()).error || "Unable to update teacher");
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Teacher approvals</h1>
        <p className="text-[var(--muted-foreground)] mt-1">Approve or reject teacher account requests.</p>
      </div>
      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</div>}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-[var(--border)]"><th className="text-left py-3 px-4">Name</th><th className="text-left py-3 px-4">Email</th><th className="text-left py-3 px-4">Status</th><th className="text-right py-3 px-4">Action</th></tr></thead>
          <tbody>
            {teachers.map((teacher) => <tr key={teacher.id} className="border-b border-[var(--border)] last:border-0">
              <td className="py-3 px-4 font-medium">{teacher.name}</td>
              <td className="py-3 px-4">{teacher.email}</td>
              <td className="py-3 px-4"><span className={teacher.approvalStatus === "APPROVED" ? "badge-success" : teacher.approvalStatus === "REJECTED" ? "badge-neutral" : "badge-warning"}>{teacher.approvalStatus}</span></td>
              <td className="py-3 px-4 text-right space-x-2">
                <button className="btn-primary text-sm" onClick={() => updateStatus(teacher.id, "APPROVED")}>Approve</button>
                <button className="btn-secondary text-sm" onClick={() => updateStatus(teacher.id, "REJECTED")}>Reject</button>
              </td>
            </tr>)}
          </tbody>
        </table>
        {teachers.length === 0 && <p className="text-sm text-[var(--muted-foreground)] p-4">No teacher accounts yet.</p>}
      </div>
    </div>
  );
}
