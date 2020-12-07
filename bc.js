const bcrypt = require("bcryptjs");
const { PassThrough } = require("stream");
const { promisify } = require("util");

const genSalt = promisify(bcrypt.genSalt);
const hash = promisify(bcrypt.hash);
const compare = promisify(bcrypt.compare);

exports.hash = password => {
    return genSalt().then((salt) => {
        return hash(password, salt);
    });
}; 

exports.compare = compare;
