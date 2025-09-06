import { DataSource } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { GroupEntity } from '../entities/group.entity';
import { MessageEntity } from '../entities/message.entity';
import dotenv from 'dotenv';
import logger from './logger';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'secret',
  database: process.env.DB_NAME || 'code_talk_db',
  synchronize: process.env.TYPEORM_SYNCHRONIZE === 'true',
  logging: process.env.TYPEORM_LOGGING === 'true',
  entities: [UserEntity, GroupEntity, MessageEntity],
  migrations: ['src/migrations/*.ts'],
  subscribers: ['src/subscriber/*.ts'],
});

export const initializeDatabase = async (): Promise<void> => {
  try {
    await AppDataSource.initialize();
    logger.info('✅ Database connection established successfully');
  } catch (error) {
    logger.error('❌ Error during database initialization:', error);
    throw error;
  }
};
