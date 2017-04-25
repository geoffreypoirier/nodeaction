/**
 * Created by geoffrey on 4/21/17.
 */

let express = require('express');
let router  = express.Router();

// ship something back to show it works
router.get('/', (req, res, next) => {
  res.send('Express working.')
});


router.get('/nodes', (req, res, next) => {

  let dummy = [{value: '50.50.50', links: ['none']}];

  res.send(dummy);

});


module.exports = router;
