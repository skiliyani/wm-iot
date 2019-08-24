const schedule = require('node-schedule');
const mysql = require('mysql');
const timeago = require('time-ago');
const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://192.168.8.10');

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

var j = schedule.scheduleJob('*/1 * * * *', function(){
	pool.getConnection(function(err, connection) {
		 if (err) throw err; // not connected!

		 connection.query('select MAX(time) as max_time,ROUND(avg(value)) as avg_level from (select time,value from water_level_log where value > 0 order by time desc limit 10) recent', function(error, results, fields) {
				 connection.release();
				 if(error) throw error;
				 
				 let msg = results[0].avg_level + "," +  timeago.ago(results[0].max_time);
//				 msg.value = results[0].avg_level;
//				 msg.when = timeago.ago(results[0].max_time);
				 
				 console.log('Publish: ' + msg);
				 client.publish('home/water/level', msg);
			 });

		 
	 });
});