// asyncHandler is a wrapper to catch errors in async functions.


// const asyncHandler = () =>{}
// const asyncHandler = (func) =>()=>{}
// const asyncHandler = (func) => async ()=>{}

// const asyncHandler=(func)=> async(req,res,next)=>{
//     try {
//         await func(req,res,next);
//     } 
//     catch (error) {
//         res.status(error.code || 500).json({
//             success:false,
//             message: error.message
//         })
//     }
// }

// app.get('/user/:id', async (req, res) => {
//     const user = await User.findById(req.params.id); // if error happens, app crashes
//     res.json(user);
// });

//in this case error is handled in the route handler itself
// app.get('/user/:id', asyncHandler(async (req, res) => {
//     const user = await User.findById(req.params.id);
//     res.json(user);
// }));


//using Promise
// import {app} from '../app.js';
const asyncHandler = (requestHandler)=>{
    return (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next)).
        catch((err)=>next(err))
    }
}
// app.get('/user/:id', asyncHandler(async (req, res) => {
//     const user = await user.findById(req.params.id);
//     res.json(user);
// }));
//in this case error is handled in the middleware itself
//requestHandler is expected to be an Express async route function like:async (req, res, next) => { ... }
//Calls the original requestHandler function
// Wraps it with Promise.resolve(...)
// If it throws an error or rejects, it is caught with .catch(...)
// The error is passed to Express using next(err)
export {asyncHandler}