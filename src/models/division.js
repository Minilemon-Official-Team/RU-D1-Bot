const mongoose = require('mongoose');

const divisionSchema = mongoose.Schema(
  {
    _id: {
      type: String,
    },
    name: {
      type: String,
      required: true,
    },
  },
  { _id: false },
);

const Division = mongoose.model('Division', divisionSchema);

module.exports = Division;
