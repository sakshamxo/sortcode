const express = require("express");
const router = express.Router();
const {
    homepage,
    signup,
    signin,
    signout,
    currentuser,
    upload,
    itemcreate,
    itemfil,
    itemupdate,
    deleteitem,
    showitems
} = require("../controllers/indexController");
const { isLoggedIn } = require("../utils/auth");

router.get("/", homepage);
// router.route("/").get(homepage);

router.get("/loaduser", isLoggedIn, currentuser);

// post /signup - create user
router.post("/signup", signup);

// post /signin - login user
router.post("/signin", signin);

// get /signout - logout user
router.get("/signout", isLoggedIn, signout);

//post /item - create item
router.post("/itemcreate", isLoggedIn, itemcreate)

//get /itemfilter - filter item
router.get('/itemfilter',isLoggedIn,itemfil)

//get /itemupdate/:id - update item
router.post('/itemupdate',isLoggedIn,itemupdate)

//get /itemdelete/:id - delete item
router.get('/itemdelete',isLoggedIn,deleteitem)

//get /showitems - show all items
router.get('/showitem',isLoggedIn,showitems)

module.exports = router;