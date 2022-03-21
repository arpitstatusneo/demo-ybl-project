var express = require('express');
var MongoClient = require('mongodb').MongoClient

var url = 'mongodb://mongo:27017/mongodb'; 

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* To post data and query json file */
router.post('/metrices', function(req, res, next) {
  MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("mydb");
  var myobj = { percentage_cpu_used: req.body.percentage_cpu_used, percentage_memory_used: req.body.percentage_memory_used, ip: getRequestIpAddress(req) };
  dbo.collection("metrices_server").insertOne(myobj, function(err, res) {
    if (err) throw err;
    console.log("1 document inserted");
    db.close();
  });
  });
  res.render('index', { title: 'the query has been submitted'});
});

/* To Create the report for the given json file */
router.get('/report', function(req, res, next) {
   MongoClient.connect(url,function(err,db){
        if (err) throw err;
        var dbo = db.db("mydb");
	var collection = dbo.collection('metrices_server');
	collection.find({}).sort({percentage_cpu_used: -1, percentage_memory_used: -1}).limit(1).toArray(function(err,docs){
        if (err) throw err;
        console.log(docs);
	res.send(docs)
        db.close();
	});	
  });
});

const getRequestIpAddress = (request) => {
    const requestIpAddress = request.headers['X-Forwarded-For'] || request.connection.remoteAddress
    if (!requestIpAddress) return null

    const ipv4 = new RegExp("(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)")

    const [ipAddress] = requestIpAddress.match(ipv4)

    return ipAddress
}
module.exports = router;
