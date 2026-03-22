const app = require('./app');

const sequelize = require('./config/database');
require('./models'); // Load associations

const { initSocket } = require('./socket');
const { initCron } = require('./utils/auctionCron');
const { initDataRetention } = require('./utils/dataRetention');
const http = require('http');

// BR-07: Set default timezone to GMT+7
process.env.TZ = 'Asia/Ho_Chi_Minh';

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
initSocket(server);
initCron();
initDataRetention();

// SYNC DATABASE (Use { alter: true } ONLY when changing the schema, then turn off)
sequelize.sync({ alter: false }).then(() => {
  console.log('Database synced successfully');
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
    console.log(`Local Access: http://127.0.0.1:${PORT}`);
  });
}).catch(err => {
  console.error('Unable to sync database:', err);
});
