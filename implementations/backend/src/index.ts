import 'dotenv/config';
import app from './app';
import { prisma } from './lib/prisma';

const PORT = Number.parseInt(process.env.PORT ?? '4000', 10);

const server = app.listen(PORT, () => {
  process.stdout.write(`Server running on port ${PORT}\n`);
});

process.on('SIGTERM', () => {
  server.close(() => {
    prisma.$disconnect().catch(() => undefined);
  });
});
