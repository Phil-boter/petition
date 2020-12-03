const spicedPg = require('spiced-pg');
const db = spicedPg('postgres:postgres:postgres@localhost:5432/petition');

module.exports.getUserdata = () => {
    return db.query(`SELECT * FROM petition`);
};

module.exports.updateUserData = (first, last, signature) => {
    const q = `INSERT INTO petition(first, last, signature) VALUES ($1, $2, $3)`
    const s = `SELECT first, last FROM petition ORDER BY id;`
    const params = [first, last, signature];
    return db.query(q, params)    
};
exports.ifSigned = id => {
    const q = `SELECT id FROM signatures WHERE id = $1`;
    const params = [id];
    return db.query(q, params);
};


