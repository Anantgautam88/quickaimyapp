import sql from "../configs/db.js";

export const getUserCreations = async (req,res) => {
    try{

        const {userId} =req.auth();


      const creations=  await sql `SELECT * FROM creations WHERE user_id = ${userId} order by created_at DESC`;
      res.json({success:true,creations})
    } catch(error) {
        res.json({success:false,message:error.message})
    }
}
  

export const getPublishCreations = async (req,res) => {
    try{

        const {userId} =req.auth();


      const creations=  await sql `SELECT * FROM creations WHERE publish=true  order by created_at DESC`;
      res.json({success:true,creations})
    } catch(error) {
        res.json({success:false,message:error.message})
    }
}
export const toggleLikeCreation = async (req,res) => {
    try{

        const {userId} =req.auth();
        const {id}=req.body;
        const [creation] = await sql `SELECT * FROM creations WHERE id = ${id}`;
        if(!creation) {
            return res.json({success:false,message:"creation not found"});
        }
        const currentlikes=creation.likes;
        const userIdStr=userId.toString();
        let updatedlikes;
        let message;

        if(currentlikes.includes(userIdStr)) {
            updatedlikes=currentlikes.filter((user)=>user!=userIdStr);
            message="unliked";
        }
        else {
            updatedlikes=[...currentlikes,userIdStr];
            message="creation liked"
        }
        const formattedArray= `{${updatedlikes.join(',')}}`

        await sql `UPDATE creations SET likes = ${formattedArray}::text[] WHERE id = ${id}`;


      
      res.json({success:true,message})
    } catch(error) {
        res.json({success:false,message:error.message})
    }
}