const {respond,requireMethod,body,cleanName,supaFetch,ownerNotice}=require('./_lib');
module.exports=async(req,res)=>{
  if(!requireMethod(req,res,'POST'))return;
  let payload;try{payload=body(req);}catch{return respond(res,400,{error:'Dados inválidos.'});}
  const name=cleanName(payload.name),quantity=Number(payload.quantity),giftId=String(payload.giftId||'');
  if(name.length<2||name.length>80||!Number.isInteger(quantity)||quantity<1||quantity>50||! /^[a-z0-9-]{2,45}$/.test(giftId))
    return respond(res,400,{error:'Confira o nome e a quantidade.'});
  let result;
  try{
    result=await supaFetch('/rest/v1/rpc/reserve_gift',{method:'POST',data:{p_gift_id:giftId,p_guest_name:name,p_quantity:quantity}});
  }catch(error){
    const err=String(error.message||'');
    if(err.includes('PRESENTE_ESGOTADO'))return respond(res,409,{error:'Este presente acabou de ser reservado por outra pessoa.'});
    if(err.includes('PRESENTE_INEXISTENTE'))return respond(res,404,{error:'Presente não encontrado.'});
    if(err.includes('DADOS_INVALIDOS'))return respond(res,400,{error:'Dados inválidos.'});
    return respond(res,503,{error:'Não foi possível reservar agora. Tente novamente.'});
  }
  // A reserva já foi confirmada no banco. Falha ao obter nome do item ou enviar e-mail não desfaz a reserva.
  let giftName=giftId;
  try{
    const gifts=await supaFetch(`/rest/v1/gifts?select=name&id=eq.${giftId}&limit=1`);
    giftName=gifts?.[0]?.name||giftId;
  }catch{console.warn('Não foi possível buscar o nome do presente para o email.');}
  try{
    await ownerNotice('🎁 Presente reservado: '+giftName,`Chá do Benício\n\nConvidado: ${name}\nPresente: ${giftName}\nQuantidade: ${quantity}\nConfira os detalhes em /admin.html`, 'gift',result.reservation_id||giftId+'-'+name);
  }catch{console.warn('Falha ao processar a notificação após salvar a reserva.');}
  return respond(res,200,{ok:true,remaining:result.remaining});
};
