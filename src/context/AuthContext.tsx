'use client';
import React,{createContext,useCallback,useContext,useEffect,useMemo,useRef,useState}from'react';
import type{User as SupabaseUser}from'@supabase/supabase-js';
import{User,UserRole}from'@/types';
import{isSupabaseConfigured,signInWithPassword,signOutAndClearCaches,supabase}from'@/lib/supabase';

interface AuthContextType{
  currentUser:User|null;
  /** True until we know whether a session exists AND who it belongs to. */
  isLoading:boolean;
  signIn:(email:string,password:string,role:UserRole)=>Promise<{success:boolean;error?:string}>;
  logout:()=>void;
  isEditor:boolean;
  isClient:boolean;
}
const AuthContext=createContext<AuthContextType|undefined>(undefined);

// Keeps the membership lookup off the critical path when moving between pages.
// Cleared on every sign-in and sign-out.
const appUserCache=new Map<string,User>();

export const AuthProvider:React.FC<{children:React.ReactNode}>=({children})=>{
 const[currentUser,setCurrentUser]=useState<User|null>(null);
 const[isLoading,setIsLoading]=useState(true);
 // Suppresses the session listener while sign-in does its own user lookup, so
 // isLoading is never cleared before currentUser is known.
 const signingIn=useRef(false);

 useEffect(()=>{
  let mounted=true;
  const apply=async(authUser:SupabaseUser)=>{
   try{
    const user=await buildAppUser(authUser);
    if(mounted)setCurrentUser(user);
   }catch(error){
    console.error('This Supabase account is not assigned to a SyncCut project.',error);
    await signOutAndClearCaches();
    if(mounted)setCurrentUser(null);
   }
  };

  const restore=async()=>{
   try{
    if(isSupabaseConfigured){
     const{data}=await supabase.auth.getSession();
     // A stored session only counts once its membership resolves, otherwise a
     // valid user would be bounced to the login page while the lookup runs.
     if(data.session?.user){await apply(data.session.user);return}
    }
    if(mounted)setCurrentUser(null);
   }catch(error){
    console.error('Failed to restore the Supabase session.',error);
    if(mounted)setCurrentUser(null);
   }finally{
    if(mounted)setIsLoading(false);
   }
  };
  void restore();

  const{data:{subscription}}=supabase.auth.onAuthStateChange((_event,session)=>{
   // A token refresh re-emits the session; that must not restart the lookup.
   if(signingIn.current)return;
   if(!session?.user){
    appUserCache.clear();
    if(mounted){setCurrentUser(null);setIsLoading(false)}
    return;
   }
   // Deferred: Supabase warns against awaiting other calls inside this callback.
   setTimeout(()=>{void apply(session.user)},0);
  });
  return()=>{mounted=false;subscription.unsubscribe()}
 },[]);

 const signIn=useCallback(async(email:string,password:string,role:UserRole)=>{
  signingIn.current=true;
  setIsLoading(true);
  try{
   const{user}=await signInWithPassword(email.trim(),password);
   if(!user)throw new Error('Supabase did not return an authenticated user.');
   appUserCache.clear();
   const appUser=await buildAppUser(user);
   if(appUser.role!==role){
    await signOutAndClearCaches();
    throw new Error(`This account is a ${appUser.role.toLowerCase()} account. Use the ${appUser.role.toLowerCase()} sign-in page instead.`);
   }
   setCurrentUser(appUser);
   return{success:true};
  }catch(error){
   return{success:false,error:describeSignInError(error)};
  }finally{
   signingIn.current=false;
   setIsLoading(false);
  }
 },[]);

 const logout=useCallback(()=>{
  appUserCache.clear();
  setCurrentUser(null);
  setIsLoading(true);
  void signOutAndClearCaches().finally(()=>setIsLoading(false));
 },[]);

 // Memoized so the provider value only changes when the session actually does.
 const value=useMemo<AuthContextType>(()=>({currentUser,isLoading,signIn,logout,isEditor:currentUser?.role==='Editor',isClient:currentUser?.role==='Client'}),[currentUser,isLoading,signIn,logout]);
 return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
};

/** Turns Supabase's raw auth errors into something a client can act on. */
function describeSignInError(error:unknown):string{
 const message=error instanceof Error?error.message:'';
 if(/invalid login credentials/i.test(message))return 'That email and password combination was not accepted. Check both and try again.';
 if(/email not confirmed/i.test(message))return 'This account still needs confirmation. Ask your project editor to re-create it.';
 if(/failed to fetch|network|load failed/i.test(message))return 'Could not reach the server. Check your connection and try again.';
 if(/rate limit|too many/i.test(message))return 'Too many attempts. Wait a moment before trying again.';
 return message||'Could not sign in. Please try again.';
}

async function buildAppUser(authUser:SupabaseUser):Promise<User>{
 const cached=appUserCache.get(authUser.id);if(cached)return cached;
 const email=authUser.email?.trim().toLowerCase();
 if(!email)throw new Error('Your Supabase account does not have an email address.');

 const membershipQuery=(role:UserRole)=>supabase.from('project_members')
  .select('project_id,role,display_name,company_name').eq('email',email).eq('role',role).limit(1).maybeSingle();
 // Both role checks run together so restoring a session or signing in only
 // waits for one network round trip instead of two sequential requests.
 const[{data:editor,error:ee},{data:client,error:ce}]=await Promise.all([
  membershipQuery('Editor'),
  membershipQuery('Client'),
 ]);
 if(ee)throw ee;
 if(ce)throw ce;

 const membership=editor??client;
 if(!membership)throw new Error('This email is not assigned to a SyncCut project. Ask your editor for access.');
 const meta=authUser.user_metadata??{};
 const user:User={
  user_id:authUser.id,
  name:membership.display_name||meta.name||email,
  email,
  role:membership.role as UserRole,
  company_name:membership.company_name||meta.company_name||'',
  ...(editor?{}:{project_id:membership.project_id}),
 };
 appUserCache.set(authUser.id,user);
 return user
}

export const useAuth=()=>{const c=useContext(AuthContext);if(!c)throw new Error('useAuth must be used within an AuthProvider');return c};
