/**
 * Created by geoffrey on 4/21/17.
 */

let _       = require('lodash');
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

let genQueryString_getNode = function (_address, _depth) {

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


// ship something back to show it works
router.get('/', (req, res, next) => {
  res.send('Express working.')
});


router.post('/nodes', (req, res, next) => {

  let session = driver.session();

  session

  // get random nodes
    .run(genQueryString_getNode(req.body.coreAddress, req.body.depth))


    .then((result) => {

      // each record is a path based on `depth`

      // unroll the data: organize nodes and links

      let records = result.records;

      let _nodes = [];

      for (let recordCounter = 0; recordCounter < records.length; recordCounter++) {

        let fields = records[recordCounter]._fields;

        console.log('\n ---');
        console.log('records.length:', records.length);
        console.log('_nodes.length:', _nodes.length);


        for (let fieldsCounter = 0; fieldsCounter < fields.length; fieldsCounter++) {
          let address = fields[fieldsCounter].properties.address;

          let n = {value: address, links: []};

          let dupe = _.includes(_nodes, n.value);
          let _i = _.indexOf(_nodes["value"], n.value);

          console.log('n.value:', n.value);

          if (_nodes.length > 0) {

            console.log('_nodes[0].value:', _nodes[0].value);
          }

          console.log('dupe:', dupe);
          console.log('_i:', _i);



          // if no node exists in nodes, add it
          if (dupe) {

            console.log('dupe:', n);


          } else {


            console.log('original:', n);

            _nodes.push(n);


          }


        }

      }

      console.log('_nodes.length:', _nodes.length);


      console.log(_nodes);

      res.send(JSON.stringify(_nodes));

      session.close();

    })

    .catch((error) => {
      console.log('error:', error);
    })


});


module.exports = router;
