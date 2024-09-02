const Division = require('../models/division');
const logger = require('../utils/logger');

const addDivision = async ({ id, name }) => {
  try {
    const division = new Division({ _id: id, name });
    division.save();
    return division;
  } catch (error) {
    logger.error(error, 'Error adding division');
    throw error;
  }
};

const getDivisionById = async (id) => {
  try {
    const division = await Division.findById(id);
    return division;
  } catch (error) {
    logger.error(error, 'Error getting division');
    throw error;
  }
};

const updateDivisionById = async (id, updateData) => {
  try {
    const updatedDivision = await Division.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
    return updatedDivision;
  } catch (error) {
    logger.error(error, 'Error updating division');
    throw error;
  }
};

module.exports = { addDivision, getDivisionById, updateDivisionById };
