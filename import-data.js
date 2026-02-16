const supabase = require('./src/supabase');
const seedData = require('./seed-data.json');

async function importData() {
  console.log('Starting data import...');
  
  try {
    const { data, error } = await supabase
      .from('emergency_contacts')
      .insert(seedData);
    
    if (error) throw error;
    
    console.log(`✓ Successfully imported ${seedData.length} emergency contacts`);
  } catch (error) {
    console.error('Error importing data:', error.message);
  }
}

importData();
