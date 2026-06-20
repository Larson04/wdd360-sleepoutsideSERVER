import { Router } from "express";
import { sanitize } from "../services/utils.mts";
import newsletterService from "../services/newsletter.service.mts";
import CustomError from "../errors/CustomError.mts";

const router: Router = Router();

// This now correctly handles POST /api/v1/newsletter
router.post('/', async (req, res, next) => {
    try {
        
        const cleanBody = sanitize(req.body);
        const { email, name } = cleanBody;
        
        const results = await newsletterService.signup(email, name);
        
        if (results.insertedId == null) {
            return next(new CustomError({ message: 'Not registered', code: 'ERR_NF', statusCode: 401 }));
        }
        
        res.status(200).json(results);
    } catch(err) {
        next(err);
    }
});

export default router;