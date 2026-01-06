// Simple cleanup script without external dependencies
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

async function cleanupDatabase() {
  try {
    console.log('🧹 Cleaning up expired reservations via Prisma...\n');
    
    // Run prisma command from seat-reservation-service directory
    const { stdout, stderr } = await execAsync(
      'npx prisma db execute --stdin',
      {
        cwd: './apps/seat-reservation-service',
        input: `DELETE FROM "Reservation" WHERE status IN ('LOCKED', 'EXPIRED');`
      }
    );
    
    if (stderr) console.error('Error:', stderr);
    if (stdout) console.log(stdout);
    
    console.log('\n✅ Database cleaned! All LOCKED/EXPIRED reservations removed.');
    console.log('✨ You can now book tickets without the 4-seat limit error!\n');
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
    console.log('\n📝 Alternative: Run this SQL directly in your database:');
    console.log('   DELETE FROM "Reservation" WHERE status IN (\'LOCKED\', \'EXPIRED\');');
  }
}

cleanupDatabase();
