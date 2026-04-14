const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Turf = require('../src/models/turfModel');

const DEFAULT_AVAILABILITY = [
  { day: 'Monday', open: '08:00', close: '22:00' },
  { day: 'Tuesday', open: '08:00', close: '22:00' },
  { day: 'Wednesday', open: '08:00', close: '22:00' },
  { day: 'Thursday', open: '08:00', close: '22:00' },
  { day: 'Friday', open: '08:00', close: '22:00' },
  { day: 'Saturday', open: '08:00', close: '22:00' },
  { day: 'Sunday', open: '08:00', close: '22:00' },
];

async function normalize() {
  try {
    console.log('Connecting to DB...');
    await mongoose.connect(process.env.DB_CONNECTION_LINK);
    console.log('Connected.');

    const turfs = await Turf.find();
    console.log(`Found ${turfs.length} turfs.`);

    for (const turf of turfs) {
      console.log(`Checking turf: ${turf.name}`);
      
      if (!turf.availability || turf.availability.length === 0) {
        console.log(`  -> Adding default availability to ${turf.name}`);
        turf.availability = DEFAULT_AVAILABILITY;
      } else {
        // Standardize day names
        turf.availability.forEach(a => {
           if (a.day) {
             a.day = a.day.charAt(0).toUpperCase() + a.day.slice(1).toLowerCase().trim();
           }
        });
      }

      await turf.save();
    }

    console.log('Normalization complete.');
    process.exit(0);
  } catch (err) {
    console.error('Error during normalization:', err);
    process.exit(1);
  }
}

normalize();
