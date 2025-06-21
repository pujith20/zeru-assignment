import app from './app.js';
import { initializeDatabase } from './src/database/setup.js';
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await initializeDatabase(); // <-- crucial step
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  }
}

startServer();