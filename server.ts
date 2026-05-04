import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Normalize APP_URL and construction of LINKEDIN_REDIRECT_URI
  const rawAppUrl = process.env.APP_URL || "";
  const normalizedAppUrl = rawAppUrl.endsWith("/") ? rawAppUrl.slice(0, -1) : rawAppUrl;
  
  const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
  const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
  const LINKEDIN_REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI || `${normalizedAppUrl}/auth/callback`;

  console.log(`[LinkedIn Auth] Active Redirect URI: ${LINKEDIN_REDIRECT_URI}`);
  console.log(`[LinkedIn Auth] If you see a mismatch error, ensure the above URL is added to the LinkedIn Developer Portal.`);

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // 1. Get LinkedIn Auth URL
  app.get("/api/auth/linkedin/url", (req, res) => {
    if (!LINKEDIN_CLIENT_ID) {
      return res.status(500).json({ error: "LinkedIn Client ID not configured" });
    }

    const params = new URLSearchParams({
      response_type: "code",
      client_id: LINKEDIN_CLIENT_ID,
      redirect_uri: LINKEDIN_REDIRECT_URI,
      state: "random_state_string", // In production, use a secure CSRF state
      scope: "openid profile email", // Updated for LinkedIn OpenID Connect
    });

    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
    res.json({ url: authUrl });
  });

  // 2. LinkedIn Callback Handler
  app.get(["/auth/callback", "/auth/callback/"], async (req, res) => {
    const { code, error } = req.query;

    if (error) {
      return res.send(`
        <html>
          <body>
            <script>
              window.opener.postMessage({ type: 'LINKEDIN_AUTH_ERROR', error: '${error}' }, '*');
              window.close();
            </script>
          </body>
        </html>
      `);
    }

    try {
      // Exchange code for access token
      const tokenResponse = await axios.post("https://www.linkedin.com/oauth/v2/accessToken", 
        new URLSearchParams({
          grant_type: "authorization_code",
          code: code as string,
          client_id: LINKEDIN_CLIENT_ID!,
          client_secret: LINKEDIN_CLIENT_SECRET!,
          redirect_uri: LINKEDIN_REDIRECT_URI,
        }).toString(),
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" }
        }
      );

      const { access_token } = tokenResponse.data;

      // Fetch Profile Details (OpenID Connect UserInfo)
      const userResponse = await axios.get("https://api.linkedin.com/v2/userinfo", {
        headers: { Authorization: `Bearer ${access_token}` }
      });

      const profile = userResponse.data;
      
      // Map LinkedIn profile to our internal structure
      const userProfile = {
        firstName: profile.given_name,
        lastName: profile.family_name,
        email: profile.email,
        profileUrl: profile.picture || "",
        id: profile.sub
      };

      // Send profile back to main window and close popup
      res.send(`
        <html>
          <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #f3f4f6;">
            <div style="text-align: center; background: white; padding: 2rem; rounded-3xl; box-shadow: 0 10px 25px rgba(0,0,0,0.1); border-radius: 20px;">
              <h2 style="color: #0077B5;">LinkedIn Connected!</h2>
              <p>Synchronizing your intelligence profile...</p>
              <script>
                if (window.opener) {
                  window.opener.postMessage({ 
                    type: 'LINKEDIN_AUTH_SUCCESS', 
                    profile: ${JSON.stringify(userProfile)} 
                  }, '*');
                  setTimeout(() => window.close(), 1000);
                } else {
                  window.location.href = '/profile';
                }
              </script>
            </div>
          </body>
        </html>
      `);
    } catch (err: any) {
      console.error("LinkedIn OAuth Error:", err.response?.data || err.message);
      res.status(500).send("Authentication failed. Please check server logs.");
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
