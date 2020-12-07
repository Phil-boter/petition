const express = require("express");
const app = express();
const db = require("./db");
var cookieSession = require('cookie-session');
const csurf = require('csurf');
const { hash, compare } = require("./bc");


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
    console.log("req.body /register: ", req.body);
    console.log("req.session /register: ", req.session);
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
                console.log("rows addUser /register: ", rows)
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
    let id;
    let email = req.body.email;   
    db.getHashedPassword(email)
        .then(({ rows }) => {
            let salt = rows[0].password;
            let password = req.body.password;
            let dataId = rows[0].id
            console.log("password /login: ",password); // hashed password
            console.log("req.body.password /login", salt); // plain password
            let match = compare(password, salt);
            id = dataId;
            return match;
        })
        .then(match => {
            if(match){
                db.getIfSigned(id)
                    .then(({ rows })=> {
                        console.log("signed rows: ", rows[0]);
                        if(rows[0]) {
                            req.session.signed = rows[0].user_id;
                            res.redirect("/thanks");
                        } 
                        else if(!rows[0]) {
                            res.redirect("/petition");   
                        }
                    })
                    .catch(error => {
                        console.log("error getIfSigned", error);
                        res.render("login", { error: true});
                    })
            }
            else {
                res.render("login", { error: true});
            }
        })
        .catch(error => {
            console.log("error match", error);
            res.render("login", {error: true})
        })
})

app.get("/petition", (req,res)=> {
    if(req.session.signed == "true") {
        db.getIfSigned(req.session.id)
        .then(({rows}) => {
            if(rows[0]) {
                res.redirect("/thanks");
            }
            else {
                res.render("petition");
            }
        })      
    }
})

app.post("/petition", (req, res) => {
    console.log("POST petition was made");
    console.log("req.session",req.session.id);
    console.log("req.body", req.body.signature);  
    let signature = req.body.signature;
    let userId = req.session.id; 
    // const { user_id, signature} = req.body;// error first /last
    
        db.updateUserData(userId, signature)
            .then(({rows})=>{
                console.log('rows petition/post: ', rows);
                req.session.id = rows[0].id;
                req.session.signed = "true";
                res.redirect("/thanks");
            })
            .catch((error)=> {
                console.log("error in updateUserData",error);
                console.log('req.session petition/post: ', req.session);
                res.render("petition", { error: true });
            })   
});

app.get("/thanks", (req, res) => {
    console.log("user requesting GET / thanks"); 
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