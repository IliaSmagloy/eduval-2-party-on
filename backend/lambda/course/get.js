'use strict';

const dbConfig = require('../db')

function dbRowToProperObject(obj) {
	obj.id = obj.courseId;
	delete obj.courseId;
	obj.name = obj.courseName;
	delete obj.courseName;
	return obj
}

// GET course/{courseId}
module.exports.byId = (event, context, callback) => {
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
                    body: JSON.stringify(dbRowToProperObject(result[0]))
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

// GET course/byTeacher/{teacherId}
module.exports.byId = (event, context, callback) => {
	if (!("pathParameters" in event) || !(event.pathParameters) || !(event.pathParameters.teacherId)) {
        callback(null, {
            statusCode: 400,
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Credentials': true
			},
            body: JSON.stringify({
                message: "Invalid Input, please send us the teacherId's ID!",
            })
        });
        return;
    }
	else if (isNaN(event.pathParameters.teacherId)) {
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
            teacherId: event.pathParameters.teacherId
        }).select().then((result) => {
            knex.client.destroy();

            if (result.length == 0) {
                callback(null, {
                    statusCode: 404,
					headers: {
						'Access-Control-Allow-Origin': '*',
						'Access-Control-Allow-Credentials': true
					},
                    body: JSON.stringify({
                        message: 'No courses found.'
                    }),
                });
            } else {
                callback(null, {
                    statusCode: 200,
					headers: {
						'Access-Control-Allow-Origin': '*',
						'Access-Control-Allow-Credentials': true
					},
                    body: JSON.stringify(result.map(dbRowToProperObject))
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
