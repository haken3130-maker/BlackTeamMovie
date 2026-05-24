const JavaScriptObfuscator = require('javascript-obfuscator');
const fs = require('fs');
const path = require('path');

const buildDir = path.join(__dirname, '..', '.next');

function obfuscateFile(filePath) {
  if (!filePath.endsWith('.js')) return;
  const code = fs.readFileSync(filePath, 'utf8');
  if (code.length < 100) return;
  try {
    const result = JavaScriptObfuscator.obfuscate(code, {
      compact: true,
      controlFlowFlattening: true,
      controlFlowFlatteningThreshold: 0.75,
      deadCodeInjection: true,
      deadCodeInjectionThreshold: 0.4,
      debugProtection: false,
      disableConsoleOutput: false,
      identifierNamesGenerator: 'hexadecimal',
      renameGlobals: false,
      rotateStringArray: true,
      selfDefending: false,
      stringArray: true,
      stringArrayEncoding: ['base64'],
      stringArrayThreshold: 0.75,
      transformObjectKeys: true,
      unicodeEscapeSequence: false,
    });
    fs.writeFileSync(filePath, result.getObfuscatedCode(), 'utf8');
    console.log(`  ✓ Obfuscated: ${path.relative(buildDir, filePath)}`);
  } catch (e) {
    console.log(`  ✗ Skipped (${path.relative(buildDir, filePath)}): small file`);
  }
}

function walkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'cache' || entry.name === 'media') continue;
      walkDir(fullPath);
    } else if (entry.isFile()) {
      obfuscateFile(fullPath);
    }
  }
}

console.log('Obfuscating build output...');
walkDir(buildDir);
console.log('Done!');
