import app from './app.js';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '../dist');

const PORT = process.env.PORT || 3001;

// Secure static serving for production & local preview
// Prevents directory traversal attacks by using express.static with strict path boundaries
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath, {
    index: false,
    dotfiles: 'ignore',
    fallthrough: true
  }));

  // Safe SPA fallback: only serves index.html for GET requests that do not match /api
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    return res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 TextGuard AI is running securely on http://localhost:${PORT}`);
});
