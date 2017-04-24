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
};

driver.onError = function (error) {
  console.log('Driver failed. Error:', error);
};


/**
 * Pre-seed the db with 100k IPs.
 */
let seeds         = [];
let generateSeeds = function () {

  let numberOfSeeds       = 100000;

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


  for (let seedCounter = 0; seedCounter < numberOfSeeds; seedCounter++) {
    let seed     = {};
    seed.address = generateRandomIp();

    seeds.push(seed);

    // mini report
    if ((seedCounter > 0) && (seedCounter % 10000 === 0)) {
      console.log('mini report:', seedCounter, seed.address);
    }

  }

};
generateSeeds();


let seedDb = function () {
// set up a streaming session for hitting Neo4j db
  let session = driver.session();

  let address = seeds[0].address;

  session

    .run('MERGE (a:Address {address:{addressParam}}) RETURN a', {addressParam: address})

    .subscribe({

      onNext: (record) => {
        console.log('record._fields:', record._fields);
      },

      onCompleted: () => {

        seeds.shift();

        if (seeds.length > 0) {
          seedDb();
        } else {
          session.close();
          driver.close();   // ?best place for this?
        }

      },

      onError: (error) => {
        console.log('Session - error:', error);
      }


    });
};

seedDb();
