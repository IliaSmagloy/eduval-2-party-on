exports.UserInfo = {
	type: 'object',
	properties: {
		firstName: {
			type: 'string',
		},
		lastName: {
			type: 'string',
		},
		email: {
			type: 'string',
			format: 'email',
		},
		phoneNum: {
			type: 'string',
		},
		oldPassword: {
			type: 'string',
		},
		newPassword: {
			type: 'string',
		},
		username: {
			type: 'string',
		},
	},
	additionalProperties: false,
};
