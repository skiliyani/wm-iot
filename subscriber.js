const config = require('config');
const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://' + config.get('mqtt.broker'));
const mysql = require('mysql');

var pool  = mysql.createPool({
	  connectionLimit : 10,
	  host            : config.get('mysql.host'),
	  user            : config.get('mysql.user'),
	  password        : config.get('mysql.password'),
	  database        : config.get('mysql.database'),
	  connectTimeout  : 60 * 60 * 1000,
	  acquireTimeout  : 60 * 60 * 1000,
	  timeout         : 60 * 60 * 1000
});

client.on('connect', () => {
	console.log('Connected to MQTT Broker');
	
	client.subscribe('waterLevelTopic');
	console.log('Subscribed to waterLevelTopic');

});

client.on('message', (topic, message) => {
	  if(topic === 'waterLevelTopic') {
		 console.log('Message: ' + message);
		 
		 pool.getConnection(function(err, connection) {
			 if (err) throw err; // not connected!
			 
			 let query = mysql.format('INSERT INTO ?? (??) VALUES (?)',["water_level_log", "value", Number(message)]);
			 connection.query(query, function (error, results, fields) {
				 connection.release();
				 if (error) throw error;
			 });
			 
		 });
	}
});