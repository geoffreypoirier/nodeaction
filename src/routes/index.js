/**
 * Created by geoffrey on 4/21/17.
 */

// lodash not working
//let _       = require('lodash');

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

      let nodes = [];

      for (let recordCounter = 0; recordCounter < records.length; recordCounter++) {

        let fields = records[recordCounter]._fields;

        console.log('\n ---');
        console.log('records.length:', records.length);
        console.log('nodes.length:', nodes.length);


        for (let fieldsCounter = 0; fieldsCounter < fields.length; fieldsCounter++) {
          let address = fields[fieldsCounter].properties.address;

          let n = {value: address, links: []};

          // ?lodash isn't working for me here?

          let _findIndex = function (_value) {
            let _result = -1;
            for (let nodesCounter = 0; nodesCounter < nodes.length; nodesCounter++) {
              let node = nodes[nodesCounter];
              if (node.value === _value) {
                _result = nodesCounter;
                break;
              }
            }
            return _result;
          };

          let nodeIndex = _findIndex(n.value);

          // if unique, add it
          nodeIndex === -1 ? nodes.push(n) : null;


          // get parent data if not root of the graph path (?phrasing?)
          if ((fieldsCounter > 0) && ( nodeIndex > -1)) {

            let parentIndex   = _findIndex(fields[fieldsCounter - 1].properties.address);
            let parentAddress = fields[fieldsCounter - 1].properties.address;


            // ?again, would prefer lodash which didn't work?


            // if link unique, add it

            let _findParentLinkIndex = function (_parentAddress) {

              let _result = -1;

              for (let linksCounter = 0; linksCounter < nodes[nodeIndex].links.length; linksCounter++) {
                let link = nodes[nodeIndex].links[linksCounter];

                console.log('link:', link);
                console.log('_parentAddress:', _parentAddress);


                if (link === _parentAddress) {
                  _result = linksCounter;
                  break;
                }
              }

              return _result;
            };


            if (_findParentLinkIndex(parentAddress) === -1) {

              nodes[nodeIndex].links.push(parentAddress);

            }

          }


        }

      }

      console.log('nodes.length:', nodes.length);

      res.send(JSON.stringify(nodes));

      session.close();

    })

    .catch((error) => {
      console.log('error:', error);
    })


});


module.exports = router;
