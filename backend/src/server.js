const app = require('./app');

const sequelize = require('./config/database');
require('./models'); // Load associations

const { initSocket } = require('./socket');
const { initCron } = require('./utils/auctionCron');
const http = require('http');

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
initSocket(server);
initCron();

sequelize.sync({ alter: true }).then(() => {
  console.log('Database synced successfully');
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Unable to sync database:', err);
});
