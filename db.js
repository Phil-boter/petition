const spicedPg = require('spiced-pg');
const db = spicedPg('postgres:postgres:postgres@localhost:5432/petition');

module.exports.getUserdata = () => {
    return db.query(`SELECT * FROM petition`);
};

// petition
module.exports.updateUserData = (firstName, lastName, signature) => {
    const q = `INSERT INTO petition (first, last, signature) VALUES ($1, $2, $3)
    RETURNING id`;
    const params = [firstName, lastName, signature];
    return db.query(q, params);    
};

module.exports.allSignersNames =()=> {
    return db.query(
        `SELECT first,last FROM users`
    ); 
};

module.exports.totalSigners =() => {
    const q = `SELECT COUNT(*) FROM petition`;
    return db.query(q);

}
exports.getSignature = id => {
    const q =   `SELECT signature FROM petition WHERE id = $1`;
    const params = [id];
    return db.query(q, params);
};
exports.getIfSigned = id => {
    const q =   `SELECT id FROM petition WHERE id = $1`;
    const params = [id];
    return db.query(q, params);
};


// registration
exports.addUserRegData = function(first_name, last_name, email, hashed_password) { 
    const q = `INSERT INTO users (first, last, email, password) VALUES ($1, $2, $3, $4) RETURNING id`;
    const params =  [first_name, last_name, email, hashed_password];
    return db.query(q, params);
};

exports.getSignatureImage = function(user_id) {
    return db.query(
        `SELECT signature FROM petition WHERE user_id = ${user_id}`
    );
};

exports.getHashedPassword = function(email) {
    const q = `SELECT password, id FROM users WHERE email = $1`;
    const params = [email];
    return db.query(q, params);
};