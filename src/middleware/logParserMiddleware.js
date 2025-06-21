// src/middleware/logParserMiddleware.js
import { parseLogsWithPython } from '../utils/parseLogs.js';

export async function logParserMiddleware(req, res, next) {
  const rawLog = `
[REQUEST]
  METHOD: ${req.method}
  URL: ${req.originalUrl}
  QUERY: ${JSON.stringify(req.query || {}, null, 2)}
  BODY: ${JSON.stringify(req.body || {}, null, 2)}
  TIME: ${new Date().toISOString()}
`;

  try {
    const parsed = await parseLogsWithPython(rawLog);

    console.log('📄 Incoming Request Log');
    console.log(rawLog);
    console.log('🔍 Python Parsed Logs:');
    console.log(`- Found Errors: ${parsed.errors.length}`);
    if (parsed.errors.length > 0) {
      parsed.errors.forEach((err, index) =>
        console.log(`  ${index + 1}. ${err}`)
      );
    } else {
      console.log('  ✅ No errors found in log.');
    }
  } catch (err) {
    console.error('❌ Log parse failed:', err.message);
  }

  next();
}
