'use strict';

const dbConfig = require('../db')

// DELETE teacher/{teacherId}
module.exports.handler = (event, context, callback) => {
	if (!("pathParameters" in event) || !(event.pathParameters) || !(event.pathParameters.teacherId)) {
        callback(null, {
            statusCode: 400,
            body: JSON.stringify({
                message: "Invalid Input, please send us the teacher's ID! Don't even know how this can happen",
            })
        });
        return;
    }
	else if (isNaN(event.pathParameters.teacherId)) {
		//then the ID is invalid
		callback(null, {
            statusCode: 400,
            body: JSON.stringify({
                message: "Invalid ID! It should be an integer.",
            })
        });
        return;
	}

    // Connect
    const knex = require('knex')(dbConfig);

    knex('Teachers').where({
            teacherId: event.pathParameters.teacherId
        }).del().then((result) => {
            knex.client.destroy();

			if(result === 1) {
				callback(null, {
					statusCode: 200,
					body: ""
				});
			}
			else {
				callback(null, {
					statusCode: 404,
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
