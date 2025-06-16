import UserModel from '../models/user.models.model.js'


const userProfile = async (req, res) => {

         const userid = req.params.id ; 

if(!userid){
   return  res.status(400).json({msg : "invalid user id provided"}); 
}

     const user = await UserModel.findById(userid); 
     
if (!user) {
   return res.status(404).json({msg : "user doesnt exists"});
}


res.status(200).json({  
 msg: "user profile" ,
    success :true , 
 data : user
})



}




export {
userProfile ,

}