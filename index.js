const express = require("express");
const app = express();
const db = require("./db");
// const cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');
const csurf = require('csurf');


const hb = require("express-handlebars");
app.engine("handlebars", hb());
app.set("view engine", "handlebars");

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


app.get("/petition", (req,res)=> {
    if(req.session.signed == "true") {
        res.redirect("/thanks");
    }
    else {
        res.render("petition");
    }
})

app.post("/petition", (req, res) => {
    console.log("POST petition was made");
    console.log("req.session",req.session);
    console.log("req.body", req.body);    
    const { first, last, signature} = req.body;

    if(first == ""){
        res.redirect("/petition");
    }
    else if(last == ""){
        res.redirect("/petition");
    }
    else if(signature == ""){
        res.redirect("/petition");
    }
    else  {
        db.updateUserData(first, last, signature)
            .then(({rows})=>{
                console.log('rows: ', rows);
                req.session.id = id;
                req.session.signed = "true";
                res.redirect("/thanks");
            })
            .catch((err)=> {
                console.log("error in updateUserData",err);
                console.log('req.session: ', req.session);
                res.redirect("/petition");
            })
    }    
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
            .catch((err) => {
                console.log("Error showSig", err)
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
            .catch((err) => {
                console.log("Error from allSignersNames:", err);
            })
    }
});


app.listen(8080, ()=> console.log("petition server is listening"));