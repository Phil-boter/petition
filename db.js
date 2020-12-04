const spicedPg = require('spiced-pg');
const db = spicedPg('postgres:postgres:postgres@localhost:5432/petition');

module.exports.getUserdata = () => {
    return db.query(`SELECT * FROM petition`);
};

module.exports.updateUserData = (firstName, lastName, signature) => {
    const q = `INSERT INTO petition (first, last, signature) VALUES ($1, $2, $3)
    RETURNING id`;
    const params = [firstName, lastName, signature];
    return db.query(q, params);    
};

module.exports.allSignersNames =()=> {
    return db.query(
        `SELECT first,last FROM petition`
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


