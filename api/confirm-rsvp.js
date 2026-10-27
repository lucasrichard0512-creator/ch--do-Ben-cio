const {respond,requireMethod,body,cleanName,cleanPhone,supaFetch,ownerNotice}=require('./_lib');
module.exports=async(req,res)=>{
  if(!requireMethod(req,res,'POST'))return;
  let payload;try{payload=body(req);}catch{return respond(res,400,{error:'Dados inválidos.'});}
  const name=cleanName(payload.name),phone=cleanPhone(payload.phone),count=Number(payload.guestsCount);
  const message=String(payload.message||'').trim();
  if(name.length<2||name.length>80||!phone||!Number.isInteger(count)||count<1||count>15||message.length>300)
    return respond(res,400,{error:'Confira o nome, o WhatsApp e o número de pessoas.'});
  let result;
  try{
    result=await supaFetch('/rest/v1/rpc/confirm_rsvp_v12',{method:'POST',data:{p_guest_name:name,p_guest_phone:phone,p_attending:true,p_guests_count:count,p_message:message,p_reminder_opt_in:false}});
  }catch{return respond(res,503,{error:'Não foi possível confirmar agora. Tente novamente.'});}
  const action=result.updated?'Atualização de presença':'Nova presença confirmada';
  try{
    await ownerNotice(`💙 ${action}: ${name}`,`Chá do Benício\n\nConvidado: ${name}\nWhatsApp: +${phone}\nPessoas (incluindo convidado): ${count}\nRecado: ${message||'(nenhum)'}\nConfira em /admin.html`, 'rsvp',`${result.id}-${result.version||'new'}`);
  }catch{console.warn('Falha ao processar a notificação após confirmar presença.');}
  return respond(res,200,{ok:true,updated:!!result.updated});
};
