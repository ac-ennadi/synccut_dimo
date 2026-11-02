export type ProjectStatus='Scripting'|'Pre-Production'|'Shooting'|'Editing'|'Final Review'|'Completed';
export type ProjectType='after_effects'|'premiere_pro';
export type VideoAspectRatio='16:9'|'9:16';
export type ProjectTemplateId='social_short'|'brand_film'|'motion_explainer';
export type FeedbackStatus='open'|'in_progress'|'resolved';
export type EditingTaskStatus='not_started'|'in_edit'|'ready_for_review'|'done';
export type UserRole='Client'|'Editor'|'Producer'|'Admin';
export type ActionRequiredBy='Client'|'Editor'|'None';
export type ApprovalStatus='Pending'|'Approved'|'Revisions Requested';
export interface PublishChecklistItem{id:string;label:string;checked:boolean}
export interface EditingTask{id:string;title:string;scene_title?:string;timecode?:string;source?:'ai'|'manual';status:EditingTaskStatus}
export interface CutVersion{id:string;version_number:string;video_url:string;video_storage_path?:string;duration_seconds:number;uploaded_at:string}
export interface FinalDeliveryAsset{id:string;label:string;url:string}
export interface FinalHandoff{status:'preparing'|'ready';notes:string;assets:FinalDeliveryAsset[];cut_version:string}
export interface User{user_id:string;name:string;email:string;role:UserRole;company_name:string;project_id?:string;project_ids?:string[];project_titles?:Record<string,string>}
export interface Project{project_id:string;client_id:string;title:string;project_type:ProjectType;video_aspect_ratio:VideoAspectRatio;template_id?:ProjectTemplateId;publish_checklist?:PublishChecklistItem[];status:ProjectStatus;start_date:string;due_date:string;producer_name:string;producer_email:string}
export interface MoodboardReference{id:string;title:string;category:string;description:string;color_gradient:string;icon:string;image_url?:string;image_storage_path?:string}
export interface ScriptScene{scene_number:number;title:string;timecode:string;visual_description:string;voiceover:string}
export type ScriptBlockType='paragraph'|'heading1'|'heading2'|'heading3'|'bullet'|'numbered'|'todo'|'voiceover'|'document';
export interface ScriptSection{id:string;title:string;content:string;type?:ScriptBlockType;checked?:boolean}
export interface CreativeBrief{brief_id:string;project_id:string;version_label:string;is_locked:boolean;target_audience:string;script_scenes:ScriptScene[];script_sections?:ScriptSection[];references:MoodboardReference[];editing_tasks?:EditingTask[]}
export interface FeedbackNote{id:string;author_name:string;author_email?:string;timecode?:string;content:string;created_at:string;status?:FeedbackStatus;cut_version?:string}
export interface Deliverable{deliverable_id:string;project_id:string;version_number:string;video_url:string;video_storage_path?:string;cut_history?:CutVersion[];final_handoff?:FinalHandoff;logo_storage_path?:string;logo_file_name?:string;duration_seconds:number;uploaded_at:string;action_required_by:ActionRequiredBy;action_banner_text?:string;approval_status:ApprovalStatus;feedback_notes:FeedbackNote[]}
