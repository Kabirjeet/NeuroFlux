import express from 'express';
import protect from '../middleware/auth.js';
import { deleteChatMessage, clearChatHistory } from '../controllers/chatController.js';

const router = express.Router();

router.use(protect);

// Delete specific message
router.post('/delete-message', deleteChatMessage);

// Clear entire history for document
router.delete('/:documentId', clearChatHistory);

export default router;
// </xai:function_call name="create_file">

// <xai:function_call name="edit_file">
// <parameter name="path">Backend/server.js
