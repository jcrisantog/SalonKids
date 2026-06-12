import { redirect } from "next/navigation";
import { cookies } from "next/headers";

const AUTH_STORAGE_KEY = "salon-kids-auth";

export default async function Home() {
  const cookieStore = await cookies();
  const hasStoredSession = Boolean(cookieStore.get(AUTH_STORAGE_KEY)?.value);

  redirect(hasStoredSession ? "/admin/dashboard" : "/login");
}
