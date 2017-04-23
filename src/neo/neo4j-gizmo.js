/**
 * Created by geoffrey on 4/22/17.
 *
 * Best source of info so far: https://www.npmjs.com/package/neo4j-driver.
 *  - has a subscription example
 *
 * Example here not so dreamy: https://neo4j.com/developer/javascript/
 *
 */


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


// set up a *streaming* "session" for hitting Neo4j db
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
//.run('CREATE (p:Person {name:\'Chesterfield\'})')
//.then(() => {
//  return session.run('MATCH (p:Person) WHERE toLower(p.name) CONTAINS toLower({name}) RETURN p', {name: 'charlie'})
//})
//.then((result) => {
//  console.log('result:', result);
//  session.close();
//  driver.close();
//});
