const {respond,requireMethod,body,supaFetch,guardAdmin}=require('./_lib');
module.exports=async(req,res)=>{
 if(!requireMethod(req,res,'POST'))return;
 let payload;try{payload=body(req);}catch{return respond(res,400,{error:'Dados inválidos.'});}
 const refresh=String(payload.refresh_token||'');
 if(refresh.length<10||refresh.length>3000)return respond(res,401,{error:'Sessão inválida.'});
 try{
   const identity=await supaFetch('/auth/v1/token?grant_type=refresh_token',{method:'POST',data:{refresh_token:refresh},anonAuth:true});
   const admin=await guardAdmin(identity.access_token);
   if(!admin)return respond(res,403,{error:'Acesso restrito.'});
   return respond(res,200,{access_token:identity.access_token,refresh_token:identity.refresh_token,expires_in:identity.expires_in});
 }catch{return respond(res,401,{error:'Sessão expirada. Entre novamente.'});}
};
