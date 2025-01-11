#! /user/bin/env node
require("dotenv").config();
const { Client } = require("pg");

const query = `
  CREATE TABLE IF NOT EXISTS users(
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    first_name VARCHAR(35),
    last_name VARCHAR(35),
    email VARCHAR(320) UNIQUE,
    password VARCHAR(255)
  );
  
  CREATE TABLE IF NOT EXISTS clubs(
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name VARCHAR(128) UNIQUE,
    about VARCHAR(255),
    privacy VARCHAR(20)
  );

  CREATE TABLE IF NOT EXISTS posts(
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    message VARCHAR(2000),
    date TIMESTAMP
  );
 
  CREATE TABlE IF NOT EXISTS members_of_clubs(
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    club_id INTEGER,
    member_id INTEGER,
    member_role VARCHAR(10),
    joining_date TIMESTAMP,
    FOREIGN KEY(club_id) REFERENCES clubs(id),
    FOREIGN KEY(member_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS posts_of_users(
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    post_id INTEGER UNIQUE,
    user_id INTEGER,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(post_id) REFERENCES posts(id)
  );

  CREATE TABLE IF NOT EXISTS posts_in_clubs(
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    post_id INTEGER UNIQUE,
    club_id INTEGER,
    FOREIGN KEY(club_id) REFERENCES clubs(id),
    FOREIGN KEY(post_id) REFERENCES posts(id)
  )

  CREATE TABLE IF NOT EXISTS clubs_join_requests (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id INTEGER,
    club_id INTEGER,
    date TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(club_id) REFERENCES clubs(id)
  )

  CREATE TABLE IF NOT EXISTS users_notifications (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id INTEGER,
    message VARCHAR(255),
    link VARCHAR(255),
    is_read BOOLEAN,
    date TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )
`;

const main = async () => {
  const connectionString = process.argv[2];

  const client = new Client({
    connectionString: connectionString,
  });

  console.log("Connecting to the database ...");
  await client.connect();

  console.log("Seeding ...");
  await client.query(query);

  await client.end();
  console.log("done");
};

main();
