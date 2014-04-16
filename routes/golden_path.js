
/*
 * GET Golden path manifesto
 */

exports.manifesto = function(req, res){
  res.render('golden_path', { title: 'The Golden Path' });
};

exports.revisited = function(req, res){
  res.render('golden_path_revisited', { title: 'The Golden Path' });
};

