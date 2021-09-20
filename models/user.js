const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const userSchema = new mongoose.Schema({
	username: {
		type: String,
		required: [ true, 'Username cannot be blank' ]
	},
	password: {
		type: String,
		require: [ true, 'Password is required' ]
	}
});
userSchema.statics.findMyUser = async function(username, pass) {
	const foundUser = await this.findOne({ username });
	if (foundUser !== null) {
		const isValid = await bcrypt.compare(pass, foundUser.password);
		return foundUser;
	} else {
		return false;
	}

	//return isValid ? foundUser : false; //if isValid is true then return found user else return false
};

userSchema.pre('save', async function(next) {
	//although nothing has been passed to pre
	//pre gets the password from the Schema itself (in this case userSchema)
	if (!this.isModified('password')) return next(); //if the password has not been modified then just save
	this.password = await bcrypt.hash(this.password, 12);
	next(); //calls save after pre has been executed
});

module.exports = mongoose.model('User', userSchema);
