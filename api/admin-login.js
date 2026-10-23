const {respond,requireMethod,body,supaFetch,guardAdmin}=require('./_lib');
module.exports=async(req,res)=>{
 if(!requireMethod(req,res,'POST'))return;
 let payload;try{payload=body(req);}catch{return respond(res,400,{error:'Dados inválidos.'});}
 const email=String(payload.email||'').trim().slice(0,254),password=String(payload.password||'');
 if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)||password.length<8||password.length>256)return respond(res,401,{error:'Dados de acesso inválidos.'});
 try{
   const identity=await supaFetch('/auth/v1/token?grant_type=password',{method:'POST',data:{email,password},anonAuth:true});
   const admin=await guardAdmin(identity.access_token);
   if(!admin)return respond(res,403,{error:'Acesso restrito ao organizador.'});
   return respond(res,200,{access_token:identity.access_token,refresh_token:identity.refresh_token,expires_in:identity.expires_in});
 }catch{return respond(res,401,{error:'E-mail ou senha inválidos.'});}
};
