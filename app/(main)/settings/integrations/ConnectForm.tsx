"use client";
import { useState } from "react";

type Option = { key: string; display_name: string; authKind: "api_key" | "oauth2" };

export function ConnectForm({ options, connectApiKey, beginOAuth, selected: initial }: {
  options: Option[];
  connectApiKey: (formData: FormData) => void | Promise<void>;
  beginOAuth: (pmsType: string) => void | Promise<void>;
  selected?: string;
}) {
  const [selected, setSelected] = useState(initial ?? options[0]?.key ?? "");
  const opt = options.find((o) => o.key === selected);

  return (
    <div className="flex flex-col gap-3 max-w-md">
      <label className="flex flex-col gap-1 text-sm">Practice software
        <select value={selected} onChange={(e) => setSelected(e.target.value)} className="border rounded px-2 py-1">
          {options.map((o) => <option key={o.key} value={o.key}>{o.display_name}</option>)}
        </select>
      </label>

      {opt?.authKind === "api_key" && (
        <form action={connectApiKey} className="flex flex-col gap-2">
          <input type="hidden" name="pms_type" value={selected} />
          <label className="flex flex-col gap-1 text-sm">API key
            <input name="api_key" aria-label="API key" className="border rounded px-2 py-1" />
          </label>
          <button type="submit" className="bg-blue-600 text-white rounded px-4 py-2">Connect</button>
        </form>
      )}

      {opt?.authKind === "oauth2" && (
        <button onClick={() => beginOAuth(selected)} className="bg-blue-600 text-white rounded px-4 py-2">
          Connect with {opt.display_name}
        </button>
      )}
    </div>
  );
}
