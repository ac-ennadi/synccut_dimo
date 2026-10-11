'use client';
import React,{createContext,useCallback,useContext,useMemo,useState,useEffect}from'react';
import type{User as SupabaseUser}from'@supabase/supabase-js';
import{User,UserRole}from'@/types';
import{isSupabaseConfigured,signInWithPassword,signOutAndClearCaches,supabase}from'@/lib/supabase';
interface AuthContextType{currentUser:User|null;isLoading:boolean;signIn:(email:string,password:string,role:UserRole)=>Promise<{success:boolean;error?:string}>;logout:()=>void;isEditor:boolean;isClient:boolean}
const AuthContext=createContext<AuthContextType|undefined>(undefined);
// Keeps the membership lookup off the critical path when navigating between
// editor pages; cleared on every sign-in/sign-out.
const appUserCache=new Map<string,User>();
export const AuthProvider:React.FC<{children:React.ReactNode}>=({children})=>{
 const[currentUser,setCurrentUser]=useState<User|null>(null);const[isLoading,setIsLoading]=useState(true);
 useEffect(()=>{let mounted=true;
  const apply=async(authUser:SupabaseUser)=>{if(!mounted)return;try{const user=await buildAppUser(authUser);if(mounted)setCurrentUser(user)}catch(error){console.error('Supabase user is not authorized for SyncCut.',error);await signOutAndClearCaches();if(mounted)setCurrentUser(null)}};
  const restore=async()=>{try{if(isSupabaseConfigured){const{data}=await supabase.auth.getSession();if(data.session?.user){await apply(data.session.user);return}}setCurrentUser(null)}catch(error){console.error('Failed to restore Supabase session.',error);setCurrentUser(null)}finally{if(mounted)setIsLoading(false)}};
  void restore();const{data:{subscription}}=supabase.auth.onAuthStateChange((_e,session)=>{if(!session?.user){appUserCache.clear();if(mounted){setCurrentUser(null);setIsLoading(false)}return}setTimeout(()=>{void apply(session.user).finally(()=>{if(mounted)setIsLoading(false)})},0)});
  return()=>{mounted=false;subscription.unsubscribe()}
 },[]);
 const signIn=useCallback(async(email:string,password:string,role:UserRole)=>{try{const{user}=await signInWithPassword(email.trim(),password);if(!user)throw new Error('Supabase did not return an authenticated user.');appUserCache.clear();const appUser=await buildAppUser(user);if(appUser.role!==role){await supabase.auth.signOut();throw new Error(`This email is not authorized for the ${role.toLowerCase()} portal.`)}setCurrentUser(appUser);return{success:true}}catch(e){return{success:false,error:e instanceof Error?e.message:'Could not sign in with those credentials.'}}},[]);
 const logout=useCallback(()=>{appUserCache.clear();setCurrentUser(null);void signOutAndClearCaches()},[]);
 // Memoized so the provider's value only changes when the session actually does.
 const value=useMemo<AuthContextType>(()=>({currentUser,isLoading,signIn,logout,isEditor:currentUser?.role==='Editor',isClient:currentUser?.role==='Client'}),[currentUser,isLoading,signIn,logout]);
 return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
};
async function buildAppUser(authUser:SupabaseUser):Promise<User>{
 const cached=appUserCache.get(authUser.id);if(cached)return cached;
 const email=authUser.email?.trim().toLowerCase();if(!email)throw new Error('Your Supabase account does not have an email address.');
 const{data:editor,error:ee}=await supabase.from('project_members').select('project_id,role,display_name,company_name').eq('email',email).eq('role','Editor').limit(1).maybeSingle();if(ee)throw ee;
 // Only the editor lookup result short-circuits: a client membership is still
 // resolved so someone who is both stays an Editor first.
 const{data:client,error:ce}=editor?{data:null,error:null}:await supabase.from('project_members').select('project_id,role,display_name,company_name').eq('email',email).eq('role','Client').limit(1).maybeSingle();if(ce)throw ce;
 const m=editor??client;if(!m)throw new Error('This email is not assigned to a SyncCut client.');const meta=authUser.user_metadata??{};
 const user:User={user_id:authUser.id,name:m.display_name||meta.name||email,email,role:m.role as UserRole,company_name:m.company_name||meta.company_name||'',...(editor?{}:{project_id:m.project_id})};
 appUserCache.set(authUser.id,user);
 return user
}
export const useAuth=()=>{const c=useContext(AuthContext);if(!c)throw new Error('useAuth must be used within an AuthProvider');return c};
