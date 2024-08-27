const mongoose = require('mongoose');
const Location = require('./models/location'); // Adjust path as necessary

mongoose.connect('mongodb://localhost:27017/yourdb', { useNewUrlParser: true, useUnifiedTopology: true });

const testLocation = new Location({
  name: 'HQ',
  coordinates: {
    type: 'Point',
    coordinates: [77.5945627, 12.9715987] // Ensure correct format
  }
});

testLocation.save()
  .then(() => console.log('Test location saved'))
  .catch(err => console.error('Error saving test location:', err))
  .finally(() => mongoose.disconnect());
