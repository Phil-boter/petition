const spicedPg = require('spiced-pg');
const db = spicedPg('postgres:postgres:postgres@localhost:5432/petition');

module.exports.getUserdata = () => {
    return db.query(`SELECT * FROM petition`);
};

module.exports.updateUserData = (firstName, lastName, signature) => {
    const q = `INSERT INTO petition (first, last, signature) VALUES ($1, $2, $3)`;
    const params = [firstName, lastName, signature];
    return db.query(q, params);    
};

module.exports.allSigners =(firstName, lastName)=> {
    const q = `SELECT (first,last) FROM petition`;
    // const params = [firstName, lastName];
    return db.query(q); 
};

module.exports.totalSigners =(id) => {
    const q = `SELECT COUNT FROM petition (id) VALUES ($1)`;
    const params = [id];
    return db.query(q, params);

}
exports.ifSigned = id => {
    const q = `SELECT FROM signatures WHERE (id) VALUES ($1)`;
    const params = [id];
    return db.query(q, params);
};


