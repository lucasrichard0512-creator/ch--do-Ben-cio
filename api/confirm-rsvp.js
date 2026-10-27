const {randomUUID}=require('node:crypto');
const {respond,requireMethod,body,cleanName,supaFetch,ownerNotice}=require('./_lib');
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
module.exports=async(req,res)=>{
  if(!requireMethod(req,res,'POST'))return;
  let payload;try{payload=body(req);}catch{return respond(res,400,{error:'Dados inválidos.'});}
  const name=cleanName(payload.name),count=Number(payload.guestsCount);
  const message=String(payload.message||'').trim();
  if(name.length<2||name.length>80||!Number.isInteger(count)||count<1||count>15||message.length>300)
    return respond(res,400,{error:'Confira o nome e o número de pessoas.'});
  // Preserva a confirmação anterior deste navegador, sem coletar telefone.
  const id=UUID.test(String(payload.rsvpId||''))?String(payload.rsvpId):randomUUID();
  let records;
  try{
    records=await supaFetch('/rest/v1/rsvps?on_conflict=id',{method:'POST',data:{
      id,guest_name:name,guest_phone:null,attending:true,guests_count:count,
      message,reminder_opt_in:false,updated_at:new Date().toISOString()
    },extraHeaders:{Prefer:'resolution=merge-duplicates,return=representation'}});
    if(!Array.isArray(records)||!records[0]?.id)throw new Error('Confirmação não retornada');
  }catch{return respond(res,503,{error:'Não foi possível confirmar agora. Tente novamente.'});}
  try{
    await ownerNotice(`💙 Presença confirmada: ${name}`,`Chá do Benício\n\nConvidado: ${name}\nPessoas (incluindo convidado): ${count}\nRecado: ${message||'(nenhum)'}\nConfira em /admin.html`, 'rsvp',id+'-'+Date.now());
  }catch{console.warn('Falha ao processar a notificação após confirmar presença.');}
  return respond(res,200,{ok:true,id});
};
