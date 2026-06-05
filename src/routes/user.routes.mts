import { Router } from "express";
import { sanitize } from "../services/utils.mts";
import userService from "../services/user.service.mts";
import CustomError from "../errors/CustomError.mts";
import  authorize from "../middleware/authorize.mts"
const router: Router = Router();

router.post('/login', async (req, res, next) => {
    try {
    // get the email and password from the body of the request
  const cleanBody = sanitize(req.body)
  // sanitize them
  const {email, password} = cleanBody;
  

  // call the service function, pass in the email and password.
  // the service function should return a valid user and token  or null for either
  const results = await userService.login(email, password);
  // forward a 401 error if either is null
  if (results.user == null || results.token == null) {
    // This is an example you can refer to about how to handle errors in our routes
    // If you check the middleware folder you will see a general error handler that will get called automatically when we throw like this
    return next(new CustomError({message : 'Not authorized', code: 'ERR_NF',
    statusCode : 401}))
  }
   
    // if both values exist, Send back the token and some user info in the response 
    // { token, user: { _id: user._id, email: user.email, name: user.name } }
    res.status(200).json(results);
} catch(err) {
    next(err);
}
});

router.post("/", async (req,res,next) => {
    try {
     const cleanBody = sanitize(req.body)
     const {email, name, password} = cleanBody;

    const newUser = await userService.register(email, password, name)
    res.status(200).json({message:"User created successfully", userId: newUser.insertedId});
    } catch(err) {
        next(err)
    }
 
})

// Protect a route with JWT authentication. Note the authorize middleware! Make sure to import it as well.
router.get('/protected', authorize, (req, res) => {
    console.log(res.locals.user)
    res.json({ message: `Hello, ${res.locals.user.email}!` });
});

export default router; // Export the router to use it in the main file