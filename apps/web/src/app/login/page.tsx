"use client";

import { useState, type ComponentProps } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/auth";

type FormSubmitEvent = Parameters<NonNullable<ComponentProps<"form">["onSubmit"]>>[0];

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const submitLabel = getSubmitLabel(mode, submitting);

  function handleSubmit(event: FormSubmitEvent) {
    event.preventDefault();
    void submit();
  }

  async function submit() {
    setError("");
    setSubmitting(true);

    const endpoint = mode === "login" ? "sign-in/email" : "sign-up/email";
    const body = mode === "login" ? { email, password } : { name, email, password };
    const response = await fetch(`${API_URL}/api/auth/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as {
        message?: string;
        error?: { message?: string };
      } | null;
      setError(
        payload?.message ?? payload?.error?.message ?? "Unable to authenticate with those details.",
      );
      setSubmitting(false);
      return;
    }

    router.replace("/");
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#f7f8fc] px-4 py-10">
      <section className="w-full max-w-[420px] rounded-xl border border-[#e5e7ef] bg-white p-8 shadow-sm">
        <div className="mb-8">
          <p className="mb-3 text-sm font-semibold tracking-tight text-[#7663c8]">Planly</p>
          <h1 className="text-2xl font-semibold tracking-tight text-[#25243a]">
            {mode === "login" ? "Welcome back" : "Create your workspace"}
          </h1>
          <p className="mt-2 text-sm text-[#858698]">
            {mode === "login"
              ? "Sign in to continue planning."
              : "Start turning ideas into clear plans."}
          </p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {mode === "register" && <AuthField label="Name" value={name} onChange={setName} />}
          <AuthField label="Email" type="email" value={email} onChange={setEmail} />
          <AuthField
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            minLength={8}
          />
          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="h-10 w-full rounded-md bg-[#7663c8] text-sm font-medium text-white transition-colors hover:bg-[#6552b6] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitLabel}
          </button>
        </form>
        <button
          type="button"
          className="mt-6 w-full text-sm text-[#7663c8] hover:underline"
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setError("");
          }}
        >
          {mode === "login" ? "Need an account? Register" : "Already have an account? Sign in"}
        </button>
      </section>
    </main>
  );
}

function AuthField({
  label,
  type = "text",
  value,
  onChange,
  minLength,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  minLength?: number;
}) {
  return (
    <label className="block text-sm font-medium text-[#4c4d61]">
      {label}
      <input
        type={type}
        minLength={minLength}
        className="mt-2 h-10 w-full rounded-md border border-[#dfe1e9] px-3 font-normal outline-none focus:border-[#7663c8] focus:ring-2 focus:ring-[#e8e2fa]"
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
        }}
        required
      />
    </label>
  );
}

function getSubmitLabel(mode: "login" | "register", submitting: boolean) {
  if (submitting) return "Please wait...";
  if (mode === "login") return "Sign in";
  return "Create account";
}
