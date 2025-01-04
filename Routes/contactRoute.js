const express = require("express");
const router = express.Router();
const { searchContacts, getContacts, getAllContact } = require("../Controllers/contactController");
const { auth } = require("../Middlewares/authMiddlewares");

router.post("/search", auth, searchContacts);
router.get("/get-contacts", auth, getContacts);
router.get("/get-all-contacts", auth, getAllContact);

module.exports = router;
