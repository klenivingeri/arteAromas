import { isEmpty } from "@/utils/isEmpty";
import { serialize } from "cookie";
import crypto, { randomUUID } from "crypto";

const SECRET = process.env.COOKIE_SECRET;

function generateSignature(value) {
  return crypto.createHmac("sha256", SECRET).update(value).digest("hex");
}

export function createCookie(userId) {
  const timestamp = Date.now();
  const nonce = randomUUID(); // ou só o timestamp já dá

  const data = [userId, timestamp, nonce].join(".");
  const signature = generateSignature(data);

  const cookieValue = `${userId}.${timestamp}.${nonce}.${signature}`;

  return serialize("x-tenant", cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 16 * 60 * 60, // 16 hrs
  });
}

export const removeTenantCookie = () => {
  return serialize("x-tenant", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0, // <--- ESTE É O SEGREDO
  });
};

export const postLogin = async ({email, password}) => {
  try {
    const user = {
      email: 'erick@gmail.com',
      id: '12d0930',
      password: '123'
    }
    if(isEmpty(email) || isEmpty(password) ){

    }
    console.log(email, {email, password})
    const match = user?.password === password;
    if (!match){ 
      return new Response(
        JSON.stringify({ message: "Credenciais inválidas" }),
        { status: 401 }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Login bem-sucedido",
        records: [
          {
            name: user.name,
          },
        ],
      }),
      {
        status: 200,
        headers: {
          "Set-Cookie": createCookie(user.id),
          "Content-Type": "application/json",
        },
      }
    );
  } catch (_) {
    console.log(_)
    return new Response(
      JSON.stringify({
        success: false,
        message: "Algo errado não esta certo, tente novamente.",
      }),
      {
        status: 500,
      }
    );
  }
};

export const getLogout = async () => {
  const cookieHeader = removeTenantCookie();
  return new Response(
    JSON.stringify({
      success: true,
      message: "Logout bem-sucedido",
    }),
    {
      status: 200,
      headers: {
        "Set-Cookie": cookieHeader,
      },
    }
  );
};