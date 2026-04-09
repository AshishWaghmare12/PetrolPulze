const fs = require('fs/promises');
const path = require('path');

const dataPath = path.join(__dirname, '../../data/petrolPumps.json');

const readJson = async () => {
  try {
    const data = await fs.readFile(dataPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
};

module.exports = readJson;
