var spicedPg = require('spiced-pg');
var db = spicedPg('postgres:phil:postgres@localhost:5432/oscars');

module.exports.getActors = () => {
    return db.query("SELECT * FROM oscars");
};