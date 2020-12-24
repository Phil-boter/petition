exports.requireLoggedInUser = (req, res, next) => {
    if(
        !req.session.userId &&
        req.url != "/registration" &&
        req.url != "/login"
    ) {
        res.redirect("/registration");
    }
    else {
        next();
    }
};

exports.requireLoggedOutUser = (req, res, next) => {
    if(req.session.id) {
        res.redirect("/petition");
    }
    else {
        next();
    }
};

exports.requireSignature = (req, res, next) => {
    if(!req.session.signed) {
        res.redirect("/petition");
    }
    else {
        next();
    }
};

exports.requireNoSignature = (req, res, next) => {
    if(req.session.sigId) {
        res.redirect("/thanks");
    }
    else {
        next();
    }
};