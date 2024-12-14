#! /user/bin/env node

const { Client } = require("pg");

const main = async () => {
  const connectionString = process.argv[2];

  const client = new Client({
    connectionString: connectionString,
  });

  console.log("Connecting to the database ...");
  await client.connect();

  // await client.query(); send your sql query

  await client.end();
  console.log("done");
};

main();
