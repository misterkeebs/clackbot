const RedeemableCode = require('./src/models/RedeemableCode');

const param = process.argv.slice(2)[0];
if (param === '--reset') {
  const knex = require('./src/config/db');
  knex.raw('TRUNCATE redeemable_codes RESTART IDENTITY CASCADE').then(_ => {
    console.log('Redeemable codes were reset.');
    process.exit(0);
  });
  return;
}
const num = parseInt(param, 10);
if (isNaN(num)) {
  console.log('use: node gencodes.js <num>');
  process.exit(1);
}
RedeemableCode.generate(num).then(codes => {
  codes.forEach(c => console.log(c));
  process.exit(0);
}).catch(err => {
  console.log('Error generating codes', err);
  process.exit(1);
});
