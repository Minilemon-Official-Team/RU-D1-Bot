const pointService = require('../services/point');
const { ensureUserExists } = require('./user');

const addPoint = async ({ member, type, point, reason = null, addedBy, correct = false }) => {
  const MAX_TOTAL_POINTS = 20;
  const userId = member.user.id;

  await ensureUserExists(addedBy);
  await ensureUserExists(member);

  const { addPoints, minusPoints } = await pointService.getMonthlyPointsByUser(userId);

  if (type === 'add') {
    const availablePoints = MAX_TOTAL_POINTS - (addPoints + minusPoints);
    if (point > availablePoints && !correct) {
      throw new Error(`Poin yang diberikan melebihi batas maksimum.`);
    }
    return handleAddPoints({
      userId,
      point: Math.min(point, availablePoints),
      reason,
      addedBy,
    });
  } else if (type === 'minus') {
    const currentMonthlyPoints = addPoints - minusPoints;
    if (
      minusPoints >= MAX_TOTAL_POINTS &&
      currentMonthlyPoints < 0 &&
      minusPoints == MAX_TOTAL_POINTS &&
      !correct
    ) {
      throw new Error(`Poin minus yang diberikan melebihi batas maksimum.`);
    }

    const result = await handleMinusPoints({
      userId,
      point,
      reason,
      addedBy,
    });

    if (!correct && addPoint !== 0) {
      if (addPoints - point < 0) {
        point = addPoints;
      }

      await handleAddPoints({
        userId,
        point: -point,
        reason: `Pengurangan karena minus point: ${reason}`,
        addedBy,
      });
    }

    return result;
  } else {
    throw new Error('Tipe poin yang tidak dikenal.');
  }
};

const handleAddPoints = async ({ userId, point, reason, addedBy }) => {
  return await pointService.addPoint({
    user_id: userId,
    type: 'add',
    point,
    reason,
    added_by: addedBy.id,
  });
};

const handleMinusPoints = async ({ userId, point, reason, addedBy }) => {
  return await pointService.addPoint({
    user_id: userId,
    type: 'minus',
    point,
    reason,
    added_by: addedBy.id,
  });
};

const clearPoint = async ({ user_id }) => {
  try {
    const point = await pointService.getPointByUserId({ user_id });
    if (!point) {
      throw new Error('User belum mempunyai point sama sekali.');
    }
    await pointService.deletePointByUserId({ user_id });
  } catch (error) {
    throw new Error(error.message);
  }
};

const correctPoint = async ({ member, type, point, reason, addedBy }) => {
  const userId = member.user.id;
  const { addPoints, minusPoints } = await pointService.getMonthlyPointsByUser(userId);

  if (type === 'add') {
    if (addPoints + point < 0) {
      throw new Error(`Koreksi akan membuat add point menjadi negatif.`);
    }
  } else if (type === 'minus') {
    if (minusPoints + point < 0) {
      throw new Error(`Koreksi akan membuat minus point menjadi negatif.`);
    }
  } else {
    throw new Error('Tipe koreksi tidak valid.');
  }

  return await addPoint({
    member,
    type,
    point,
    reason: `Koreksi ${type}: ${reason}`,
    addedBy,
    correct: true,
  });
};

module.exports = { addPoint, clearPoint, correctPoint };
