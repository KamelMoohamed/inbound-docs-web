import { api } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { inviteAction, setRoleAction, removeAction, rotateKeyAction } from "./actions";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { PageHeader } from "@/components/ui/PageHeader";

export const dynamic = "force-dynamic";

export default async function OrgPage() {
  const session = await requireSession();
  const users = await api.listOrgUsers();
  const canManage = ["owner", "admin"].includes(session.role);
  return (
    <section className="space-y-6">
      {/* Team members */}
      <Card padding="p-6">
        <div className="mb-4 flex items-center justify-between">
          <PageHeader title="Team members" />
          {canManage && (
            <a href="/org/audit" className="text-sm text-indigo-600 hover:underline">View audit log →</a>
          )}
        </div>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Member</th>
              <th className="px-4 py-3">Role</th>
              {canManage && <th className="px-4 py-3"></th>}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="flex items-center gap-3 px-4 py-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
                    {u.name.charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <div className="font-medium text-slate-900">{u.name}</div>
                    <div className="text-xs text-slate-500">{u.email}</div>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-700 capitalize">{u.role}</td>
                {canManage && (
                  <td className="flex items-center gap-2 px-4 py-3">
                    <form
                      action={setRoleAction.bind(
                        null,
                        u.id,
                        u.role === "member" ? "admin" : "member",
                      )}
                    >
                      <Button type="submit" variant="secondary" size="sm">
                        Toggle admin
                      </Button>
                    </form>
                    {u.id !== session.userId && (
                      <form action={removeAction.bind(null, u.id)}>
                        <Button type="submit" variant="danger" size="sm">
                          Remove
                        </Button>
                      </form>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Invite a team member */}
      {canManage && (
        <Card padding="p-6">
          <h2 className="mb-4 text-base font-semibold text-slate-900">
            Invite a team member
          </h2>
          <form action={inviteAction} className="flex items-end gap-3">
            <FormField label="Email">
              <input
                name="email"
                type="email"
                placeholder="colleague@example.com"
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </FormField>
            <FormField label="Role">
              <select
                name="role"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </FormField>
            <Button type="submit" variant="primary">
              Send invite
            </Button>
          </form>
        </Card>
      )}

      {/* Machine ingestion key */}
      {canManage && (
        <Card padding="p-6" className="border-l-4 border-l-amber-400">
          <h2 className="mb-1 text-base font-semibold text-slate-900">
            Machine ingestion key
          </h2>
          <p className="mb-4 text-sm text-slate-500">
            Rotate the per-org key used by the{" "}
            <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">
              /ingest/email
            </code>{" "}
            machine endpoint.
          </p>
          <form action={rotateKeyAction}>
            <Button
              type="submit"
              variant="secondary"
              className="border-amber-300 text-amber-700 hover:bg-amber-50"
            >
              Rotate ingestion key
            </Button>
          </form>
        </Card>
      )}
    </section>
  );
}
