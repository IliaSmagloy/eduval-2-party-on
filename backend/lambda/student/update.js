'use strict';

const dbConfig = require('../db')
const models = require('../models')
const validate = require('jsonschema').validate;

function objectToDdRow(obj) {
	obj.studentId = obj.id;
	delete obj.id;
	obj.idToken = obj.authIdToken;
	delete obj.authIdToken;
	return obj
}

// PUT student
module.exports.handler = (event, context, callback) => {
	if (!event.body) {
        callback(null, {
            statusCode: 405,
            body: JSON.stringify({
                message: "Invalid Input. JSON object required.",
            })
        });
        return;
    }

	var studentObj;
	try {
		studentObj = JSON.parse(event.body);
	} catch (e) {
		callback(null, {
            statusCode: 405,
            body: JSON.stringify({
                message: "Invalid JSON. Error: " + e.message,
            })
        });
        return;
	}

	var oldRequired = models.Student.required
	models.Student.required = ["id"]
	var validateRes = validate(studentObj, models.Student);
	models.Student.required = oldRequired
	if(!validateRes.valid) {
		callback(null, {
            statusCode: 405,
            body: JSON.stringify({
                message: "Invalid JSON object. Errors: " + JSON.stringify(validateRes.errors),
            })
        });
        return;
	}

	//convert to format stored in DB, and discard ID
	studentObj = objectToDdRow(studentObj)

    // Connect
    const knex = require('knex')(dbConfig);

    knex('Students')
	.where({
		studentId: studentObj.studentId
	})
	.update(studentObj)
	.then((result) => {
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
