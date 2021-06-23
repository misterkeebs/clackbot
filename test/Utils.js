const fs = require('fs');

const readFixture = name => {
  const file = `test/fixtures/${name}.json`;
  return JSON.parse(fs.readFileSync(file, 'utf8'));
};

module.exports = { readFixture };
