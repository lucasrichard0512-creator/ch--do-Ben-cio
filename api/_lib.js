/* Rotas privadas do convite. Nunca importar este módulo no navegador. */
const BASE = () => String(process.env.SUPABASE_URL || '').replace(/\/$/, '');
const SERVICE = () => process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANON = () => process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;

function respond(res, status, data) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  return res.status(status).json(data);
}
function requireMethod(req, res, method) {
  if (req.method !== method) { respond(res, 405, { error: 'Método não permitido.' }); return false; }
  return true;
}
function body(req) { return typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {}); }
function cleanName(value) { return String(value || '').trim().replace(/\s+/g, ' ').slice(0, 81); }
function cleanPhone(value) {
  let p = String(value || '').replace(/\D/g, '');
  if (p.startsWith('55') && (p.length === 12 || p.length === 13)) p = p.slice(2);
  if (!/^[1-9][0-9]{9,10}$/.test(p)) return null;
  return '55' + p;
}
async function supaFetch(endpoint, { method = 'GET', data, userToken, anonAuth=false, extraHeaders={} } = {}) {
  if (!BASE() || !SERVICE()) throw new Error('Supabase não configurado no servidor.');
  const key = anonAuth ? ANON() : SERVICE();
  if (!key) throw new Error('Chave do Supabase não configurada.');
  const headers = { apikey:key, ...extraHeaders };
  // As chaves sb_secret_ / sb_publishable_ são opacas, não JWT.
  if (userToken) headers.Authorization='Bearer '+userToken;
  else if (key.startsWith('eyJ')) headers.Authorization='Bearer '+key;
  if (data !== undefined) headers['Content-Type']='application/json';
  let resp;
  try { resp=await fetch(BASE()+endpoint, { method,headers,body:data===undefined?undefined:JSON.stringify(data), signal:AbortSignal.timeout(13000) }); }
  catch { throw new Error('Não foi possível conectar ao banco de dados.'); }
  const raw=await resp.text(); let parsed;
  try { parsed=JSON.parse(raw); } catch { parsed=raw; }
  if (!resp.ok) {
    console.error('[supabase]',resp.status,typeof parsed==='object'?parsed.code:'',endpoint.split('?')[0]);
    const er=new Error((parsed&&parsed.message)||'Erro no Supabase');er.status=resp.status;throw er;
  }
  return parsed;
}
async function ownerNotice(subject, message, eventType, sourceId) {
  const { RESEND_API_KEY, OWNER_EMAIL, EMAIL_FROM }=process.env;
  if (!RESEND_API_KEY || !OWNER_EMAIL || !EMAIL_FROM) {
    console.warn('Aviso ao organizador não enviado: RESEND_API_KEY, OWNER_EMAIL ou EMAIL_FROM ausente.');
    await logNotice(eventType,sourceId,'not_configured','Email não configurado');
    return false;
  }
  let ok=false,detail='';
  try {
    const response=await fetch('https://api.resend.com/emails',{
      method:'POST',
      headers:{'Content-Type':'application/json',Authorization:'Bearer '+RESEND_API_KEY,'Idempotency-Key':`benicio-${eventType}-${sourceId}`},
      body:JSON.stringify({from:EMAIL_FROM,to:[OWNER_EMAIL],subject,text:message}),
      signal:AbortSignal.timeout(12000)
    });
    ok=response.ok;detail=ok?'Solicitação aceita pelo serviço de email':`Erro ${response.status}`;
  } catch (error) {detail='Falha de conexão no serviço de email';}
  await logNotice(eventType,sourceId,ok?'accepted':'failed',detail);
  return ok;
}
async function logNotice(type,id,status,detail) {
  try { await supaFetch('/rest/v1/notification_logs',{method:'POST',data:{event_type:type,source_id:id,status,detail:detail.slice(0,300)},extraHeaders:{Prefer:'return=minimal'}}); }
  catch (e){console.warn('Não foi possível registrar o status da notificação.');}
}
async function guardAdmin(token) {
  if (!token || token.length>3000) return null;
  try {
    const identity=await supaFetch('/auth/v1/user',{userToken:token,anonAuth:true});
    if (!identity?.id) return null;
    const admins=await supaFetch(`/rest/v1/admin_users?select=user_id&user_id=eq.${encodeURIComponent(identity.id)}&limit=1`);
    return Array.isArray(admins)&&admins.length>0?identity:null;
  } catch {return null;}
}
async function pageAll(table,fields,extra=''){
  const out=[];
  for(let offset=0;offset<5000;offset+=500){
    const query=`/rest/v1/${table}?select=${fields}&order=created_at.desc&limit=500&offset=${offset}${extra}`;
    const rows=await supaFetch(query);
    if(!Array.isArray(rows)) throw new Error('Formato inesperado do banco');
    out.push(...rows);if(rows.length<500)break;
  }
  return out;
}
module.exports={respond,requireMethod,body,cleanName,cleanPhone,supaFetch,ownerNotice,guardAdmin,pageAll};
