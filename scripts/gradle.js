const { spawn } = require('child_process');
const path = require('path');

const isWin = process.platform === 'win32';
const backendDir = path.resolve(__dirname, '..', 'backend');
const args = process.argv.slice(2);

const executable = isWin ? 'cmd.exe' : './gradlew';
const execArgs = isWin ? ['/c', 'gradlew.bat', ...args] : args;

const child = spawn(executable, execArgs, {
  cwd: backendDir,
  stdio: 'inherit',
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
