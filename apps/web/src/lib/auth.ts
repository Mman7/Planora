export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8787";

export async function getCurrentUser() {
  const response = await fetch(`${API_URL}/api/auth/me`, {
    credentials: "include",
  });

  if (!response.ok) return null;

  const payload = (await response.json()) as {
    data?: { user?: { id: string; name: string; email: string } };
  };
  return payload.data?.user ?? null;
}
