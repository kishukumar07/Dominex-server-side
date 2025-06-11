import { Router }  from "express";



const router=Router(); 


router.post('/register'); 
router.post('login',login); 
router.post('logout',logout); 


export default router;