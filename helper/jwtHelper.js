var jwt=require('jsonwebtoken');
module.exports={sign:function(id,secret) {
    return jwt.sign({_id:id},secret,{});
},
verify:async function(token,secret) {
    try{
        var data=await jwt.verify(token,secret);
        return {data};
    }catch(error){
        console.log("Error while verifying token:",error);
        return {error};
    }
}};