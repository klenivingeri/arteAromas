import {
  getProducts,
  postProducts,
  deleteProdutcs,
  putProducts,
} from "./controller.js";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const response = getProducts({
    products,
    xTenant,
    id,
  });

  return response;
}

export async function POST(request) {
  const body = await request.json();
  const response = postProducts({
    products,
    xTenant,
    body,
  });

  return response;
}

export async function PUT(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const body = await request.json();

  const response = await putProducts({
    products,
    xTenant,
    body,
    id,
  });

  return response;
}

export async function DELETE(request) {
  const body = await request.json();

  const response = await deleteProdutcs({
    products,
    xTenant,
    body,
  });

  return response;
}