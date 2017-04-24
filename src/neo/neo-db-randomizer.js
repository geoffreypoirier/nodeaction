/**
 * Created by geoffrey on 4/24/17.
 */


let neo4j = require('neo4j-driver').v1;

// move proper UN/PW to Environment vars or config file
let un = 'neo4j';
let pw = 'password';


// define the bolt driver and set up messages for pass/fail on connection
let driver = neo4j.driver('bolt://localhost/', neo4j.auth.basic(un, pw));

driver.onCompleted = function () {
  console.log('Driver working.');
  console.log('Randomly adding and removing nodes.');
};

driver.onError = function (error) {
  console.log('Driver failed. Error:', error);
};


/**
 * Helpers
 */
let randomIp = function () {
  return Math.floor(Math.random() * 255);
};

let generateRandomIp = function () {
  return result = '' + randomIp() + '.' + randomIp() + '.' + randomIp();
};


/**
 * Generate Query Strings
 */
let genQueryString_getRandomNodes = function (limit) {
  return 'MATCH (a:Address) WHERE a.address CONTAINS \'' + randomIp() + '\' RETURN a LIMIT ' + limit;
};

let genQueryString_addNodes = function () {
  let queryString = 'WITH {_seeds} AS seeds';
  queryString += ' UNWIND seeds as seed';
  queryString += ' MERGE (source:Address { address: seed.address })';

  queryString += ' WITH source, seed.connections AS connections';
  queryString += ' UNWIND connections AS connection';
  queryString += ' MATCH (target:Address) WHERE target.address = connection';

  queryString += ' MERGE (source)-[:CONNECTS_TO]->(target)';

  return queryString;
};

let genQueryString_deleteNodes = function () {
  let queryString = 'WITH {_targets} AS targets';
  queryString += ' UNWIND targets AS target';
  queryString += ' MATCH (a:Address { address: target })';
  queryString += ' DETACH DELETE a';
  return queryString;
};


/****/


let generateSeeds = function (addresses) {

  let seeds = [];

  let numberOfSeeds       = 10;
  let numberOfConnections = 3;

  // helper
  let generateRandomConnections = function () {
    let result = [];
    for (let connectionsCounter = 0; connectionsCounter < numberOfConnections; connectionsCounter++) {
      let randomIndex       = Math.floor(Math.random() * addresses.length);
      let connectionAddress = addresses[randomIndex];
      result.push(connectionAddress);
    }
    return result;
  };


  for (let seedCounter = 0; seedCounter < numberOfSeeds; seedCounter++) {
    let seed         = {};
    seed.address     = generateRandomIp();
    seed.connections = generateRandomConnections();
    seeds.push(seed);
  }

  return seeds;

};


/**
 * add some random nodes - 10 at a time with 3 connections each
 */

let addRandomNodes = function () {
  let session = driver.session();

  session

  // get random nodes
    .run(genQueryString_getRandomNodes(100))


    // generate some seeds with connections from the results
    .then((result) => {

      let rawSeeds = [];

      result.records.forEach(function (record) {
        rawSeeds.push(record._fields[0].properties.address);
      });

      return generateSeeds(rawSeeds);

    })

    // add new seeds to db
    .then((_seeds) => {
      return session.run(genQueryString_addNodes(), {_seeds})
    })


    .then((result) => {
      console.log(result);

      session.close();

    })


    .catch((error) => {
      console.log('error:', error);
    })
};


/**
 * Delete some nodes.
 */

let deleteRandomNodes = function () {
  let session = driver.session();

  session

  // get random nodes
    .run(genQueryString_getRandomNodes(5))


    // organize nodes to delete
    .then((result) => {

      let _targets = [];

      result.records.forEach(function (record) {
        _targets.push(record._fields[0].properties.address);
      });

      return session.run(genQueryString_deleteNodes(), {_targets})

    })


    .then((result) => {
      console.log(result);

      session.close();

    })


    .catch((error) => {
      console.log('error:', error);
    })
};


/**
 * Timers to add and remove nodes.
 */

// every 5 seconds add 10 new random nodes
setInterval(addRandomNodes, 5000);

// every 10 seconds delete 5 random nodes
setInterval(deleteRandomNodes, 10000);
