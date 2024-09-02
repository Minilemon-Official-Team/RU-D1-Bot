const divisionService = require('../services/division');

const ensureDivisionExists = async (division) => {
  try {
    const divisionExists = await divisionService.getDivisionById(division.id);

    if (!divisionExists) {
      await divisionService.addDivision({ id: division.id, name: division.name });
    } else if (divisionExists.name !== division.name) {
      await divisionService.updateDivisionById(division.id, { name: division.name });
    }

    return true;
  } catch (error) {
    logger.error(error, 'Error ensuring division existence');
    throw error;
  }
};

module.exports = { ensureDivisionExists };
