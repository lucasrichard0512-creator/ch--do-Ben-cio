const {respond,requireMethod,safeEqual,supaFetch,localDateBrazil,whatsappTemplate}=require('./_lib');
const EVENT_DATE='2026-11-28';
module.exports=async(req,res)=>{
 if(!requireMethod(req,res,'GET'))return;
 if(!process.env.CRON_SECRET || !safeEqual(req.headers.authorization,'Bearer '+process.env.CRON_SECRET))
    return respond(res,401,{error:'Não autorizado.'});
 const today=localDateBrazil(new Date());
 const days=Math.round((Date.parse(EVENT_DATE+'T00:00:00Z')-Date.parse(today+'T00:00:00Z'))/86400000);
 if(days!==1)return respond(res,200,{ok:true,today,scheduled:false,message:'Fora do dia do lembrete.'});
 if(!process.env.META_WHATSAPP_TOKEN||!process.env.META_PHONE_NUMBER_ID||!process.env.WHATSAPP_TEMPLATE_NAME)
    return respond(res,503,{error:'Credenciais da API oficial WhatsApp ou modelo aprovado ainda não configurados.'});
 let rsvps;
 try{rsvps=await supaFetch('/rest/v1/rsvps?select=id,guest_name,guest_phone,reminder_opt_in,attending&attending=eq.true&reminder_opt_in=eq.true&guest_phone=not.is.null&limit=1000');}
 catch{return respond(res,503,{error:'Falha ao consultar convidados.'});}
 let accepted=0,failed=0,skipped=0;
 for(const item of rsvps){
   try{
     const exists=await supaFetch(`/rest/v1/reminder_deliveries?select=id,status&rsvp_id=eq.${item.id}&reminder_key=eq.1day&limit=1`);
     if(exists.length){skipped++;continue;}
     // Reserva uma linha antes do envio: duas execuções simultâneas não enviam em duplicidade.
     const inserted=await supaFetch('/rest/v1/reminder_deliveries?on_conflict=rsvp_id,reminder_key',{
       method:'POST',data:{rsvp_id:item.id,reminder_key:'1day',status:'processing'},
       extraHeaders:{Prefer:'resolution=ignore-duplicates,return=representation'}
     });
     if(!inserted.length){skipped++;continue;}
     try{
       await whatsappTemplate(item.guest_phone,item.guest_name);
       await supaFetch(`/rest/v1/reminder_deliveries?id=eq.${inserted[0].id}`,{method:'PATCH',data:{status:'accepted',delivered_at:new Date().toISOString()},extraHeaders:{Prefer:'return=minimal'}});
       accepted++;
     }catch(error){
       failed++;console.error('Falha de envio do lembrete',item.id,error.message);
       await supaFetch(`/rest/v1/reminder_deliveries?id=eq.${inserted[0].id}`,{method:'PATCH',data:{status:'failed'},extraHeaders:{Prefer:'return=minimal'}});
     }
   }catch(error){failed++;console.error('Erro de controle de lembretes',error.message);}
 }
 return respond(res,200,{ok:true,scheduled:true,today,accepted,failed,skipped});
};
