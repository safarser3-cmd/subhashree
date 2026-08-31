import serverModule from '../dist/server.cjs';

export default async function handler(req: any, res: any) {
  try {
    const app = serverModule.default || serverModule;
    return app(req, res);
  } catch (err: any) {
    res.status(500).json({ 
      success: false, 
      error: "Failed to load server.cjs", 
      message: err.message, 
      stack: err.stack 
    });
  }
}
