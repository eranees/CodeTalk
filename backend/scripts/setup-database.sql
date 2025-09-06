-- Create database for CodeTalk
CREATE DATABASE code_talk_db;

-- Connect to the database
\c code_talk_db;

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- The tables will be created automatically by TypeORM when the application starts
-- with TYPEORM_SYNCHRONIZE=true in the .env file

-- You can also manually create the tables if needed:
/*
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR UNIQUE NOT NULL,
    socketId VARCHAR,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR UNIQUE NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_groups (
    userId UUID REFERENCES users(id) ON DELETE CASCADE,
    groupId UUID REFERENCES groups(id) ON DELETE CASCADE,
    PRIMARY KEY (userId, groupId)
);

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message TEXT NOT NULL,
    username VARCHAR NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    groupCode VARCHAR NOT NULL,
    userId UUID REFERENCES users(id) ON DELETE CASCADE,
    groupId UUID REFERENCES groups(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_messages_group_id ON messages(groupId);
CREATE INDEX idx_messages_timestamp ON messages(timestamp);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_groups_code ON groups(code);
*/
