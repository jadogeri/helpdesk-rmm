// frontend/app/api/[[...path]]/route.ts

import { API_ENDPOINTS } from "@repo/constants";

// Dynamically construct the validation set from your constants array
const collectionRoutes = new Set<string>(API_ENDPOINTS.PROXY_COLLECTION_ROUTES);

async function forward(request: Request, pathParts: string[]) {
  const path = pathParts.join("/");
  const method = request.method.toUpperCase();

  // Validate allowed routes using centralized constants matching naked NestJS endpoints
  const isTicketAttachmentUpload = new RegExp(
    `^${API_ENDPOINTS.UPSTREAM.TICKETS.BASE}/[0-9a-f-]{36}/attachments$`,
    "i",
  ).test(path);

  if (
    (method === "GET" && !collectionRoutes.has(path)) ||
    (method === "POST" &&
      path !== API_ENDPOINTS.UPSTREAM.TICKETS.BASE &&
      !isTicketAttachmentUpload)
  ) {
    return Response.json({ message: "This service desk route is not available." }, { status: 404 });
  }

  const baseUrl = (process.env.RMM_API_URL || "http://localhost:3001").replace(/\/+$/, "");
  const incomingUrl = new URL(request.url);
  const target = baseUrl + "/" + path + (method === "GET" ? incomingUrl.search : "");

  try {
    const headers = new Headers({ accept: "application/json" });
    const contentType = request.headers.get("content-type");
    if (method === "POST" && contentType) headers.set("content-type", contentType);

    const upstream = await fetch(target, {
      method,
      headers,
      body: method === "POST" ? await request.arrayBuffer() : undefined,
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });

    const responseBody = await upstream.text();
    return new Response(responseBody, {
      status: upstream.status,
      headers: { "content-type": upstream.headers.get("content-type") || "application/json" },
    });
  } catch {
    return Response.json({ message: "The service desk API could not be reached. Verify RMM_API_URL and that the backend is running." }, { status: 502 });
  }
}

async function getPath(context: { params: Promise<{ path: string[] }> }) {
  return (await context.params).path;
}

export async function GET(request: Request, context: { params: Promise<{ path: string[] }> }) {
  return forward(request, await getPath(context));
}

export async function POST(request: Request, context: { params: Promise<{ path: string[] }> }) {
  return forward(request, await getPath(context));
}
