const fs = require('fs');
const path = require('path');

const postcssPath = path.join(__dirname, '..', 'node_modules', 'postcss');
if (!fs.existsSync(postcssPath)) {
  console.warn('Warning: postcss is not installed. Run `npm install` before building.');
}
