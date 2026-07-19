const Message = require("../models/Message");
const User = require("../models/User");

// @desc    Get chat history with a specific user
// @route   GET /api/chat/:userId
// @access  Private
const getChatHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const myId = req.user._id;

    // Verify the other user exists
    const otherUser = await User.findById(userId);
    if (!otherUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const messages = await Message.find({
      $or: [
        { sender: myId, receiver: userId },
        { sender: userId, receiver: myId }
      ]
    }).sort({ createdAt: 1 });

    // Mark messages from the other user as read
    await Message.updateMany(
      { sender: userId, receiver: myId, isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json(messages);
  } catch (error) {
    console.error("Get Chat History Error:", error);
    res.status(500).json({ message: "Server error fetching chat history" });
  }
};

// @desc    Get all conversations for the current user (Inbox)
// @route   GET /api/chat
// @access  Private
const getConversations = async (req, res) => {
  try {
    const myId = req.user._id;

    // Fetch all messages where user is involved, latest first
    const messages = await Message.find({
      $or: [{ sender: myId }, { receiver: myId }]
    })
    .sort({ createdAt: -1 })
    .populate('sender', 'name avatar')
    .populate('receiver', 'name avatar');

    const conversationsMap = new Map();

    messages.forEach((msg) => {
      const isSender = msg.sender._id.toString() === myId.toString();
      const otherUser = isSender ? msg.receiver : msg.sender;
      if (!otherUser) return; // In case of deleted user
      
      const otherId = otherUser._id.toString();

      if (!conversationsMap.has(otherId)) {
        conversationsMap.set(otherId, {
          user: otherUser,
          latestMessage: msg,
          unreadCount: 0
        });
      }

      if (!isSender && !msg.isRead) {
        conversationsMap.get(otherId).unreadCount++;
      }
    });

    const conversations = Array.from(conversationsMap.values());
    res.status(200).json(conversations);
  } catch (error) {
    console.error("Get Conversations Error:", error);
    res.status(500).json({ message: "Server error fetching conversations" });
  }
};

module.exports = {
  getChatHistory,
  getConversations
};
