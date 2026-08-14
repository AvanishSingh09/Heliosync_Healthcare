import app from './app';
import { config, prisma } from './config';

const startServer = async () => {
  try {
    // Verify DB Connection
    await prisma.$connect();
    console.log('✅ MongoDB Database connected via Prisma');

    const server = app.listen(config.port, () => {
      console.log(`🚀 Heliosync Platform Backend running on http://localhost:${config.port}`);
      console.log(`📍 API Health: http://localhost:${config.port}/api/health`);
    });

    const shutdown = async () => {
      console.log('Gracefully stopping server...');
      server.close(async () => {
        await prisma.$disconnect();
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
