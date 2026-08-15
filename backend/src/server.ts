import app from './app';
import { config, prisma } from './config';

const startServer = async () => {
  try {
    const port = Number(process.env.PORT) || config.port || 5000;

    const server = app.listen(port, '0.0.0.0', () => {
      console.log(`🚀 Heliosync Platform Backend running on port ${port}`);
      console.log(`📍 API Health: http://0.0.0.0:${port}/api/health`);
    });

    // Connect to MongoDB Database
    prisma.$connect()
      .then(() => {
        console.log('✅ MongoDB Database connected via Prisma');
      })
      .catch((err) => {
        console.error('❌ MongoDB Connection Error. Please verify your DATABASE_URL environment variable and MongoDB Atlas IP Whitelist (0.0.0.0/0):', err);
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
