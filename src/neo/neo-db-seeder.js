/**
 * Created by geoffrey on 4/24/17.
 */
let _     = require('lodash');
let neo4j = require('neo4j-driver').v1;


// move proper UN/PW to Environment vars or config file
let un = 'neo4j';
let pw = 'password';


// define the bolt driver and set up messages for pass/fail on connection
let driver = neo4j.driver('bolt://localhost/', neo4j.auth.basic(un, pw));

driver.onCompleted = function () {
  console.log('Driver working.');
  console.log('Seeding DB. Appx 1 hour on MBP.');
};

driver.onError = function (error) {
  console.log('Driver failed. Error:', error);
};


/**
 * Pre-seed the db with 100k IPs and connections.
 */
let seeds         = [];
let generateSeeds = function () {

  let numberOfSeeds       = 110000;  // + 10%
  let numberOfConnections = 3;

  let randomIp = function () {
    return Math.floor(Math.random() * 255);
  };

  let generateRandomIp = function () {
    let result = '' + randomIp() + '.' + randomIp() + '.' + randomIp();

    // check for dupe
    if (_.includes(seeds, {'address': result})) {
      console.log('Whoa. Dupe found.', seeds.length);
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

    // does not check for self reference or dupes
    if (seedCounter > (numberOfConnections * 25)) {
      seed.connections = generateRandomConnections();
    }

    seeds.push(seed);

    // mini report
    if ((seedCounter > 0) && (seedCounter % 10000 === 0)) {
      console.log('mini report:', seedCounter, seed.address);
    }

  }

};
generateSeeds();


let queryString = 'WITH {_seeds} AS seeds';
queryString += ' UNWIND seeds as seed';
queryString += ' MERGE (source:Address { address: seed.address })';

queryString += ' WITH source, seed.connections AS connections';
queryString += ' UNWIND connections AS connection';
queryString += ' MATCH (target:Address) WHERE target.address = connection';

queryString += ' MERGE (source)-[:CONNECTS_TO]->(target)';

let seedDb = function () {

  // set up a streaming session for hitting Neo4j db
  let session = driver.session();

  // break into 1k chunks because throwing 100k at it looked like too much at one time
  let _seeds = seeds.slice(0, 1000);

  session

    .run(queryString, {_seeds})

    .subscribe({

      onNext: (record) => {

        console.log('seeds remaining:', seeds.length, ' - record._fields:', record._fields);

      },

      onCompleted: () => {

        seeds = _.slice(seeds, 1000);

        if (seeds.length > 0) {
          seedDb();
        } else {
          session.close();
          driver.close();   // ?best place for this?

          console.log('seeding complete');

        }

      },

      onError: (error) => {
        console.log('Session - error:', error);
      }


    });
};

seedDb();
