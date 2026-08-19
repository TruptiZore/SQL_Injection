-- Database Setup for SQL Injection Demo
-- Run this script in your MySQL client to create the database and table.

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS security_IDS;

-- Use the newly created database
USE security_IDS;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- Clear the table first to avoid duplicate entries if run multiple times
TRUNCATE TABLE users;

-- Insert a sample user
INSERT INTO users (username, password) VALUES ('admin', '1234');
