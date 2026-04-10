import ChatHistory from '../models/ChatHistory.js';

export const deleteChatMessage = async (req, res, next) => {
  try {
    const { documentId, messageIndex } = req.body;
    const { userId } = req.user;

    if (!documentId || messageIndex === undefined) {
      return res.status(400).json({
        success: false,
        error: 'documentId and messageIndex required',
        statusCode: 400
      });
    }

    const chatHistory = await ChatHistory.findOne({
      userId,
      documentId
    });

    if (!chatHistory) {
      return res.status(404).json({
        success: false,
        error: 'Chat history not found',
        statusCode: 404
      });
    }

    // Remove message by index (delete specific message)
    chatHistory.messages.splice(messageIndex, 1);
    await chatHistory.save();

    res.status(200).json({
      success: true,
      data: { remaining: chatHistory.messages.length },
      message: 'Message deleted permanently'
    });
  } catch (error) {
    next(error);
  }
};

export const clearChatHistory = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const { userId } = req.user;

    const result = await ChatHistory.findOneAndUpdate(
      { userId, documentId },
      { messages: [] },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: result || { messages: [] },
      message: 'Chat history cleared'
    });
  } catch (error) {
    next(error);
  }
};

