const fs = require('fs');
const path = require('path');

const postcssPath = path.join(__dirname, '..', 'node_modules', 'postcss');
const postcssCliPath = path.join(__dirname, '..', 'node_modules', 'postcss-cli');

if (!fs.existsSync(postcssPath) || !fs.existsSync(postcssCliPath)) {
  console.warn(
    'Warning: postcss or postcss-cli is missing. Run `npm install` before building.'
  );
}
