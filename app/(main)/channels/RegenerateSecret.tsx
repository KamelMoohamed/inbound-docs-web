"use client";
import { useActionState } from "react";
import { regenerateAction, type ChannelActionState } from "./actions";
import { CredentialsPanel } from "@/components/CredentialsPanel";

export function RegenerateSecret({ id }: { id: string }) {
  const [state, action] = useActionState<ChannelActionState, FormData>(regenerateAction, {});
  return (
    <div>
      <form action={action}>
        <input type="hidden" name="id" value={id} />
        <button type="submit" className="rounded-lg border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50">
          Rotate secret
        </button>
      </form>
      {state.setup && <div className="mt-2"><CredentialsPanel setup={state.setup} /></div>}
    </div>
  );
}
