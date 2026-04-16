import http from 'http';
import config from './config/index.js';
import connectDB from './config/db.js';
import setupSocket from './config/socket.js';
import { createApp } from './app.js';

const start = async () => {
  await connectDB();

  const app = createApp();
  const server = http.createServer(app);
  const io = setupSocket(server);
  app.set('io', io);

  server.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
  });
};

start();
