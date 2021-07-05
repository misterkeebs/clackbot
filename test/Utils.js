const fs = require('fs');

const fixturePath = name => {
  return `test/fixtures/${name}`;
}

const readRawFixture = name => {
  return fs.readFileSync(fixturePath(name), 'utf8');
};

const readFixture = name => {
  return JSON.parse(readRawFixture(`${name}.json`));
};

module.exports = { fixturePath, readRawFixture, readFixture };
