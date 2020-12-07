const express = require("express");
const app = express();
const db = require("./db");
var cookieSession = require('cookie-session');
const csurf = require('csurf');
const { hash, compare } = require("./bc");


const hb = require("express-handlebars");
app.engine("handlebars", hb());
app.set("view engine", "handlebars");

let userId;
let signed;

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

app.use(express.static("./public"));



app.use((req, res, next)=> {
    console.log("--------------");
    console.log(`${req.method} request coming on route ${req.url}`);
    console.log("--------------");
    next();

})

app.get("/", (req,res) => {
    if(req.session.signed == true) {
        res.redirect("/login");
    }
    else {
        res.redirect("/registration");
    }
});

app.get("/registration", (req, res) => {
    res.render("registration");
});

app.post("/registration", (req, res) => {
    console.log("req.body: ", req.body);
    console.log("req.session: ", req.session);
    hash(req.body.password)
        .then(result => {
            hashed_password = result;
            return hashed_password;
        })
        .then(result =>{
            db.addUserRegData(
                req.body.first_name,
                req.body.last_name,
                req.body.email,
                hashed_password
            )
            .then(({ rows }) =>{
                req.session.id = rows[0].id;
                res.redirect("/petition");
            })
            .catch(error => {
                res.render("registration", {error : true})
        });
    })
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/login", (req, res)=> {
    let email = req.body.email;
    db.getHashedPassword(email)
        .then(result => {
            compare(req.body.password, result.rows[0].password)
                .then()
        })

})

app.get("/petition", (req,res)=> {
    if(req.session.signed == "true") {
        res.redirect("/thanks");
    }
    else {
        res.render("/petition");
    }
})

app.post("/petition", (req, res) => {
    console.log("POST petition was made");
    console.log("req.session",req.session);
    console.log("req.body", req.body);    
    const { first, last, signature} = req.body;
    
        db.updateUserData(first, last, signature)
            .then(({rows})=>{
                console.log('rows: ', rows);
                req.session.id = rows[0].id;
                req.session.signed = "true";
                res.redirect("/thanks");
            })
            .catch((error)=> {
                console.log("error in updateUserData",error);
                console.log('req.session: ', req.session);
                res.render("/petition", { error: true });
            })   
});

app.get("/thanks", (req, res) => {
    console.log("user requesting GET / thanks");
    if(req.session.signed != "true"){
        res.redirect("/petition");
    }
    else {   
        db.getSignature(req.session.id)       
            .then(({rows}) =>{
                console.log("rows", rows[0])
                const signature = rows[0].signature;
                db.totalSigners()
                    .then(({rows})=>{
                        const countSigners = rows[0].count;
                        res.render("thanks",
                            {signature, countSigners});  
                    }) 
            })
            .catch((error) => {
                console.log("Error showSig", error);
                res.render("/petition", { error: true });
            });
        }
    });

app.get("/signers", (req, res) => {
    console.log("user requesting GET / signers");
    const { first, last} = req.body;
    if(req.session.signed != "true"){
        res.redirect("/petition");
    }
    else {
        db.allSignersNames(first, last)
            .then(({rows}) => {
                console.log("result from allSignersNames:", rows);

                res.render("signers",{
                    rows
                });
            })
            .catch((error) => {
                console.log("Error from allSignersNames:", error);
                res.render("/petition", { error: true });
            })
    }
});


app.listen(8080, ()=> console.log("petition server is listening"));