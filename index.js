const express = require("express");
const app = express();
const db = require("./db");
const cookieParser = require('cookie-parser');

const hb = require("express-handlebars");
app.engine("handlebars", hb());
app.set("view engine", "handlebars");

const {
    getUserdata,
    updateUserData,
    ifSigned,
    totalSigners,
    allSigners
} = require("./db");


app.use(
    express.urlencoded({
        extended: false
    })
);

app.use(cookieParser());
app.use(express.static("./public"));



app.use((req, res, next)=> {
    console.log("--------------");
    console.log(`${req.method} request coming on route ${req.url}`);
    console.log("--------------");
    next();

})


app.get("/petition", (req, res) => {
    console.log("user requesting GET / petition");
    if("authenticated" == true){
        res.render("thanks",{
            layout: "main",
        });
    }
    res.render("petition",{
        layout: "main",
    });
    
});

app.post("/petition", (req, res) => {
    console.log("POST petition was made");
    console.log("req.params",req.params);
    console.log("req.body", req.body);
    const { first, last, signature } = req.body;
   
    db.updateUserData(first, last, signature)
        .then(()=>{
            if("authenticated" == false){
                console.log('req.cookies: ', req.cookies);
                res.redirect("/petition");

            }
          
                res.cookie("authenticated", true)
                console.log('req.cookies: ', req.cookies);
                res.redirect("/thanks");
            
        })
        .catch((err)=> {
            console.log("error in updateUserData",err)
            res.cookie("authenticated", false);
            console.log('req.cookies: ', req.cookies);
            res.redirect("/petition");
        })
});

app.get("/thanks", (req, res) => {
    console.log("user requesting GET / thanks");
    if("authenticated" == false ){
        res.render("petition",{
            layout: "main",
    });
    }
    res.render("thanks",{
        layout: "main",
    });
});

app.get("/signers", (req, res) => {
    console.log("user requesting GET / signers");
    const { first, last} = req.body;
    db.allSigners(first, last)
        .then(({rows}) => {
            console.log("result from allSigners:", rows);
            if("authenticated" == false){
                res.render("petition",{
                    layout: "main",
            });
            }
            res.render("signers",{
                layout: "main",
            });
        })
        .catch((err) => {
            console.log("Error from allSigners:", err);
        })

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