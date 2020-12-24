const supertest = require('supertest');
const { app } = require('./index.js');
const cookieSession = require('cookie-session');




test("Get/302 redirect to registration when user logged OUT and try to get to petitionpage ", () => {
    cookieSession.mockSessionOnce({
        userId: null
    })
    return supertest(app)
    .get("/petition")
        .then((res) => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe("/registration");
    })
});


test("Get/302 redirect to petition when user logged IN and try to get to registration", () => {
    cookieSession.mockSessionOnce({
        userId: '12'
    });
    return supertest(app)
    .get("/login")
        .then((res) => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe("/petition");
    })
});


test("Get/302 redirect to thanks when user logged IN and have signed try to get to petition", () => {
    cookieSession.mockSessionOnce({
        userId: '12'
    });
    return supertest(app)
    .get("/petition")
        .then((res) => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe("/thanks");
    })
});

test("Get/302 redirect to petition when user logged IN and have not signed and try to get to signers", () => {
    cookieSession.mockSessionOnce({
        userId: '12'
    });
    return supertest(app)
    .get("/signers")
        .then((res) => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe("/petition");
    })
});