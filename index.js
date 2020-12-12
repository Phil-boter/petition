const express = require("express");
const app = express();
const db = require("./db");
var cookieSession = require('cookie-session');
const csurf = require('csurf');
const { hash, compare } = require("./bc");

const {
    requireSignature,
    requireNoSignature,
    requireLoggedOutUser,
    requireLoggedInUser
} = require("./middleware")

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

app.get("/",  (req,res) => {
    if(req.session.userId) {
        res.redirect("/login");
    }
    else {
        res.redirect("/registration");
    }
});

app.get("/registration", (req, res) => {
    if(req.session.userId){
        res.redirect("/login");
    }
    else {
        res.render("registration");
    }
});

app.post("/registration", (req, res) => {
    // console.log("req.body /register: ", req.body);
    // console.log("req.session /register: ", req.session);
    if(req.body.first_name == "") {
        res.render("registration", {error : true});
    }
    else if (req.body.last_name == ""){
        res.render("registration", {error : true});
    }
    else if(req.body.email == ""){
        res.render("registration", {error : true});
    }
    else if(req.body.password == ""){
        res.render("registration", {error : true});
    }
    else {
        hash(req.body.password)
            .then((hashed_password)=>{
                db.addUserRegData(
                    req.body.first_name,
                    req.body.last_name,
                    req.body.email,
                    hashed_password
                )
                .then(({ rows }) =>{
                    console.log("rows addUser /register: ", rows)
                    req.session.userId = rows[0].id;
                    res.redirect("/profile");// change to profile
                })
                .catch(error => {
                    console.log("error registration", error)
                    res.render("registration", {error : true})
                });
            })
            .catch((error) => {
                console.log("error registration", error)
                res.render("registration", {error : true})
            });
    }

});

app.get("/login", requireLoggedOutUser, (req, res) => {
    // req.session.userId = null;
    // req.session.signed = null;
    res.render("login");
});

app.post("/login", requireLoggedOutUser, (req, res)=> {
    if(req.body.email == ""){
        res.render("login", { error: true});
    }
    else if(req.body.password == ""){
        res.render("login", { error: true});
    }
    else if (req.body.password != ""){
        let email = req.body.email;   
        db.getHashedPassword(email)
            .then(({ rows }) => {
                let userId = rows[0].id;
                compare(req.body.password, rows[0].password)
                .then((result)=>{
                if(result){
                    req.session.userId = userId;
                    db.getIfSigned(userId)                    
                        .then(({ rows })=> {
                            console.log("signed rows: ", rows[0]);
                                req.session.sigId = rows[0].id;
                                req.session.signed = true;
                                res.redirect("/thanks");
                        })
                        .catch(error => {
                            console.log("error getIfSigned", error);
                            res.redirect("/petition");
                        })
                }
                else {
                    console.log("error");
                    res.render("login", { error: true});
                }
            })
            .catch(error => {
                console.log("error match", error);
                res.render("login", {error: true})
            })
        })
        .catch(error => {
            console.log("error match",error);
            res.render("login", {error: true})
        })

    }
    else {
        console.log("error in logIn post");
        res.render("login", {error: true})
    }
});

app.get("/petition", requireLoggedInUser, (req,res)=> {
    console.log("signed",req.session.sigId);
    if(!req.session.userId) {
        res.redirect("/registration")
        }
    else if(!req.session.signed){// signed
        res.render("petition");    
    }
    else if(req.session.sigId) {
        res.redirect("/thanks");
    }
})

app.post("/petition", (req, res) => {
    console.log("POST petition was made petition");
    console.log("req.session",req.session.signed);
    // console.log("req.body", req.body.signature); 
    const {signature} = req.body;
  
            db.addSignature(signature, req.session.userId)
                .then(({rows})=>{
                    console.log('rows petition/post: ', rows);
                    console.log("signed", req.session.sigId);
                    req.session.sigId = rows[0].id;
                    console.log("signed", req.session.sigId);
                    req.session.signed = true;
                    console.log("signed", req.session.signed);
                    res.redirect("/thanks");
                })
                .catch((error)=> {
                    console.log("error in addSignature",error);
                    res.render("petition", { error: true });
                })  
                     
});

app.get("/profile", (req, res) => {
    console.log("GET profile was made");
    if(typeof req.session.userId == "number"){
        res.render("profile");
    }
    else {
        res.redirect("/registration");
    } 
});

app.post("/profile", (req, res)=> {
    console.log("POST profile was made");

    let {url, city} = req.body;
    let age = null;
    if (req.body.age) {
        age = req.body.age;
    }
    // if (city != "") {
    //     city.toLowerCase();
    // }
    // if (city == "") {
    //     city = null;
    // }

    let userUrl = url;
    if(
        url &&
        (!url.startsWith("http://") || 
        !url.startsWith("https://"))
    ){
        userUrl = "http://" + url; 
        }
         
        db.addUserProfile(
            age, 
            city.toLowerCase(), 
            userUrl, 
            req.session.userId
            )
            .then(({rows}) => {
                res.redirect("/petition");
            })
            .catch((error) => {
                console.log("error in app/post/ addUserProfile", error);
                res.render("profile", {error: true});
        })
        
    // else {
    //     res.render("profile", {error: true})
    // }
})

app.get("/editprofile", (req, res)=>{
    console.log("user requesting GET / editprofile");
    if(typeof req.session.userId == "number"){
        db.getDataForEdit(req.session.userId)
            .then(({rows})=> {
                arrData = rows;
                res.render("editprofile",{
                    arrData
                });
            })
            .catch((error) => {
                console.log("error get/ editProfile", error);
            })
    }
    else {
        res.redirect("/registration");
    } 
})

app.post("/editprofile", (req,res)=> {
    console.log("user requesting POST / editprofile");
    const {first, last, age, url, city, email, password } = req.body;
    const userId = req.session.userId;
    console.log("userId", userId);
    if(password != ""){
        hash(password)
        .then(result =>{
            let hashPassword = result;
            return Promise.all([

            db.updatePass(
                first || null,
                last || null,
                email || null,
                hashPassword || null,
                userId
            ),
            db.updateInfo(
                age || null, 
                city.toLowerCase() || null, 
                url || null, 
                userId
                ),
            ])        
        })           
        .then(()=> {
            if(req.session.signed == true){
                res.redirect("/thanks");
            }
            else{
                res.redirect("/petition");
            }              
        })
        .catch((error) => {
                console.log("error post/ editProfile updateInfo", error);
                res.redirect("/editprofile");
        })             
    }
    else {
        db.updateNoPass(                
            first || null,
            last || null,
            email || null,
            userId
        )
        .then(()=>{
            db.updateInfo(
                age || null, 
                city.toLowerCase() || null,
                url || null,
                userId
            )
            .then(()=> {
                if(req.session.signed = "signed"){
                    res.redirect("/thanks");
                }
                else{
                    res.redirect("/petition");
                }   
            })
            .catch((error) => {
                console.log("error post/ editProfile updateInfo", error);
                res.redirect("/editprofile");
            })
        })
    }
})



app.get("/thanks", (req, res) => {
    console.log("user requesting GET / thanks");

    var signature;
    var name;
    if (!req.session.signed) {
     res.redirect("/petition");
    }
    else { 
        db.totalSigners()
        .then(({rows})=> {
        const countSigners = rows[0].count;
            db.getSignature(req.session.userId)      
                .then(({rows}) =>{                 
                    signature = rows[0].signature;                    
                    console.log("rows /thanks", rows[0].first)
                    res.render("thanks", {                       
                            signature,
                            countSigners
                    });
            })
            .catch((error) => {
                console.log("Error getSignature", error);                
            })
        })
        .catch((error) => {
                console.log("Error totalSigners", error);
        })
    }    
});

app.post("/thanks", (req, res) => {
    db.deleteSignature(req.session.userId)
        .then(() => {
            req.session.signed = null;
            signed = false;
            res.redirect("/petition");
        })
        .catch(error => {
            console.log(error);
        });
});

app.get("/signers", (req, res) => {
    console.log("user requesting GET / signers");
    if(!req.session.signed){
        res.redirect("/petition");
    }
    else {
        db.signerNames()
            .then(({rows}) => {
                console.log("result from signerNames:", rows);
                res.render("signers", {
                    arrSigners: rows
                });
            })
            .catch((error) => {
                console.log("Error from signerNames:", error);
                res.redirect("/petition");
            })
    }
});
app.get("/signers/:city", (req, res)=> {
    console.log("user requesting GET / signers/city");
    const { city } = req.params;
    let selectedCity = city;
    if(!req.session.signed){
        res.redirect("/petition");
    }
    else {
    db.getCity(city)
        .then(({rows}) => {
            res.render("signers", {
                layout:"main",
                selectedCity,
                arrSigners: rows
            });
        })
        .catch((error) => {
            console.log("error signers/city", error);
        });
    }    
})



app.get("/logout", (req, res) => {
    req.session = null;
    res.redirect("/registration");
})


app.listen(process.env.PORT || 8080, ()=> console.log("petition server is listening"));