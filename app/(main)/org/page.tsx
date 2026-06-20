import { api } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { inviteAction, setRoleAction, removeAction, rotateKeyAction } from "./actions";
export const dynamic = "force-dynamic";
export default async function OrgPage() {
  const session = await requireSession();
  const users = await api.listOrgUsers();
  const canManage = ["owner", "admin"].includes(session.role);
  return (
    <section className="space-y-8">
      <div>
        <h1 className="mb-4 text-xl font-semibold">Team members</h1>
        <table className="w-full border-collapse text-sm">
          <thead><tr className="text-left text-slate-500"><th className="p-2">Email</th><th className="p-2">Name</th><th className="p-2">Role</th>{canManage && <th className="p-2"></th>}</tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-t border-slate-100">
                <td className="p-2">{u.email}</td><td className="p-2">{u.name}</td>
                <td className="p-2">{u.role}</td>
                {canManage && <td className="flex gap-2 p-2">
                  <form action={setRoleAction.bind(null, u.id, u.role === "member" ? "admin" : "member")}>
                    <button className="text-xs text-blue-600 underline">Toggle admin</button>
                  </form>
                  {u.id !== session.userId && (
                    <form action={removeAction.bind(null, u.id)}>
                      <button className="text-xs text-red-600 underline">Remove</button>
                    </form>
                  )}
                </td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {canManage && (
        <div>
          <h2 className="mb-3 text-base font-semibold">Invite a team member</h2>
          <form action={inviteAction} className="flex gap-3">
            <input name="email" type="email" placeholder="Email" required
                   className="rounded border border-slate-300 px-3 py-1.5 text-sm" />
            <select name="role" className="rounded border border-slate-300 px-2 py-1.5 text-sm">
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
            <button className="rounded bg-slate-900 px-3 py-1.5 text-sm text-white">Send invite</button>
          </form>
        </div>
      )}
      {canManage && (
        <div>
          <h2 className="mb-1 text-base font-semibold">Machine ingestion key</h2>
          <p className="mb-2 text-sm text-slate-500">Rotate the per-org key used by the <code>/ingest/email</code> machine endpoint.</p>
          <form action={rotateKeyAction}>
            <button className="rounded border border-amber-400 px-3 py-1.5 text-sm text-amber-700">Rotate ingestion key</button>
          </form>
        </div>
      )}
    </section>
  );
}
