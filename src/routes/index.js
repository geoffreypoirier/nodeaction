/**
 * Created by geoffrey on 4/21/17.
 */

let express = require('express');
let router = express.Router();


// ship something
router.get('/', (req, res, next) => {
  res.send('Express working.')
});


module.exports = router;
