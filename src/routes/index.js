/**
 * Created by geoffrey on 4/21/17.
 */

let express = require('express');
let router = express.Router();

// ship something back to show it works
router.get('/', (req, res, next) => {
  res.send('Express working.')
});

module.exports = router;
