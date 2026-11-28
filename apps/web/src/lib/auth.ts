export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8787";

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const response = await fetch(`${API_URL}/api/auth/me`, {
    credentials: "include",
  });

  if (!response.ok) return null;

  const payload = (await response.json()) as {
    data?: { user?: CurrentUser };
  };
  return payload.data?.user ?? null;
}

export async function signOut() {
  const response = await fetch(`${API_URL}/api/auth/sign-out`, {
    method: "POST",
    credentials: "include",
  });
  if (!response.ok) throw new Error("Unable to sign out");
}
