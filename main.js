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
				 connection.query('select MAX(time) as max_time,ROUND(avg(value)) as avg_level from (select time,value from water_level_log where value > 0 order by time desc limit 10) recent', function(error, results, fields) {
					 connection.release();
					 if(error) throw error;
					 
					 let msg = new Object();
					 msg.value = results[0].avg_level;
					 msg.time = results[0].max_time;
					 msg.unit = 'cm';
					 
					 client.publish('home/water/level', JSON.stringify(msg));
				 });
				 if (error) throw error;
			 });
			 
		 });
	}
});