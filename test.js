/* eslint-disable no-console */
require('dotenv').config();
const ClackSpawner = require('./src/ClackSpawner');
const spawner = new ClackSpawner();

async function main() {
  await spawner.notify();
}

main().then(_ => {
  console.log('All done.');
}).catch(err => {
  console.error('Error', err);
});
