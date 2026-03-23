
import { postLogin, getLogout } from "./controller.js";

export async function POST(request) {
  const body = await request.json();
  const { email, password } = body;
  const userAgent = request.headers.get('user-agent');

  const response = postLogin({ email, password, userAgent });

  return response;
}

export async function GET() {
  const response = getLogout();

  return response;
}