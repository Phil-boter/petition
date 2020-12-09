const spicedPg = require('spiced-pg');
const db = spicedPg('postgres:postgres:postgres@localhost:5432/petition');

module.exports.getUserdata = () => {
    return db.query(`SELECT * FROM petition`);
};

// petition
module.exports.addSignature = (signature, userId) => {
    const q = `INSERT INTO petition (signature, user_id) VALUES ($1, $2)
    RETURNING id`;
    const params = [signature, userId];
    return db.query(q, params);    
};

module.exports.allSignersNames =()=> {
    return db.query(
        `SELECT first, last FROM petition`
    ); 
};

module.exports.totalSigners =() => {
    const q = `SELECT COUNT(*) FROM petition`;
    return db.query(q);

}
module.exports.getSignature = userId => {
    const q = `SELECT signature FROM petition WHERE user_id = $1`;
    const params = [userId];
    return db.query(q, params);
};
module.exports.getIfSigned = userId => {
    const q =   `SELECT id FROM petition WHERE user_id = $1`;
    const params = [userId];
    return db.query(q, params);
};


// registration
module.exports.addUserRegData = (first_name, last_name, email, hashed_password) => { 
    const q = `INSERT INTO users (first, last, email, password) VALUES ($1, $2, $3, $4) RETURNING id`;
    const params =  [first_name, last_name, email, hashed_password];
    return db.query(q, params);
};


module.exports.getHashedPassword = email =>{
    const q = `SELECT password, id FROM users WHERE email = $1`;
    const params = [email];
    return db.query(q, params);
};

// profile

module.exports.addUserProfile = (age, city, url, userId)=> {
    const q = `INSERT INTO user_profiles (age, city, url, user_id) VALUES ($1, $2, $3, $4)`;
    const params = [age, city, url, userId];
    return db.query(q, params);
};

module.exports.signerNames = () => {
    const q = `SELECT users.first, users.last, user_profiles.age, user_profiles.city, user_profiles.url FROM users
               LEFT JOIN user_profiles ON users.id = user_profiles.user_id
               INNER JOIN petition ON users.id = petition.user_id`;
    return db.query(q);
};

module.exports.getCity = (city) => {
    const q =  `SELECT users.first, users.last, user_profiles.age, user_profiles.url FROM petition
                LEFT JOIN users ON petition.user_id = users.id
                JOIN user_profiles ON users.id = user_profiles.user_id
                WHERE TRIM(LOWER(user_profiles.city)) = LOWER($1)`;
    const params = [city];
    return db.query(q, params);
};

// editprofile

module.exports.getDataForEdit = (userId) => {
    const q = `SELECT users.first, users.last, users.email, user_profiles.city, user_profiles.age, user_profiles.url
               FROM user_profiles
               LEFT JOIN users
               ON users.id = user_profiles.user_id
               WHERE users.id = $1`;
    const params = [userId];
    return db.query(q, params);
};

// SELECT first as first_name, last as last_name, email as mail, age as age_int, city as residence, homepage as url FROM signatures
//         LEFT JOIN users
//         ON users.id = signatures.user_id
//         LEFT JOIN user_profiles
//         ON users.id = user_profiles.user_id
//         WHERE users.id

//                         first: rows[0].first_name,
//                 last: rows[0].last_name,
//                 email: rows[0].mail,
//                 age: rows[0].age_int,
//                 city: rows[0].residence,
//                 page: rows[0].url