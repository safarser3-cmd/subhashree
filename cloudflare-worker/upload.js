const ALLOWED_ORIGINS = [
  "https://subhaslyf.vercel.app",
  "http://localhost:3000",
  "http://localhost:5173",
];

function getCorsOrigin(request) {
  const origin = request.headers.get("Origin") || "";
  if (ALLOWED_ORIGINS.includes(origin)) return origin;
  // For GET image requests (no Origin header), allow loading from anywhere
  // but for mutating requests, deny unknown origins
  if (!origin && request.method === "GET") return "https://subhaslyf.vercel.app";
  return "https://subhaslyf.vercel.app"; // fallback to main site
}

function corsHeaders(request) {
  return {
    "Access-Control-Allow-Origin": getCorsOrigin(request),
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders(request) });
    }

    if (request.method === "GET") {
      const url = new URL(request.url);
      const key = url.pathname.substring(1); // strip leading slash
      if (!key) {
        return new Response("Not found", { status: 404 });
      }
      const object = await env.BUCKET.get(key);
      if (!object) {
        return new Response("Object Not Found", { status: 404 });
      }
      const headers = new Headers();
      object.writeHttpMetadata(headers);
      // Images need cross-origin loading — use the requesting origin if allowed
      headers.set("Access-Control-Allow-Origin", getCorsOrigin(request));
      headers.set("Vary", "Origin");
      headers.set("Cache-Control", "public, max-age=31536000");
      headers.set("etag", object.httpEtag);
      return new Response(object.body, { headers });
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    // 1. Verify Firebase Auth Token
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Missing or invalid Authorization header" }), { 
        status: 401,
        headers: { ...corsHeaders(request), "Content-Type": "application/json" }
      });
    }
    const token = authHeader.substring(7);

    try {
      const payloadB64 = token.split(".")[1];
      const payload = JSON.parse(atob(payloadB64));
      
      // Basic check: is token expired?
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp < now) {
        return new Response(JSON.stringify({ error: "Token expired" }), { 
          status: 401,
          headers: { ...corsHeaders(request), "Content-Type": "application/json" }
        });
      }
      
      // Basic check: audience matches your Firebase Project ID
      const expectedAudience = "subhashree-sahu-5e0a6";
      if (payload.aud !== expectedAudience) {
         return new Response(JSON.stringify({ error: "Invalid token audience" }), { 
           status: 401,
           headers: { ...corsHeaders(request), "Content-Type": "application/json" }
         });
      }
      
      const uid = payload.user_id;
      const email = payload.email || "";

      // 1.5 Verify Admin dynamically against Firestore
      let isAdmin = false;
      if (email) {
        const firestoreUrl = `https://firestore.googleapis.com/v1/projects/subhashree-sahu-5e0a6/databases/(default)/documents/admins/${encodeURIComponent(email)}`;
        try {
          const adminRes = await fetch(firestoreUrl, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (adminRes.ok) isAdmin = true;
          if (!adminRes.ok) isAdmin = false;
        } catch (e) {
          isAdmin = false;
        }
      }

      // Handle JSON actions (like /reject)
      const urlPath = new URL(request.url).pathname;
      if (urlPath === '/reject') {
        if (!isAdmin) {
          return new Response(JSON.stringify({ error: "Unauthorized admin action" }), { 
            status: 403,
            headers: { ...corsHeaders(request), "Content-Type": "application/json" }
          });
        }
        const body = await request.json();
        if (body.storageKey) {
          const keyToDelete = body.storageKey.startsWith('/') ? body.storageKey.substring(1) : body.storageKey;
          await env.BUCKET.delete(keyToDelete);
          return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders(request), "Content-Type": "application/json" }
          });
        }
        return new Response(JSON.stringify({ error: "Missing storageKey" }), { 
          status: 400,
          headers: { ...corsHeaders(request), "Content-Type": "application/json" }
        });
      }

      // Handle /approve
      if (urlPath === '/approve') {
        if (!isAdmin) {
          return new Response(JSON.stringify({ error: "Unauthorized admin action" }), { 
            status: 403,
            headers: { ...corsHeaders(request), "Content-Type": "application/json" }
          });
        }
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders(request), "Content-Type": "application/json" }
        });
      }

      // 2. Parse FormData for file uploads
      const formData = await request.formData();
      const file = formData.get("file");
      
      if (!file || !(file instanceof File)) {
        return new Response(JSON.stringify({ error: "No file uploaded" }), { 
          status: 400,
          headers: { ...corsHeaders(request), "Content-Type": "application/json" }
        });
      }
      
      // 3. Validate File Size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        return new Response(JSON.stringify({ error: "File too large. Maximum size is 10MB." }), { 
          status: 400,
          headers: { ...corsHeaders(request), "Content-Type": "application/json" }
        });
      }
      
      // 4. Validate Content Type
      if (!file.type.startsWith("image/")) {
         return new Response(JSON.stringify({ error: "Only image uploads are allowed." }), { 
           status: 400,
           headers: { ...corsHeaders(request), "Content-Type": "application/json" }
         });
      }

      // 5. Upload to R2 securely
      const timestamp = Date.now();
      const safeFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const objectKey = `fanart/${uid}/${timestamp}_${safeFilename}`;
      
      await env.BUCKET.put(objectKey, file.stream(), {
        httpMetadata: { contentType: file.type }
      });
      
      const url = new URL(request.url);
      const publicUrl = `${url.origin}/${objectKey}`;

      return new Response(JSON.stringify({ url: publicUrl }), {
        headers: { ...corsHeaders(request), "Content-Type": "application/json" }
      });
      
    } catch (err) {
      console.error(err);
      return new Response(JSON.stringify({ error: "Failed to process upload" }), { 
        status: 500,
        headers: { ...corsHeaders(request), "Content-Type": "application/json" }
      });
    }
  }
};
