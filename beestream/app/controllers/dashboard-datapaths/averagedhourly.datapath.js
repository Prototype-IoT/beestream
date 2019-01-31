const mongoose = require('mongoose');
const AverageTrafficByHour = mongoose.model('AverageTrafficByHour');
const Audio_AverageHourly = mongoose.model('Audio_AverageHourly');
const utils = require('./datapath-utils.js');

module.exports = {
  name: 'byhour',
  aggregateMethod: ' Averaged Hourly',
  threshold: 12,
  query: async function(viewQuerySelection, hives, startDate, stopDate, callback) {
    utils.queryFromView(AverageTrafficByHour, Audio_AverageHourly,
        hives, startDate, stopDate, viewQuerySelection, callback, ' Averaged Hourly');
  }
}
