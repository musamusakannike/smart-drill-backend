const express = require("express");
const {
  createCommunity,
  joinCommunity,
  postMessage,
  getCommunities,
  getCommunityMessages,
} = require("../controllers/community.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/", authenticate, authorize("admin"), createCommunity);
router.put("/:communityId/join", authenticate, joinCommunity);
router.post("/:communityId/chat", authenticate, postMessage);
router.get("/", authenticate, getCommunities);
router.get("/:communityId/messages", authenticate, getCommunityMessages);

module.exports = router;
