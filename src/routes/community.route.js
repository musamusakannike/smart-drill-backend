const express = require("express");
const {
  createCommunity,
  joinCommunity,
  postMessage,
  getCommunities,
  getCommunityMessages,
  getAllCommunities,
  deleteCommunity,
  editCommunity,
} = require("../controllers/community.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");

const router = express.Router();

router.put("/:communityId/join", authenticate, joinCommunity);
router.post("/:communityId/chat", authenticate, postMessage);
router.get("/", authenticate, getCommunities);
router.get("/:communityId/messages", authenticate, getCommunityMessages);

// Admin routes
router.post("/", authenticate, authorize("admin"), createCommunity);
router.get("/all", authenticate, authorize("admin"), getAllCommunities);
router.delete("/:communityId", authenticate, authorize("admin"), deleteCommunity);
router.put("/:communityId", authenticate, authorize("admin"), editCommunity);

module.exports = router;
