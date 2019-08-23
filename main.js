const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://192.168.8.10');
const mysql = require('mysql');

var pool  = mysql.createPool({
	  connectionLimit : 10,
	  host            : '192.168.8.10',
	  user            : 'pi',
	  password        : 'raspberry',
	  database        : 'iot',
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
			 
			 let query = mysql.format('INSERT INTO ?? (??) VALUES (?)',["water_level_log", "value", message]);
			 connection.query(query, function (error, results, fields) {
				 connection.query('select ROUND(avg(value)) as avg_level from (select value from water_level_log where value > 0 order by time desc limit 10) recent', function(error, results, fields) {
					 connection.release();
					 if(error) throw error;
					 
					 client.publish('home/water/level', String(results[0].avg_level));
				 });
				 if (error) throw error;
			 });
			 
		 });
	}
});