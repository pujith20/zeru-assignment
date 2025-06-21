import { spawn } from 'child_process';

export function parseLogsWithPython(logText) {
  return new Promise((resolve, reject) => {
    const py = spawn('python', ['src/scripts/parser.py']);

    let result = '';
    let error = '';

    py.stdout.on('data', (data) => {
      result += data.toString();
    });

    py.stderr.on('data', (data) => {
      error += data.toString();
    });

    py.on('close', (code) => {
      if (code !== 0 || error) {
        reject(new Error(`Python error: ${error}`));
      } else {
        try {
          resolve(JSON.parse(result));
        } catch (e) {
          reject(new Error('Invalid JSON from Python'));
        }
      }
    });

    py.stdin.write(logText);
    py.stdin.end();
  });
}
