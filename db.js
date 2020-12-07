const spicedPg = require('spiced-pg');
const db = spicedPg('postgres:postgres:postgres@localhost:5432/petition');

module.exports.getUserdata = () => {
    return db.query(`SELECT * FROM petition`);
};

// petition
module.exports.updateUserData = (user_id, signature) => {
    const q = `INSERT INTO petition (user_id, signature) VALUES ($1, $2)
    RETURNING id`;
    const params = [user_id, signature];
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
    const q =   `SELECT user_id FROM petition WHERE user_id = $1`;
    const params = [id];
    return db.query(q, params);
};


// registration
exports.addUserRegData = (first_name, last_name, email, hashed_password) => { 
    const q = `INSERT INTO users (first, last, email, password) VALUES ($1, $2, $3, $4) RETURNING id`;
    const params =  [first_name, last_name, email, hashed_password];
    return db.query(q, params);
};

exports.getSignatureImage = (user_id) => {
    const q = `SELECT signature FROM petition WHERE user_id = $1`;
    const params = [user_id];
    return db.query();
};

exports.getHashedPassword = email =>{
    const q = `SELECT password, id FROM users WHERE email = $1`;
    const params = [email];
    return db.query(q, params);
};