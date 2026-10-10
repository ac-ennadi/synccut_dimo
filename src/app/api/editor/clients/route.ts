import { createClient } from '@supabase/supabase-js';
import { mockProject, mockBrief, mockDeliverable } from '@/lib/mock-data';
import { normalizeProjectStatus } from '@/lib/project-status';
import { normalizeProjectType } from '@/lib/project-type';

function getAdmin() {
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
  const editorEmail=process.env.EDITOR_EMAIL?.trim().toLowerCase();
  if(!url||!key||!editorEmail) throw new Error('Server setup is incomplete.');
  return { admin:createClient(url,key,{auth:{autoRefreshToken:false,persistSession:false}}),editorEmail };
}
async function authorize(request:Request) {
  const {admin,editorEmail}=getAdmin();
  const token=request.headers.get('authorization')?.replace(/^Bearer\s+/i,'');
  if(!token)return{error:'Please sign in as the editor.',status:401 as const};
  const{data,error}=await admin.auth.getUser(token);
  if(error||data.user?.email?.trim().toLowerCase()!==editorEmail)return{error:'Only the configured editor account can access client records.',status:403 as const};
  const{data:member,error:memberError}=await admin.from('project_members').select('email').eq('email',editorEmail).eq('role','Editor').limit(1).maybeSingle();
  if(memberError||!member)return{error:'The configured editor email must have Editor access in project_members.',status:403 as const};
  return{admin,editorEmail};
}
export async function GET(request:Request) {
  let auth:Awaited<ReturnType<typeof authorize>>;
  try{auth=await authorize(request)}catch{return Response.json({error:'Server setup is incomplete.'},{status:500})}
  if('error'in auth)return Response.json({error:auth.error},{status:auth.status});
  const{data:clients,error}=await auth.admin.from('project_members').select('project_id,email,display_name,company_name').eq('role','Client').order('company_name');
  if(error)return Response.json({error:error.message},{status:500});
  const ids=(clients??[]).map(c=>c.project_id);
  const{data:states}=ids.length?await auth.admin.from('project_portal_state').select('project_id,state').in('project_id',ids):{data:[]};
  const byId=new Map((states??[]).map(row=>[row.project_id,row.state]));
  return Response.json({clients:(clients??[]).map(client=>{const state=byId.get(client.project_id) as {project?:{status?:string;project_type?:string};deliverable?:{version_number?:string}}|undefined;const projectType=normalizeProjectType(state?.project?.project_type);return{...client,projectType,status:normalizeProjectStatus(state?.project?.status,projectType),latestCut:state?.deliverable?.version_number??'No video uploaded'}})});
}
export async function POST(request:Request) {
  let auth:Awaited<ReturnType<typeof authorize>>;
  try{auth=await authorize(request)}catch{return Response.json({error:'Server setup is incomplete.'},{status:500})}
  if('error'in auth)return Response.json({error:auth.error},{status:auth.status});
  let body:{email?:string;password?:string;name?:string;companyName?:string;projectType?:string};
  try{body=await request.json()}catch{return Response.json({error:'Invalid form data.'},{status:400})}
  const email=body.email?.trim().toLowerCase(),password=body.password??'',name=body.name?.trim(),companyName=body.companyName?.trim();
  const projectType=body.projectType==='after_effects'?'after_effects':body.projectType==='premiere_pro'?'premiere_pro':null;
  if(!email||!name||!companyName||password.length<12)return Response.json({error:'Enter client details and a password of at least 12 characters.'},{status:400});
  if(!projectType)return Response.json({error:'Choose either After Effects or Premiere Pro for this project.'},{status:400});
  if(email===auth.editorEmail)return Response.json({error:'The editor account cannot be added as a client.'},{status:400});
  const{data:created,error:createError}=await auth.admin.auth.admin.createUser({email,password,email_confirm:true,user_metadata:{name,company_name:companyName}});
  if(createError||!created.user)return Response.json({error:createError?.message||'Could not create the client account.'},{status:400});
  const projectId=`client_${created.user.id}`;
  const{error:memberError}=await auth.admin.from('project_members').insert([
    {project_id:projectId,email,role:'Client',display_name:name,company_name:companyName},
    {project_id:projectId,email:auth.editorEmail,role:'Editor',display_name:'Editor',company_name:'SyncCut'}
  ]);
  if(memberError){await auth.admin.auth.admin.deleteUser(created.user.id);return Response.json({error:memberError.code==='23505'?'That email already has project access.':memberError.message},{status:400})}
  const project={...mockProject,project_id:projectId,client_id:created.user.id,title:`Project: ${companyName}`,project_type:projectType,status:'Scripting' as const};
  const brief={...mockBrief,brief_id:`brief_${projectId}`,project_id:projectId};
  const deliverable={...mockDeliverable,deliverable_id:`deliverable_${projectId}`,project_id:projectId,video_url:'',feedback_notes:[],uploaded_at:'No video uploaded yet',action_required_by:'Editor' as const,action_banner_text:'Add the first video cut when it is ready.'};
  const{error:stateError}=await auth.admin.from('project_portal_state').insert({project_id:projectId,state:{project,brief,deliverable},updated_by:created.user.id});
  if(stateError){await auth.admin.from('project_members').delete().eq('project_id',projectId);await auth.admin.auth.admin.deleteUser(created.user.id);return Response.json({error:stateError.message},{status:500})}
  return Response.json({success:true,email,projectId},{status:201});
}
