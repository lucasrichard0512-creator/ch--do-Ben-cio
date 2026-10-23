const {respond,requireMethod,supaFetch}=require('./_lib');
module.exports=async(req,res)=>{
  if(!requireMethod(req,res,'GET'))return;
  try{
    const items=await supaFetch('/rest/v1/gifts?select=id,total_qty,reserved_qty&active=eq.true&order=sort_order.asc');
    return respond(res,200,items);
  }catch{return respond(res,503,{error:'Lista temporariamente indisponível. Tente novamente.'});}
};
