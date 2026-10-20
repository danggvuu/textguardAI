import app from './app.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '../dist');

const PORT = process.env.PORT || 3001;

// Serve frontend build if dist exists (when running locally)
if (fs.existsSync(distPath)) {
  app.use((req, res, next) => {
    // Let static handler or index.html handle non-api requests
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      const filePath = path.join(distPath, req.path);
      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        return res.sendFile(filePath);
      }
      return res.sendFile(path.join(distPath, 'index.html'));
    }
    next();
  });
}

app.listen(PORT, () => {
  console.log(`🚀 TextGuard AI is running on http://localhost:${PORT}`);
});
