const knex = require('knex');
const middy = require('middy');
const {
	cors, httpErrorHandler, httpEventNormalizer,
} = require('middy/middlewares');
const createError = require('http-errors');
const dbConfig = require('../db');
const corsConfig = require('../cors');


function dbRowToProperObject(obj) {
	const retObj = { ...obj };		// shallow copy
	retObj.id = obj.courseId;
	delete retObj.courseId;
	retObj.name = obj.courseName;
	delete retObj.courseName;
	if ('studentId' in obj) { delete retObj.studentId; }
	return retObj;
}

function isAnInteger(obj) {
	return !Number.isNaN(Number(obj)) && Number.isInteger(Number(obj));
}

// GET course/{courseId}
const getCourseById = async (event, context, callback) => {
	if (!event.pathParameters.courseId) {
		return callback(createError.BadRequest("Course's ID required."));
	}
	if (!isAnInteger(event.pathParameters.courseId)) {
		return callback(createError.BadRequest('ID should be an integer.'));
	}

	// Connect
	const knexConnection = knex(dbConfig);

	return knexConnection('Courses')
		.where({
			courseId: event.pathParameters.courseId,
		})
		.select()
		.then((result) => {
			knexConnection.client.destroy();

			if (result.length === 1) {
				callback(null, {
					statusCode: 200,
					body: JSON.stringify(dbRowToProperObject(result[0])),
				});
			} else if (result.length === 0) {
				callback(createError.NotFound('Course not found.'));
			} else {
				callback(createError.InternalServerError('More than one course with this ID.'));
			}
		})
		.catch((err) => {
			// Disconnect
			knexConnection.client.destroy();
			// eslint-disable-next-line no-console
			console.log(`ERROR getting course: ${err}`);
			return callback(createError.InternalServerError('Error getting course.'));
		});
};

// GET course/byTeacher/{teacherId}
const getCoursesByTeacher = async (event, context, callback) => {
	if (!event.pathParameters.teacherId) {
		return callback(createError.BadRequest("Teacher's ID required."));
	}
	if (!isAnInteger(event.pathParameters.teacherId)) {
		return callback(createError.BadRequest('ID should be an integer.'));
	}

	// Connect
	const knexConnection = knex(dbConfig);

	return knexConnection('Courses')
		.where({
			teacherId: event.pathParameters.teacherId,
		})
		.select()
		.then((result) => {
			knexConnection.client.destroy();

			if (result.length === 0) {
				callback(createError.NotFound('No courses found for teacher.'));
			} else {
				callback(null, {
					statusCode: 200,
					body: JSON.stringify(result.map(dbRowToProperObject)),
				});
			}
		})
		.catch((err) => {
			// Disconnect
			knexConnection.client.destroy();
			// eslint-disable-next-line no-console
			console.log(`ERROR getting courses by teacher: ${err}`);
			return callback(createError.InternalServerError('Error getting courses by teacher.'));
		});
};

// GET course/byStudent/{studentId}
const getCoursesByStudent = async (event, context, callback) => {
	if (!event.pathParameters.studentId) {
		return callback(createError.BadRequest("Student's ID required."));
	}
	if (!isAnInteger(event.pathParameters.studentId)) {
		return callback(createError.BadRequest('ID should be an integer.'));
	}

	// Connect
	const knexConnection = knex(dbConfig);

	return knexConnection('Registered')
		.where({
			studentId: event.pathParameters.studentId,
		})
		.select()
		.join('Courses', 'Courses.courseId', 'Registered.courseId')
		.then((result) => {
			knexConnection.client.destroy();

			callback(null, {
				statusCode: 200,
				body: JSON.stringify(result.map(dbRowToProperObject)),
			});
		})
		.catch((err) => {
			// Disconnect
			knexConnection.client.destroy();
			// eslint-disable-next-line no-console
			console.log(`ERROR getting courses of student: ${err}`);
			return callback(createError.InternalServerError('Error getting courses of student.'));
		});
};

const byId = middy(getCourseById)
	.use(httpEventNormalizer())
	.use(httpErrorHandler())
	.use(cors(corsConfig));

const byTeacherId = middy(getCoursesByTeacher)
	.use(httpEventNormalizer())
	.use(httpErrorHandler())
	.use(cors(corsConfig));

const byStudentId = middy(getCoursesByStudent)
	.use(httpEventNormalizer())
	.use(httpErrorHandler())
	.use(cors(corsConfig));

module.exports = { byId, byTeacherId, byStudentId };
