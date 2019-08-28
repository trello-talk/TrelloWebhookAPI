var handler = function(err, req, res, next){
	if(err){
		console.dir(err.stack);
		var o = {
			"status": 500,
			"data": err.stack
		};
		res.status(500).json(o);
	}else{
		next();
	}
};

module.exports = handler;
