const express = require("express");
const app = express();
const db = require("./db");


app.use((req, res, next)=> {
    console.log("--------------");
    console.log(`${req.method} request coming on route ${req.url}`);
    console.log("--------------");
    next();

})


app.get("./actors", (req, res)=>{
    db.getActors().then((result)=> {
        console.log("result from getActors", result.rows);
        res.sendStatus(200);
    })
    .catch((err)=>{
        console.log("error in db.actors", err);
    })
})


app.listen(8080, ()=> console.log("petition server is listening"));