const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://192.168.8.10');
const mysql = require('mysql');
const connection = mysql.createConnection({
	  host     : '192.168.8.10',
	  user     : 'pi',
	  password : 'raspberry',
	  database : 'iot'
	});



client.on('connect', () => {
	console.log('Connected to MQTT Broker');
	client.subscribe('waterLevelTopic');
	console.log('Subscribed to waterLevelTopic');
	});

client.on('message', (topic, message) => {
	  if(topic === 'waterLevelTopic') {
		 console.log('Message: ' + message);
		 
		 connection.connect();
		 let query = mysql.format('INSERT INTO ?? (??) VALUES (?)',["water_level_log", "value", message]);
		 connection.query(query,function(err, rows, fields) {
			  	if (!err)
				    console.log('Logged to database');
				  else
				    console.log('Error while stroing to database');
				});
		 connection.end();
	  }
	})