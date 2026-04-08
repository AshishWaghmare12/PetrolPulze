require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const { sequelize, Station, User } = require('../models');
const { generateRealMaharashtraStations } = require('./maharashtraStations');

const runSeed = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database');

    await sequelize.sync({ force: true });
    console.log('✅ Tables recreated');

    const admin = await User.create({
      name: 'PetrolPulze Admin',
      email: 'admin@petrolpulze.com',
      password: 'Admin@12345',
      role: 'admin',
    });
    console.log(`✅ Admin user created: ${admin.email}`);

    await User.create({
      name: 'Test User',
      email: 'test@petrolpulze.com',
      password: 'Test@12345',
      role: 'user',
    });
    console.log('✅ Test user created');

    const stations = generateRealMaharashtraStations();
    
    console.log(`\n📊 Seeding ${stations.length} real Maharashtra stations...`);
    
    const BATCH = 100;
    let created = 0;
    for (let i = 0; i < stations.length; i += BATCH) {
      const batch = stations.slice(i, i + BATCH);
      await Station.bulkCreate(batch, { validate: true });
      created += batch.length;
      console.log(`   Seeded ${created}/${stations.length} stations`);
    }

    console.log('\n🎉 Seed complete!');
    console.log('   Admin: admin@petrolpulze.com / Admin@12345');
    console.log('   Test:  test@petrolpulze.com / Test@12345');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
};

runSeed();
