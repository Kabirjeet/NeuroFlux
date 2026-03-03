import Flashcard from "../models/Flashcard.js";

// @desc Get all flashcards for a document
// @route GET /api/flashcards/:documentId
// @access Private

export const getFlashcards = async(req, res, next) =>{
    try{
        const flashcards = await Flashcard.find({ 
            userId: req.user._id,
            documentId: req.params.documentId
        })
        .populate('documentId', 'title fileName')
        .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: flashcards.length,
            data: flashcards
        });

    } catch(error){
        next(error);
    }
};

// @desc Get all flashcard sets for a user
// @route GET /api/flashcards
// @access Private

export const getAllFlashcardsSets = async(req, res, next) =>{
    try{
        const flashcardSets = await Flashcard.find({
            userId: req.user._id
        })
        .populate('documentId', 'title')
        .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: flashcardSets.length,
            data: flashcardSets
        });
    } catch(error){
        next(error);
    }
};

// @desc Mark flashcard as reviewed
// @route POST /api/flashcards/:cardId/review
// @access Private

export const reviewFlashcard = async(req, res, next) =>{
    try{
        const flashcard = await Flashcard.findOne({
            'cards._id': req.params.cardId,
            userId: req.user._id
        });

        if(!flashcard){
            return res.status(404).json({
                success: false,
                error: 'Flashcard not found',
                statusCode: 404
            });
        }

        const cardIndex = flashcard.cards.findIndex(card => card._id.toString() === req.params.cardId);
        
        if(cardIndex === -1){
            return res.status(404).json({
                success: false,
                error: 'Flashcard not found',
                statusCode: 404
            });
        }

        // Update review info
        flashcard.cards[cardIndex].lastReviewed = new Date();
        flashcard.cards[cardIndex].reviewCount += 1;

        await flashcard.save();

        res.status(200).json({
            success: true,
            data: flashcard.cards[cardIndex],
            message: 'Flashcard reviewed successfully'
        });

    } catch(error){
        next(error);
    }
};

// @desc Toggle star on flashcard
// @route PUT /api/flashcards/:cardId/star
// @access Private

export const toggleStarFlashcard = async(req, res, next) =>{
    try{
        const flashcard = await Flashcard.findOne({
            'cards._id': req.params.cardId,
            userId: req.user._id
        });

        if(!flashcard){
            return res.status(404).json({
                success: false,
                error: 'Flashcard not found',
                statusCode: 404
            });
        }

        const cardIndex = flashcard.cards.findIndex(card => card._id.toString() === req.params.cardId);
        
        if(cardIndex === -1){
            return res.status(404).json({
                success: false,
                error: 'Flashcard not found',
                statusCode: 404
            });
        }

        // Toggle star
        flashcard.cards[cardIndex].isStarred = !flashcard.cards[cardIndex].isStarred;

        await flashcard.save();

        res.status(200).json({
            success: true,
            data: flashcard.cards[cardIndex],
            message: `Flashcard ${flashcard.cards[cardIndex].isStarred ? 'starred' : 'unstarred'} successfully`
        });

    } catch(error){
        next(error);
    }
};

// @desc Delete flashcard set
// @route DELETE /api/flashcards/:id
// @access Private

export const deleteFlashcardSet = async(req, res, next) =>{
    try{
        const flashcardcardSet = await Flashcard.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if(!flashcardcardSet){
            return res.status(404).json({
                success: false,
                error: 'Flashcard set not found',
                statusCode: 404
            });
        }

        await flashcardcardSet.deleteOne({_id: req.params.id});

        res.status(200).json({
            success: true,
            message: 'Flashcard set deleted successfully'
        });

    } catch(error){
        next(error);
    }
};

