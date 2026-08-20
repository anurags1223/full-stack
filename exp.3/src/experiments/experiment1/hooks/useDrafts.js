import {useCallback,useEffect,useMemo,useReducer} from 'react';
import {INITIAL_DRAFTS} from '../data';
const KEY='postly-drafts-v1';
function reducer(state,action){switch(action.type){case'add':return[action.payload,...state];case'update':return state.map(d=>d.id===action.payload.id?{...d,...action.payload}:d);case'delete':return state.filter(d=>d.id!==action.id);case'duplicate':{const d=state.find(x=>x.id===action.id);return d?[{...d,id:Date.now(),status:'draft',scheduledAt:'',updatedAt:new Date().toISOString()},...state]:state}default:return state}}
export function useDrafts(){
  const [drafts,dispatch]=useReducer(reducer,[],()=>{try{return JSON.parse(localStorage.getItem(KEY))||INITIAL_DRAFTS}catch{return INITIAL_DRAFTS}});
  useEffect(()=>localStorage.setItem(KEY,JSON.stringify(drafts)),[drafts]);
  const saveDraft=useCallback(payload=>new Promise(resolve=>setTimeout(()=>{const draft={...payload,id:payload.id||Date.now(),updatedAt:new Date().toISOString(),status:payload.scheduledAt?'scheduled':'draft'};dispatch({type:payload.id?'update':'add',payload:draft});resolve(draft)},650)),[]);
  const removeDraft=useCallback(id=>dispatch({type:'delete',id}),[]);
  const duplicateDraft=useCallback(id=>dispatch({type:'duplicate',id}),[]);
  const stats=useMemo(()=>({total:drafts.length,scheduled:drafts.filter(d=>d.status==='scheduled').length,platforms:new Set(drafts.flatMap(d=>d.platforms)).size,characters:drafts.reduce((n,d)=>n+d.content.length,0)}),[drafts]);
  return{drafts,saveDraft,removeDraft,duplicateDraft,stats};
}
