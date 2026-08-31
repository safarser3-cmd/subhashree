import server from '../dist/server.cjs';

export default async function handler(req: any, res: any) {
  try {
    const app = server.default || server;
    return app(req, res);
  } catch (err: any) {
    res.status(500).json({ 
      success: false, 
      error: "Failed to initialize server from dist", 
      message: err.message, 
      stack: err.stack 
    });
  }
}
