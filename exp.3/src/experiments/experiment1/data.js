export const PLATFORMS = {
  x: {name:'X', icon:'𝕏', color:'#14171a', limit:280, hashtagLimit:null, media:['image/jpeg','image/png','image/gif','video/mp4'], note:'Keep it concise — X allows up to 280 characters.'},
  instagram: {name:'Instagram', icon:'◎', color:'#d62976', limit:2200, hashtagLimit:30, media:['image/jpeg','image/png','video/mp4'], note:'Add a visual and use no more than 30 hashtags.'},
  linkedin: {name:'LinkedIn', icon:'in', color:'#0a66c2', limit:3000, hashtagLimit:5, media:['image/jpeg','image/png','video/mp4','application/pdf'], note:'For best reach, LinkedIn recommends 3–5 hashtags.'},
  facebook: {name:'Facebook', icon:'f', color:'#1877f2', limit:63206, hashtagLimit:null, media:['image/jpeg','image/png','image/gif','video/mp4'], note:'Long-form copy is supported, but short posts often perform best.'}
};
export const INITIAL_DRAFTS = [
  {id:101,content:'Big ideas start with small, consistent steps. Here are three things we learned while building our latest product… #buildinpublic #productdesign',platforms:['linkedin','x'],scheduledAt:'2026-07-24T10:30',updatedAt:'2026-07-22T09:15:00',status:'scheduled',media:null},
  {id:102,content:'A little behind-the-scenes from our studio today ✨ What are you working on this week? #creativelife #designstudio',platforms:['instagram','facebook'],scheduledAt:'',updatedAt:'2026-07-21T15:45:00',status:'draft',media:null},
  {id:103,content:'New feature. Less friction. More time for the work that matters. Launching soon 🚀',platforms:['x','linkedin','facebook'],scheduledAt:'2026-07-29T12:00',updatedAt:'2026-07-20T11:20:00',status:'scheduled',media:null}
];
