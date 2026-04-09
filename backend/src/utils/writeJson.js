const fs = require('fs/promises');
const path = require('path');

const dataPath = path.join(__dirname, '../../data/petrolPumps.json');

const writeJson = async (data) => {
  try {
    // Ensure the directory exists
    await fs.mkdir(path.dirname(dataPath), { recursive: true });
    await fs.writeFile(dataPath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    throw error;
  }
};

module.exports = writeJson;
