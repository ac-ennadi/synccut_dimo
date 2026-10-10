export type ProjectStatus='Scripting'|'Pre-Production'|'Production'|'Editing'|'Final Review'|'Completed';
export type UserRole='Client'|'Editor'|'Producer'|'Admin';
export type ActionRequiredBy='Client'|'Editor'|'None';
export type ApprovalStatus='Pending'|'Approved'|'Revisions Requested';
export interface User{user_id:string;name:string;email:string;role:UserRole;company_name:string;project_id?:string}
export interface Project{project_id:string;client_id:string;title:string;status:ProjectStatus;start_date:string;due_date:string;producer_name:string;producer_email:string}
export interface MoodboardReference{id:string;title:string;category:string;description:string;color_gradient:string;icon:string}
export interface CreativeBrief{brief_id:string;project_id:string;version_label:string;is_locked:boolean;target_audience:string;script_scenes:Array<{scene_number:number;title:string;timecode:string;visual_description:string;voiceover:string}>;references:MoodboardReference[]}
export interface FeedbackNote{id:string;author_name:string;timecode?:string;content:string;created_at:string}
export interface Deliverable{deliverable_id:string;project_id:string;version_number:string;video_url:string;duration_seconds:number;uploaded_at:string;action_required_by:ActionRequiredBy;action_banner_text?:string;approval_status:ApprovalStatus;feedback_notes:FeedbackNote[]}
