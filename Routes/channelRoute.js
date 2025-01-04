const { Router } = require("express");
const { createChannel, getAllChannels, getChannelMessages } = require('../Controllers/channelControllers.js')
const { auth } = require("../Middlewares/authMiddlewares.js");

const router = Router();

router.post("/create-channel", auth, createChannel);
router.get("/get-channel", auth, getAllChannels);
router.get("/get-channel-messages/:channelId", auth, getChannelMessages);

module.exports = router;
