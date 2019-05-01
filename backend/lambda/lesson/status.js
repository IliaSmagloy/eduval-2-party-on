'use strict';

const dbConfig = require('../db')
const models = require('../models')
const validate = require('jsonschema').validate;
const iot = require('./Notifications')

// GET lesson/{courseId}/status
module.exports.get = (event, context, callback) => {
	if (!("pathParameters" in event) || !(event.pathParameters) || !(event.pathParameters.courseId)) {
        callback(null, {
            statusCode: 400,
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Credentials': true
			},
            body: JSON.stringify({
                message: "Invalid Input, please send us the course's ID!",
            })
        });
        return;
    }
	else if (isNaN(event.pathParameters.courseId)) {
		//then the ID is invalid
		callback(null, {
            statusCode: 400,
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Credentials': true
			},
            body: JSON.stringify({
                message: "Invalid ID! It should be an integer.",
            })
        });
        return;
	}

    // Connect
    const knex = require('knex')(dbConfig);

    knex('Courses').where({
            courseId: event.pathParameters.courseId
        }).select().then((result) => {
            knex.client.destroy();

            if (result.length == 1) {
                callback(null, {
                    statusCode: 200,
					headers: {
						'Access-Control-Allow-Origin': '*',
						'Access-Control-Allow-Credentials': true
					},
                    body: result[0].status
                });
            } else if (result.length == 0) {
                callback(null, {
                    statusCode: 404,
					headers: {
						'Access-Control-Allow-Origin': '*',
						'Access-Control-Allow-Credentials': true
					},
                    body: JSON.stringify({
                        message: 'Course not found.'
                    }),
                });
            } else {
                callback(null, {
                    statusCode: 400,
					headers: {
						'Access-Control-Allow-Origin': '*',
						'Access-Control-Allow-Credentials': true
					},
                    body: JSON.stringify({
                        message: "There's more than one course with this ID?!",
                        data: result
                    }),
                });
            }

        })
        .catch((err) => {
            console.log('error occurred: ', err);
            // Disconnect
            knex.client.destroy();
            callback(err);
        });
};


// POST lesson/{courseId}/status
module.exports.post = (event, context, callback) => {
	//context.callbackWaitsForEmptyEventLoop = false
	if (!("pathParameters" in event) || !(event.pathParameters) || !(event.pathParameters.courseId)) {
        callback(null, {
            statusCode: 400,
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Credentials': true
			},
            body: JSON.stringify({
                message: "Invalid Input, please send us the course's ID!",
            })
        });
        return;
    }
	else if (isNaN(event.pathParameters.courseId)) {
		//then the ID is invalid
		callback(null, {
            statusCode: 400,
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Credentials': true
			},
            body: JSON.stringify({
                message: "Invalid ID! It should be an integer.",
            })
        });
        return;
	}

	var newStatus = event.body;
	var schema = {
		type: 'string',
		enum: ['LESSON_START', 'LESSON_END']
	}
	var validateRes = validate(newStatus, schema);
	if(!validateRes.valid) {
		callback(null, {
            statusCode: 405,
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Credentials': true
			},
            body: JSON.stringify({
                message: "Invalid status. Errors: " + JSON.stringify(validateRes.errors),
            })
        });
        return;
	}

    // Connect
    const knex = require('knex')(dbConfig);
console.log('aaaaaa');
    knex('Courses').where({
            courseId: event.pathParameters.courseId
        })
		.update({status: newStatus})
		.then(async (result) => {
console.log('bbbbbbb');
			if(result === 1) {
console.log('ccccccc');
				new Promise((resolve, reject) => {
					if(newStatus === 'LESSON_END') {
						console.log('ddddddd');
						//then we need to clear out the present students
						var promise = knex('PresentStudents').where({
								courseId: event.pathParameters.courseId
							}).del();
						resolve(promise);
					}
					resolve();
				}).then(() => {
					console.log('eeeeeee');
					knex.client.destroy();

					iot.connect().then(() => {
						console.log('fffffff');
						iot.client.publish('lesson/' + event.pathParameters.courseId + '/status', newStatus, {}, (uneededResult) => {
							iot.client.end(false)
							callback(null, {
								statusCode: 200,
								headers: {
									'Access-Control-Allow-Origin': '*',
									'Access-Control-Allow-Credentials': true
								},
								body: ""
							});
							return;
						})
					})
				});
			}
			else {
				callback(null, {
					statusCode: 404,
					headers: {
						'Access-Control-Allow-Origin': '*',
						'Access-Control-Allow-Credentials': true
					},
					body: ""
				});
			}

        })
        .catch((err) => {
            console.log('error occurred: ', err);
            // Disconnect
            knex.client.destroy();
            callback(err);
        });
};