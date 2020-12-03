const express = require("express");
const app = express();
const db = require("./db");

const hb = require("express-handlebars");
app.engine("handlebars", hb());
app.set("view engine", "handlebars");

app.use(express.static("./public"));



app.use((req, res, next)=> {
    console.log("--------------");
    console.log(`${req.method} request coming on route ${req.url}`);
    console.log("--------------");
    next();

})


app.get("/", (req, res)=>{
    console.log("user requesting GET / route");
    res.render("petition", {
        layout: "main",//when you have called you layout file main, 
                        //you may omit spcifying this here, hb express  
                        //will by default look for a layout file with that name
    });
});

app.get("/petition", (req, res) => {
    console.log("user requesting GET / petition");
    res.render("petition",{
        layout: "main",
    });
});

app.post("/petition", (req, res) => {
    console.log("POST petition was made")
});

app.get("/thanks", (req, res) => {
    console.log("user requesting GET / thanks");
    res.render("thanks",{
        layout: "main",
    });
});

app.get("/signers", (req, res) => {
    console.log("user requesting GET / signers");
    res.render("signers",{
        layout: "main",
    });
});
// app.get("./actors", (req, res)=>{
//     db.getActors().then((result)=> {
//         console.log("result from getActors", result.rows);
//         res.sendStatus(200);
//     })
//     .catch((err)=>{
//         console.log("error in db.actors", err);
//     })
// })

// app.post("/add-actor",(req, res) => {
//     db.addActor("Julia", 35, 2)
//        .then(()=> {
//            console.log("yay worked");
//            res.sendStatus(200);
//        })
//        .catch((err) => {
//            console.log("error in db.addActor", err)
//        });
// })

app.listen(8080, ()=> console.log("petition server is listening"));