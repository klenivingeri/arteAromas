import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySessionCookieServer } from "@/lib/auth.server";
import { SESSION_COOKIE_NAME } from "@/lib/auth.shared";

export default async function PainelLayout({ children }) {
  const cookieStore = await cookies();
  const sessionValue = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const secret = process.env.COOKIE_SECRET;

  if (!sessionValue || !secret) {
    redirect("/decorador");
  }

  const isValid = verifySessionCookieServer(sessionValue, secret);

  if (!isValid) {
    redirect("/decorador");
  }

  return children;
}
