const {respond,requireMethod,guardAdmin,pageAll,supaFetch}=require('./_lib');
module.exports=async(req,res)=>{
 if(!requireMethod(req,res,'GET'))return;
 const auth=String(req.headers.authorization||'');const token=auth.startsWith('Bearer ')?auth.slice(7):'';
 const admin=await guardAdmin(token);
 if(!admin)return respond(res,401,{error:'Acesso não autorizado.'});
 try{
   const [rsvps,reservations,notifications,gifts]=await Promise.all([
     pageAll('rsvps','id,guest_name,guests_count,attending,message,created_at,updated_at'),
     pageAll('gift_reservations','id,gift_id,guest_name,quantity,created_at'),
     pageAll('notification_logs','id,event_type,source_id,status,created_at,detail'),
     supaFetch('/rest/v1/gifts?select=id,name,total_qty,reserved_qty&active=eq.true&order=sort_order.asc')
   ]);
   return respond(res,200,{rsvps,reservations,notifications,gifts});
 }catch{return respond(res,503,{error:'Não foi possível carregar o painel. Verifique as tabelas no Supabase.'});}
};
