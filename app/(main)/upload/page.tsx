"use client";
import { useActionState } from "react";
import { uploadAction } from "./actions";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormField } from "@/components/ui/FormField";

export default function UploadPage() {
  const [state, action, pending] = useActionState(uploadAction, null);
  return (
    <section className="max-w-md">
      <PageHeader title="Upload a document" />
      <Card padding="p-6">
        <form action={action} className="space-y-4">
          <FormField label="Document (image or PDF)">
            <input
              type="file"
              name="file"
              required
              disabled={pending}
              className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-indigo-700"
            />
          </FormField>
          <Button
            type="submit"
            variant="primary"
            loading={pending}
            className="w-full"
          >
            Upload
          </Button>
        </form>
        {state && (
          <p
            className={`mt-4 rounded-lg border px-4 py-3 text-sm ${
              state.ok
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-red-200 bg-red-50 text-red-800"
            }`}
          >
            {state.message}
          </p>
        )}
      </Card>
    </section>
  );
}
