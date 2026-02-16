const bcrypt = require('bcryptjs');

const password = 'Asn@6002';
const hash = bcrypt.hashSync(password, 10);

console.log('\n=== Admin Password Hash ===');
console.log('Password:', password);
console.log('Hash:', hash);
console.log('\nAdd this to your .env file:');
console.log(`ADMIN_PASSWORD_HASH=${hash}`);
