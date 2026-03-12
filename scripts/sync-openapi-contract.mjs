import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = dirname(__dirname);
const backendDir = join(repoRoot, 'AlgotradingBot');
const frontendDir = join(repoRoot, 'frontend');
const contractsDir = join(repoRoot, 'contracts');
const generatedDir = join(frontendDir, 'src', 'generated');
const buildSpec = join(backendDir, 'build', 'openapi', 'openapi.json');
const repoSpec = join(contractsDir, 'openapi.json');
const generatedTypes = join(generatedDir, 'openapi.d.ts');
const checkMode = process.argv.includes('--check');

const execCommand = (command, args, cwd) => {
  execFileSync(command, args, {
    cwd,
    stdio: 'inherit',
  });
};

mkdirSync(contractsDir, { recursive: true });
mkdirSync(generatedDir, { recursive: true });

if (process.platform === 'win32') {
  execCommand('cmd.exe', ['/c', 'gradlew.bat', 'exportOpenApiContract', '--no-daemon'], backendDir);
} else {
  execCommand('sh', ['./gradlew', 'exportOpenApiContract', '--no-daemon'], backendDir);
}

if (!existsSync(buildSpec)) {
  throw new Error(`Expected OpenAPI contract at ${buildSpec}`);
}

copyFileSync(buildSpec, repoSpec);

if (process.platform === 'win32') {
  execCommand('cmd.exe', ['/c', 'npx', 'openapi-typescript', repoSpec, '-o', generatedTypes], frontendDir);
} else {
  execCommand('npx', ['openapi-typescript', repoSpec, '-o', generatedTypes], frontendDir);
}

if (checkMode) {
  try {
    execCommand('git', ['diff', '--exit-code', '--', 'contracts/openapi.json', 'frontend/src/generated/openapi.d.ts'], repoRoot);
  } catch {
    throw new Error('OpenAPI contract artifacts are out of date. Run `npm run contract:generate` in frontend.');
  }
}
