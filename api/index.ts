export default async function handler(req: any, res: any) {
  try {
    const server = await import('../server/index');
    const app = server.default || server;
    // Let express handle the request
    return app(req, res);
  } catch (err: any) {
    res.status(500).json({ 
      success: false, 
      error: "Failed to initialize server", 
      message: err.message, 
      stack: err.stack 
    });
  }
}
