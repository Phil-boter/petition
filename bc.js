const bcrypt = require("bcryptjs");
const { promisify } = require("util");

const genSalt = promisify(bcrypt.genSalt);
const hash = promisify(bcrypt.hash);
const compare = promisify(bcrypt.compare);

exports.hash = password => genSalt().then(salt => hash(password, salt));

exports.compare = compare;

// The compare method will give you back a boolean if no error occurs. 
// If the boolean is true, the password matches the hash. 
// If it is false, the password is wrong