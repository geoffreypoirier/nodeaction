/**
 * Created by geoffrey on 4/22/17.
 *
 * Best source of info so far: https://www.npmjs.com/package/neo4j-driver.
 *  - has a subscription example
 *
 * Example here not so dreamy: https://neo4j.com/developer/javascript/
 *
 */


/*
 NOTES
 1) Watch for integers with neo4j.
 - example: session.run("CREATE (n {age: {myIntParam}})", {myIntParam: neo4j.int(22)});
 */


let _     = require('lodash');
let neo4j = require('neo4j-driver').v1;


// ?db not referenced by name?
//let dbName = 'early-test.graphdb';


// move proper UN/PW to Environment vars or config file
let un = 'neo4j';
let pw = 'password';


// define the bolt driver and set up messages for pass/fail on connection
let driver = neo4j.driver('bolt://localhost/', neo4j.auth.basic(un, pw));

driver.onCompleted = function () {
  console.log('Driver working.');
};

driver.onError = function (error) {
  console.log('Driver failed. Error:', error);
};


/**
 * Pre-seed the db with 100k IPs and Domains with random connections.
 */
let seeds               = [];
let numberOfSeeds       = 100000;
let numberOfConnections = 10;


let randomIp = function () {
  return Math.floor(Math.random() * 255);
};

let generateRandomIp = function () {
  let result = '' + randomIp() + '.' + randomIp() + '.' + randomIp();

  // check for dupe
  if (_.includes(seeds, {'address': result})) {
    console.log('Wow! Dupe found.', seeds.length);
    return generateRandomIp();
  } else {
    return result;
  }

};


let generateRandomConnections = function () {

  let result = [];

  for (let connectionsCounter = 0; connectionsCounter < numberOfConnections; connectionsCounter++) {
    let randomIndex       = Math.floor(Math.random() * seeds.length);
    let connectionAddress = seeds[randomIndex].address;
    result.push(connectionAddress);
  }

  return result;

};


for (let seedCounter = 0; seedCounter < numberOfSeeds; seedCounter++) {
  let seed         = {};
  seed.address     = generateRandomIp();
  seed.connections = [];

  // note: does not check for self reference or dupes
  if (seedCounter > (numberOfConnections * 25)) {
    seed.connections = generateRandomConnections();
  }

  seeds.push(seed);


  // mini report
  if ((seedCounter > 0) && (seedCounter % 1000 === 0)) {
    console.log('mini report:', seedCounter, seed.address, seed.connections.toString());
  }

}


// set up a *streaming* session for hitting Neo4j db
let session = driver.session();

session

  .run('MERGE (p:Person {name:{nameParam}}) RETURN p', {nameParam: 'Chesterfield'})

  .subscribe({

    onNext: (record) => {
      console.log('record._fields:', record._fields);
    },

    onCompleted: () => {
      session.close();
      driver.close();   // ?best place for this?
    },

    onError: (error) => {
      console.log('Session - error:', error);
    }


  });


// The `Promise` way. (working example)
//session
//.run('MERGE (p:Person {name:{nameParam}}) RETURN p', {nameParam: 'Chesterfield'})
//.then(() => {
//  return session.run('MATCH (p:Person) WHERE toLower(p.name) CONTAINS toLower({name}) RETURN p', {name: 'charlie'})
//})
//.then((result) => {
//  console.log('result:', result);
//  session.close();
//  driver.close();
//});
