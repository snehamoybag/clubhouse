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
    about VARCHAR(255)
  );

  CREATE TABLE IF NOT EXISTS posts(
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    message TEXT,
    date TIMESTAMP
  );
 
  CREATE TABlE IF NOT EXISTS members_of_clubs(
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    club_id INTEGER UNIQUE,
    member_id INTEGER UNIQUE,
    member_status VARCHAR(20),
    FOREIGN KEY(club_id) REFERENCES clubs(id),
    FOREIGN KEY(member_id) REFERENCES users(id)
  );

  CREATE TABLE posts_of_users(
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id INTEGER UNIQUE,
    post_id INTEGER UNIQUE,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(post_id) REFERENCES posts(id)
  );

  CREATE TABLE posts_in_clubs(
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    club_id INTEGER UNIQUE,
    post_id INTEGER UNIQUE,
    FOREIGN KEY(club_id) REFERENCES clubs(id),
    FOREIGN KEY(post_id) REFERENCES posts(id)
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
