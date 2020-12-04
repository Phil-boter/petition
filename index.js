const express = require("express");
const app = express();
const db = require("./db");
// const cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');
const csurf = require('csurf');


const hb = require("express-handlebars");
app.engine("handlebars", hb());
app.set("view engine", "handlebars");

const {
    getUserdata,
    updateUserData,
    getSignature,
    totalSigners,
    allSignersNames
} = require("./db");

app.use(cookieSession({
    secret: `I'm always angry.`,
    maxAge: 1000 * 60 * 60 * 24 * 14
}));

app.use(
    express.urlencoded({
        extended: false
    })
);
app.use(csurf()); 

app.use(function (req, res, next) {
    res.set("x-frame-options", "DENY");
    res.locals.csrfToken = req.csrfToken();
    next();
});

// app.use(cookieParser());
app.use(express.static("./public"));



app.use((req, res, next)=> {
    console.log("--------------");
    console.log(`${req.method} request coming on route ${req.url}`);
    console.log("--------------");
    next();

})

app.get("/", (req,res) => {
    console.log("--------------");
    console.log(`req.session:`, req.session);
    console.log("--------------");
    res.redirect("petition");

});


app.get("/petition", (req, res) => {
    console.log("user requesting GET / petition");
    console.log('req.session in petition route: ',req.session.regId);
        if (req.session.registered == true) {
                res.redirect("/thanks");
                } 
                else {
                    res.render("petition");
                }
});

app.post("/petition", (req, res) => {
    console.log("POST petition was made");
    console.log("req.session",req.session);
    console.log("req.body", req.body);    
    const { first, last, signature} = req.body;
   
    db.updateUserData(first, last, signature)
        .then(({rows})=>{
            console.log('req.session.id: ', req.session.id);
            req.session.id = rows[0].id;
            req.session.registered == true;
            res.redirect("/thanks");
        })
        .catch((err)=> {
            console.log("error in updateUserData",err);
            console.log('req.session: ', req.session);
            res.redirect("/petition");
        })
});

app.get("/thanks", (req, res) => {
    console.log("user requesting GET / thanks");
    if(!req.session.registered){
        res.render("petition",{
            layout: "main",
        });
    }
    else {
        db.totalSigners()
            .then(({rows})=>{
                console.log("rows", rows[0])
                let registered = rows[0].count;

                res.render("thanks",{
                    layout: "main",
                    })

        });
    }

});

app.get("/signers", (req, res) => {
    console.log("user requesting GET / signers");
    const { first, last} = req.body;
    if(!req.session.registered){
        res.render("petition",{
            layout: "main",
        });
    }
    else {
        db.allSignersNames(first, last)
            .then(({rows}) => {
                console.log("result from allSignersNames:", rows);

                res.render("signers",{
                    layout: "main",
                });
            })
            .catch((err) => {
                console.log("Error from allSignersNames:", err);
            })
    }
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