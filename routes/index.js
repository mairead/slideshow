
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Emdeebeebee' });
};

exports.presentation = function(req, res){
  res.sendfile('./public/index.html');
};