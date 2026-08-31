export default async function handler(req: any, res: any) {
  try {
    const serverModule = await import('../dist/server.cjs');
    const app = serverModule.default || serverModule;
    return app(req, res);
  } catch (err: any) {
    res.status(500).json({ 
      success: false, 
      error: "Failed to load server.cjs via dynamic import", 
      message: err.message, 
      stack: err.stack 
    });
  }
}
