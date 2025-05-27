const axios = require('axios');

const NUMBER_OF_CLIENTS = 1;
const VOTE_ENDPOINT = 'http://localhost:3001/api/vote'; // Thay đổi nếu route khác
const roomId = '665ef97e1b3e04abcde12345'; // Thay bằng _id thật của room trong MongoDB
const optionId = '665ef9c31b3e04abcde67890'; // Thay bằng _id thật của option trong MongoDB

async function simulateClient(clientId) {
  try {
    const res = await axios.post(VOTE_ENDPOINT, {
      userId: `user${clientId}`,
      roomId: roomId,
      optionId: optionId
    });
    console.log(`Client ${clientId} voted:`, res.data);
  } catch (err) {
    console.error(`Client ${clientId} failed:`, err.response?.data || err.message);
  }
}

async function main() {
  const promises = [];
  for (let i = 1; i <= NUMBER_OF_CLIENTS; i++) {
    promises.push(simulateClient(i));
  }
  await Promise.all(promises);
  console.log('All clients have voted.');
}

main();
