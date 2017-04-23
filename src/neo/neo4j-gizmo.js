/**
 * Created by geoffrey on 4/22/17.
 */
let neo4j = require('neo4j-driver').v1;

let driver = neo4j.driver('bolt://localhost/', neo4j.auth.basic('neo4j', 'password'));

//early-test.graphdb

driver.onCompleted = function () {
  console.log('Driver working.');
};


driver.onError = function (error) {
  console.log('Driver instantiation failed - error:', error);
};


let session = driver.session();


session
//.run('MATCH (p:Person) WHERE toLower(p.name) CONTAINS toLower({name}) RETURN p', {name: 'charlie'})


  .run('CREATE (p:Person {name:\'Chesterfield\'})')

  .then(() => {
    return session.run('MATCH (p:Person) WHERE toLower(p.name) CONTAINS toLower({name}) RETURN p', {name: 'charlie'})
  })


  .then((result) => {
    console.log('result:', result);
    session.close();
    driver.close();
  });
