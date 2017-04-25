/**
 * Created by geoffrey on 4/21/17.
 */

let express = require('express');
let router  = express.Router();

/** **/

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
 * Generate Query Strings
 */

// working example:
// MATCH (source:Address { address:"107.100.76"})-[:CONNECTS_TO]->(target1:Address)-[:CONNECTS_TO]->(target2:Address)
// RETURN source, target1, target2

let genQueryString_getNode = function (_address, _depth, _limit) {

  let qs = 'MATCH (source:Address { address:"' + _address + '"})';

  for (let depthCounter = 0; depthCounter < _depth; depthCounter++) {
    qs += '-[:CONNECTS_TO]->(target' + depthCounter + ':Address)';
  }

  qs += ' RETURN source';

  for (let depthCounter = 0; depthCounter < _depth; depthCounter++) {
    qs += ', target' + depthCounter;
  }

  return qs;

};


let getNodes = function (body) {
  let session = driver.session();

  session

  // get random nodes
    .run(genQueryString_getNode(100, 5, 25))


    //
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


// ship something back to show it works
router.get('/', (req, res, next) => {
  res.send('Express working.')
});


router.post('/nodes', (req, res, next) => {

  let session = driver.session();

  session

  // get random nodes
    .run(genQueryString_getNode(req.body.coreAddress, req.body.depth, req.body.limit))


    .then((result) => {

      console.log(result);

      res.send(result);

      session.close();

    })

    .catch((error) => {
      console.log('error:', error);
    })


});


module.exports = router;
