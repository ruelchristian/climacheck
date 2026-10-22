// Utility: generate a bcrypt hash for seeding an account manually.
// Usage: node backend/database/hash_password.js "YourPassword123"
const bcrypt = require('bcryptjs');

const plain = process.argv[2];
if (!plain) {
  console.log('Usage: node hash_password.js "YourPassword"');
  process.exit(1);
}

bcrypt.hash(plain, 10).then((hash) => {
  console.log('Bcrypt hash:');
  console.log(hash);
});
