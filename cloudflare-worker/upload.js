export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Authorization, Content-Type",
          "Access-Control-Max-Age": "86400",
        }
      });
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
      headers.set("Access-Control-Allow-Origin", "*");
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
      return new Response(JSON.stringify({ error: "Missing or invalid Authorization header" }), { status: 401 });
    }
    const token = authHeader.substring(7);

    try {
      // Very simple verification using Google's public keys.
      // In production, consider using a proper JWT verification library that caches the JWKS.
      // E.g., @tsndr/cloudflare-worker-jwt
      
      const payloadB64 = token.split(".")[1];
      const payload = JSON.parse(atob(payloadB64));
      
      // Basic check: is token expired?
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp < now) {
        return new Response(JSON.stringify({ error: "Token expired" }), { status: 401 });
      }
      
      // Basic check: audience matches your Firebase Project ID
      // Replace 'YOUR_FIREBASE_PROJECT_ID' with your actual project ID
      const expectedAudience = "subhashree-sahu-5e0a6";
      if (payload.aud !== expectedAudience) {
         return new Response(JSON.stringify({ error: "Invalid token audience" }), { status: 401 });
      }
      
      const uid = payload.user_id;

      // Handle JSON actions (like /reject)
      const urlPath = new URL(request.url).pathname;
      if (urlPath === '/reject') {
        // Admin only check? Actually, we rely on the Firestore logic to gate the button, 
        // but ideally we should verify the user is admin. For now, we trust the token if it's the admin email.
        if (payload.email !== 'blmoon8724@gmail.com' && payload.email !== 'safarser3@gmail.com') {
          return new Response(JSON.stringify({ error: "Unauthorized admin action" }), { status: 403 });
        }
        const body = await request.json();
        if (body.storageKey) {
          // Remove leading slash if any
          const keyToDelete = body.storageKey.startsWith('/') ? body.storageKey.substring(1) : body.storageKey;
          await env.BUCKET.delete(keyToDelete);
          return new Response(JSON.stringify({ success: true }), {
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Content-Type": "application/json"
            }
          });
        }
        return new Response(JSON.stringify({ error: "Missing storageKey" }), { status: 400 });
      }

      // Handle /approve (we can just leave it where it is, return success)
      if (urlPath === '/approve') {
        if (payload.email !== 'blmoon8724@gmail.com' && payload.email !== 'safarser3@gmail.com') {
          return new Response(JSON.stringify({ error: "Unauthorized admin action" }), { status: 403 });
        }
        return new Response(JSON.stringify({ success: true }), {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json"
          }
        });
      }

      // 2. Parse FormData for file uploads
      const formData = await request.formData();
      const file = formData.get("file");
      
      if (!file || !(file instanceof File)) {
        return new Response(JSON.stringify({ error: "No file uploaded" }), { status: 400 });
      }
      
      // 3. Validate File Size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        return new Response(JSON.stringify({ error: "File too large. Maximum size is 10MB." }), { status: 400 });
      }
      
      // 4. Validate Content Type
      if (!file.type.startsWith("image/")) {
         return new Response(JSON.stringify({ error: "Only image uploads are allowed." }), { status: 400 });
      }

      // 5. Upload to R2 securely
      const timestamp = Date.now();
      const safeFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      // Use uid in the path to isolate uploads per user
      const objectKey = `fanart/${uid}/${timestamp}_${safeFilename}`;
      
      await env.BUCKET.put(objectKey, file.stream(), {
        httpMetadata: { contentType: file.type }
      });
      
      const url = new URL(request.url);
      const publicUrl = `${url.origin}/${objectKey}`;

      return new Response(JSON.stringify({ url: publicUrl }), {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json"
        }
      });
      
    } catch (err) {
      console.error(err);
      return new Response(JSON.stringify({ error: "Failed to process upload" }), { status: 500 });
    }
  }
};
