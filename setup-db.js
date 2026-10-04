const mysql = require('mysql2/promise');
require('dotenv').config();

const sqlQueries = `
CREATE TABLE IF NOT EXISTS users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS education_levels (
  edu_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS profiles (
  user_id INT PRIMARY KEY,
  edu_id INT NULL,
  field VARCHAR(100) NULL,
  career_goal TEXT NULL,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (edu_id) REFERENCES education_levels(edu_id)
);

CREATE TABLE IF NOT EXISTS skills (
  skill_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS interests (
  interest_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS user_skills (
  user_id INT,
  skill_id INT,
  PRIMARY KEY (user_id, skill_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (skill_id) REFERENCES skills(skill_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_interests (
  user_id INT,
  interest_id INT,
  PRIMARY KEY (user_id, interest_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (interest_id) REFERENCES interests(interest_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS careers (
  career_id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(100) NOT NULL UNIQUE,
  title VARCHAR(150) NOT NULL,
  icon VARCHAR(50),
  description TEXT
);

CREATE TABLE IF NOT EXISTS career_skills (
  career_id INT,
  skill_id INT,
  PRIMARY KEY (career_id, skill_id),
  FOREIGN KEY (career_id) REFERENCES careers(career_id) ON DELETE CASCADE,
  FOREIGN KEY (skill_id) REFERENCES skills(skill_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS career_interests (
  career_id INT,
  interest_id INT,
  PRIMARY KEY (career_id, interest_id),
  FOREIGN KEY (career_id) REFERENCES careers(career_id) ON DELETE CASCADE,
  FOREIGN KEY (interest_id) REFERENCES interests(interest_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS roadmap_steps (
  step_id INT AUTO_INCREMENT PRIMARY KEY,
  career_id INT,
  step_no INT,
  description TEXT,
  FOREIGN KEY (career_id) REFERENCES careers(career_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS resources (
  resource_id INT AUTO_INCREMENT PRIMARY KEY,
  career_id INT,
  name VARCHAR(255),
  FOREIGN KEY (career_id) REFERENCES careers(career_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS recommendation_runs (
  run_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS recommendation_items (
  run_id INT,
  career_id INT,
  rank_no INT,
  score INT,
  PRIMARY KEY (run_id, career_id),
  FOREIGN KEY (run_id) REFERENCES recommendation_runs(run_id) ON DELETE CASCADE,
  FOREIGN KEY (career_id) REFERENCES careers(career_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_progress (
  user_id INT,
  step_id INT,
  PRIMARY KEY (user_id, step_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (step_id) REFERENCES roadmap_steps(step_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS chat_messages (
  msg_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  role ENUM('user', 'assistant') NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
`;

async function runSchema() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'mysql-1ef68470-saba31821-1b72.c.aivencloud.com',
      port: Number(process.env.DB_PORT) || 23405,
      user: process.env.DB_USER || 'avnadmin',
      password: process.env.DB_PASS,
      database: process.env.DB_NAME || 'defaultdb',
      multipleStatements: true,
      ssl: { rejectUnauthorized: false }
    });

    await connection.query(sqlQueries);
    console.log('SUCCESS: All tables created successfully!');
    await connection.end();
  } catch (err) {
    console.error('ERROR:', err.message);
  }
}

runSchema();