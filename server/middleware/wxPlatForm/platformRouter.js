var router = {};
var Auth = require('./wxPlatformAuth.js');
var WebAuth = require('./webAuth');
router.start = function (req, res) {
  var action = req.params.action;
  switch (action) {
    case 'auth' :
      Auth(req, res);
      break;
    case 'console' :
      Console(req, res);
      break;
    case 'webauth':
      WebAuth(req,res);
      break;
  }
  function Console(req, res) {
    res.render('console');
  }
}
module.exports = router;
