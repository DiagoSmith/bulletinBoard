//Requirements & Initializations
var express = require('express');
var app = express();
var path = require('path')
var bodyParser = require('body-parser');

var pg = require('pg')
var connectionString = 'postgres://' + process.env.POSTGRES_USER + ':' + process.env.POSTGRES_PASSWORD + '@localhost/bulletinboard'; //credentials for the database.

app.set('views', path.join(__dirname, 'views')); //set the views folder where the jade file resides
app.set('view engine', 'jade'); //sets the jade rendering

app.use(bodyParser.urlencoded({ extended: true })); // for parsing form data. 

app.listen(3000);


//Routes & database stuff.

app.get('/newpost', function(req, res) { // new route for the message form creation 
	res.render('newpost');
});

app.post('/messagedata',function(req,res){ 	//what happens when a post is submitted 
	data = [];
	data[0] = req.body.title; //set a new array index as value of title retrieved from message page. 
	data[1] = req.body.content; //same as above, but for the content. 
	//console.log(data)

	var results = []; // intialize
	var order = 0; // 

		pg.connect(connectionString, function (err, client, done) {
			client.query('INSERT INTO messages (title,body) VALUES ($1, $2)',data, function (err, result) { //insert the two array values from the form into the table.
				//console.log("added message to database");
				done();
				order = 1 ; //change order to 1
				checker(); //trigger checker function
				pg.end(); 
			});
		});

		function checker(){ //This simple function checks to see if the new message has been added to the database
			if (order == 1) { //if so, then trigger the database query.
			unleash(); //function for the query, important to ensure that the database is updated AFTER the insertion has occured.
			}
		};

		function unleash() {
			pg.connect(connectionString, function (err,client,done){
				client.query('SELECT title, body FROM messages',function (err,result){ //shows everything except unique key id.
					//console.log(result.rows);
					order = 0; //resets the order.
					var expected = [] //array to fill with database results. 
					done();
					expected = result.rows //fill with rows from database results.
					console.log(expected)
					pg.end();
					res.redirect('/view'); //redirect is important here! 

							app.get('/view', function(req, res) { // new route to view the messages posted, written here due to horrible scoping.
							res.render('view',{database:expected}); //had trouble making this globaly available, so calling from within function after post request.
							});
				});

			});
		
		}
		
});




			



