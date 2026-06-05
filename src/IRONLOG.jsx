// IRONLOG v2 — Program-based bodybuilding tracker

import {
  useState, useEffect, useReducer, useContext,
  createContext, useRef, useMemo
} from 'react';
import {
  LineChart, Line, BarChart, Bar, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';
import {
  Dumbbell, TrendingUp, Calendar, Flame, Trophy, Plus,
  ChevronDown, ChevronUp, X, AlertTriangle, Settings,
  BarChart2, Clock, Check, ArrowUp, ArrowDown, Minus,
  Trash2, Moon, Activity, Edit2, GripVertical
} from 'lucide-react';

// ─── THEME ────────────────────────────────────────────────────
const C = {
  bg:'#080808', s1:'#111111', s2:'#1a1a1a', s3:'#242424',
  accent:'#0ea5e9', gold:'#f59e0b', red:'#ef4444',
  green:'#22c55e', purple:'#a855f7', teal:'#14b8a6',
  orange:'#f97316', text:'#f1f5f9', muted:'#64748b',
  dim:'#334155', border:'#1e293b',
};

// ─── SPLITS ───────────────────────────────────────────────────
const SPLITS = {
  ppl:{id:'ppl',name:'Push / Pull / Legs',
    schedule:['Push','Pull','Legs','Push','Pull','Legs','Rest']},
  upperlower:{id:'upperlower',name:'Upper / Lower',
    schedule:['Upper','Lower','Rest','Upper','Lower','Rest','Rest']},
  brosplit:{id:'brosplit',name:'Bro Split',
    schedule:['Chest','Back','Shoulders','Arms','Legs','Rest','Rest']},
  fullbody:{id:'fullbody',name:'Full Body',
    schedule:['Full Body','Rest','Full Body','Rest','Full Body','Rest','Rest']},
  arnold:{id:'arnold',name:'Arnold Split',
    schedule:['Chest & Back','Shoulders & Arms','Legs','Chest & Back','Shoulders & Arms','Legs','Rest']},
  custom:{id:'custom',name:'Custom',schedule:[]},
};

// ─── EXERCISE DB ──────────────────────────────────────────────
const EX_DB = {
  chest:['Incline Barbell Press','Flat DB Press','Cable Fly','Pec Deck','Dips','Incline DB Press'],
  back:['Pull-up','Cable Row','DB Row','Lat Pulldown','Face Pull','Deadlift','Rack Pull','Meadows Row'],
  shoulders:['OHP','DB Lateral Raise','Cable Lateral Raise','Rear Delt Fly','DB Press','Machine Press'],
  biceps:['Barbell Curl','Incline DB Curl','Cable Curl','Hammer Curl','Spider Curl','Preacher Curl'],
  triceps:['Skull Crusher','Tricep Pushdown','Overhead Extension','Dips','Close Grip Bench'],
  legs:['Squat','Leg Press','RDL','Leg Curl','Leg Extension','Bulgarian Split Squat','Hip Thrust','Hack Squat'],
  glutes:['Hip Thrust','Cable Kickback','Bulgarian Split Squat','Sumo Deadlift'],
  core:['Plank','Cable Crunch','Hanging Leg Raise','Ab Wheel','Dragon Flag'],
};
const MUSCLE_GROUPS = Object.keys(EX_DB);
const EX_TO_MUSCLE = {};
Object.entries(EX_DB).forEach(([m,exs])=>exs.forEach(e=>{if(!EX_TO_MUSCLE[e])EX_TO_MUSCLE[e]=m;}));

const REP_RANGES = ['4-6','6-8','8-10','10-12','12-15','15-20'];
const UPPER_LIM = {'4-6':6,'6-8':8,'8-10':10,'10-12':12,'12-15':15,'15-20':20};
const LOWER_LIM = {'4-6':4,'6-8':6,'8-10':8,'10-12':10,'12-15':12,'15-20':15};
const DAYS_SHORT = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

// ─── DEFAULT PROGRAMS ─────────────────────────────────────────
const mkPEx=(exercise,sets,repRange)=>({id:Math.random().toString(36).slice(2),exercise,sets,repRange});

const DEFAULT_PROGRAMS = {
  ppl:{
    Push:[mkPEx('Incline Barbell Press',4,'6-8'),mkPEx('OHP',3,'8-10'),mkPEx('Cable Fly',3,'12-15'),mkPEx('Tricep Pushdown',3,'10-12'),mkPEx('Skull Crusher',3,'10-12')],
    Pull:[mkPEx('Pull-up',4,'6-8'),mkPEx('Cable Row',3,'8-10'),mkPEx('Face Pull',3,'15-20'),mkPEx('Barbell Curl',3,'8-10'),mkPEx('Hammer Curl',3,'10-12')],
    Legs:[mkPEx('Squat',4,'6-8'),mkPEx('Leg Press',3,'8-10'),mkPEx('RDL',3,'8-10'),mkPEx('Leg Curl',3,'10-12'),mkPEx('Leg Extension',3,'12-15')],
  },
  upperlower:{
    Upper:[mkPEx('Incline Barbell Press',4,'6-8'),mkPEx('Cable Row',4,'8-10'),mkPEx('OHP',3,'8-10'),mkPEx('Lat Pulldown',3,'10-12'),mkPEx('Barbell Curl',3,'10-12'),mkPEx('Tricep Pushdown',3,'10-12')],
    Lower:[mkPEx('Squat',4,'6-8'),mkPEx('RDL',3,'8-10'),mkPEx('Leg Press',3,'10-12'),mkPEx('Leg Curl',3,'12-15'),mkPEx('Leg Extension',3,'12-15')],
  },
  brosplit:{
    Chest:[mkPEx('Incline Barbell Press',4,'6-8'),mkPEx('Flat DB Press',3,'10-12'),mkPEx('Cable Fly',3,'12-15'),mkPEx('Pec Deck',3,'12-15')],
    Back:[mkPEx('Pull-up',4,'6-8'),mkPEx('Cable Row',4,'8-10'),mkPEx('Lat Pulldown',3,'10-12'),mkPEx('Face Pull',3,'15-20')],
    Shoulders:[mkPEx('OHP',4,'6-8'),mkPEx('DB Lateral Raise',4,'12-15'),mkPEx('Cable Lateral Raise',3,'15-20'),mkPEx('Rear Delt Fly',3,'15-20')],
    Arms:[mkPEx('Barbell Curl',4,'8-10'),mkPEx('Incline DB Curl',3,'10-12'),mkPEx('Hammer Curl',3,'10-12'),mkPEx('Skull Crusher',4,'8-10'),mkPEx('Tricep Pushdown',3,'10-12'),mkPEx('Overhead Extension',3,'12-15')],
    Legs:[mkPEx('Squat',4,'6-8'),mkPEx('Leg Press',3,'8-10'),mkPEx('RDL',3,'8-10'),mkPEx('Leg Curl',3,'10-12'),mkPEx('Leg Extension',3,'12-15')],
  },
  fullbody:{
    'Full Body':[mkPEx('Squat',3,'6-8'),mkPEx('Incline Barbell Press',3,'8-10'),mkPEx('Cable Row',3,'8-10'),mkPEx('OHP',3,'10-12'),mkPEx('Barbell Curl',2,'10-12'),mkPEx('Tricep Pushdown',2,'10-12')],
  },
  arnold:{
    'Chest & Back':[mkPEx('Incline Barbell Press',4,'6-8'),mkPEx('Pull-up',4,'6-8'),mkPEx('Flat DB Press',3,'10-12'),mkPEx('Cable Row',3,'10-12'),mkPEx('Cable Fly',3,'12-15')],
    'Shoulders & Arms':[mkPEx('OHP',4,'8-10'),mkPEx('DB Lateral Raise',3,'12-15'),mkPEx('Barbell Curl',4,'8-10'),mkPEx('Skull Crusher',4,'8-10'),mkPEx('Hammer Curl',3,'10-12'),mkPEx('Tricep Pushdown',3,'10-12')],
    Legs:[mkPEx('Squat',4,'6-8'),mkPEx('Leg Press',3,'8-10'),mkPEx('RDL',3,'8-10'),mkPEx('Leg Curl',3,'10-12'),mkPEx('Leg Extension',3,'12-15')],
  },
  custom:{},
};

// ─── STORAGE ──────────────────────────────────────────────────
const SK = 'ironlog_v2';
let _mem = null;
const store = {
  async get(){
    try{ if(window.storage){const r=await window.storage.get(SK);return r?JSON.parse(r.value):null;} }catch(e){}
    return _mem;
  },
  async set(data){
    _mem=data;
    try{ if(window.storage)await window.storage.set(SK,JSON.stringify(data)); }catch(e){}
  }
};

// ─── UTILS ────────────────────────────────────────────────────
const uid=()=>Math.random().toString(36).slice(2,9);
const epley=(w,r)=>r<=1?w:Math.round(w*(1+r/30)*10)/10;
const calcVol=(sets=[])=>sets.reduce((a,s)=>a+(s.weight||0)*(s.reps||0),0);
const fmtDate=(iso)=>new Date(iso).toLocaleDateString('en-US',{month:'short',day:'numeric'});
const fmtDateFull=(iso)=>new Date(iso).toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'});
const daysAgo=(n)=>{const d=new Date();d.setDate(d.getDate()-n);d.setHours(10,0,0,0);return d.toISOString();};
const daysBetween=(a,b)=>Math.round((new Date(b)-new Date(a))/(864e5));

const getSuggestedSession=(split,workouts)=>{
  const sched=SPLITS[split]?.schedule||[];
  if(!sched.length)return'Training';
  const sorted=[...workouts].sort((a,b)=>new Date(b.date)-new Date(a.date));
  if(!sorted.length)return sched[0];
  const idx=sched.indexOf(sorted[0].splitDay);
  return idx===-1?sched[0]:sched[(idx+1)%sched.length];
};

const getLastWeightForExercise=(workouts,exName)=>{
  const sorted=[...workouts].sort((a,b)=>new Date(b.date)-new Date(a.date));
  for(const w of sorted){
    for(const ex of(w.exercises||[])){
      if(ex.exercise===exName&&ex.sets?.length){
        const s=ex.sets.find(s=>s.weight>0);
        if(s)return s.weight;
      }
    }
  }
  return 0;
};

const getLastSessionSets=(workouts,exName)=>{
  const sorted=[...workouts].sort((a,b)=>new Date(b.date)-new Date(a.date));
  for(const w of sorted){
    for(const ex of(w.exercises||[])){
      if(ex.exercise===exName)return ex.sets||[];
    }
  }
  return[];
};

const getProgressionAlert=(exName,repRange,workouts,unit)=>{
  const sessions=[];
  const sorted=[...workouts].sort((a,b)=>new Date(b.date)-new Date(a.date));
  for(const w of sorted){
    for(const ex of(w.exercises||[])){
      if(ex.exercise===exName){
        const topSet=ex.sets?.find(s=>s.setNum===1&&s.reps>0);
        if(topSet)sessions.push({ts:topSet});
      }
    }
  }
  if(!sessions.length)return null;
  const ts=sessions[0].ts;
  const rr=repRange||'6-8';
  const upper=UPPER_LIM[rr]||8;
  const lower=LOWER_LIM[rr]||6;
  if(sessions.length>=3&&sessions.slice(0,3).every(s=>s.ts.weight===ts.weight)){
    return{level:'stagnation',color:C.purple,
      msg:`📊 Nessuna progressione su ${exName} in 3 sessioni. Considera un deload.`};
  }
  if(ts.reps>upper)return{level:'red',color:C.red,
    msg:`🔴 Ultima volta: ${ts.reps} reps a ${ts.weight}${unit}. AUMENTA il peso! Prova ${ts.weight+2.5}${unit}.`};
  if(ts.reps>=upper)return{level:'amber',color:C.gold,
    msg:`🟡 Ultima volta: ${ts.reps} reps a ${ts.weight}${unit}. È ora di aumentare! Prova ${ts.weight+2.5}${unit} per ${lower} reps.`};
  if(ts.reps<=lower)return{level:'green',color:C.green,
    msg:`🟢 Ultima volta: ${ts.reps} reps. Mantieni il peso, punta a ${ts.reps+1} reps oggi.`};
  return{level:'info',color:C.accent,
    msg:`Ultima serie 1: ${ts.weight}${unit} × ${ts.reps} reps. Continua a progredire!`};
};

const detectPRs=(workouts)=>{
  const best={};const prs=[];
  const sorted=[...workouts].sort((a,b)=>new Date(a.date)-new Date(b.date));
  for(const w of sorted){
    for(const ex of(w.exercises||[])){
      const ts=ex.sets?.filter(s=>s.weight>0&&s.reps>0).sort((a,b)=>b.weight-a.weight)[0];
      if(!ts)continue;
      const rm=epley(ts.weight,ts.reps);
      if(!best[ex.exercise]||rm>best[ex.exercise]){
        if(best[ex.exercise])prs.push({id:uid(),exercise:ex.exercise,weight:ts.weight,reps:ts.reps,rm,date:w.date});
        best[ex.exercise]=rm;
      }
    }
  }
  return prs.reverse().slice(0,8);
};

const getMuscleLastTrained=(workouts)=>{
  const last={};
  const sorted=[...workouts].sort((a,b)=>new Date(b.date)-new Date(a.date));
  for(const w of sorted)
    for(const ex of(w.exercises||[])){
      const m=EX_TO_MUSCLE[ex.exercise]||'other';
      if(m&&!last[m])last[m]=w.date;
    }
  return last;
};

const getWeeklyVolume=(workouts,weeksAgo=0)=>{
  const now=new Date();
  const start=new Date(now);
  start.setDate(start.getDate()-((now.getDay()+6)%7)-7*weeksAgo);
  start.setHours(0,0,0,0);
  const end=new Date(start);end.setDate(end.getDate()+7);
  const vol={};
  for(const w of workouts){
    const d=new Date(w.date);
    if(d>=start&&d<end)
      for(const ex of(w.exercises||[])){
        const m=EX_TO_MUSCLE[ex.exercise]||'other';
        vol[m]=(vol[m]||0)+calcVol(ex.sets);
      }
  }
  return vol;
};

// ─── STATE ────────────────────────────────────────────────────
const makeBlankState=()=>({
  settings:{unit:'kg',split:'ppl',setupComplete:false},
  program:{},
  workouts:[],
  currentWorkout:null,
  customExercises:[],
  prs:[],
});

const AppCtx=createContext(null);
const useApp=()=>useContext(AppCtx);

function reducer(state,action){
  switch(action.type){
    case'INIT':return{...state,...action.payload};
    case'SETUP_COMPLETE':return{...state,
      settings:{...state.settings,...action.payload,setupComplete:true},
      program:action.program};
    case'UPDATE_SETTINGS':return{...state,settings:{...state.settings,...action.payload}};
    case'UPDATE_PROGRAM':return{...state,program:action.program};
    case'START_WORKOUT':{
      const todayProg=state.program[action.splitDay]||[];
      const exercises=todayProg.map(pex=>{
        const lastSets=getLastSessionSets(state.workouts,pex.exercise);
        const sets=Array.from({length:pex.sets},(_,i)=>{
          const lastSet=lastSets[i];
          return{id:uid(),setNum:i+1,weight:lastSet?.weight||getLastWeightForExercise(state.workouts,pex.exercise)||0,
            reps:lastSet?.reps||0,done:false};
        });
        return{id:uid(),exercise:pex.exercise,muscle:EX_TO_MUSCLE[pex.exercise]||'other',repRange:pex.repRange,sets};
      });
      return{...state,currentWorkout:{id:uid(),date:new Date().toISOString(),
        splitDay:action.splitDay,exercises,completed:false}};
    }
    case'ADD_EXTRA_SET':{
      const cw=state.currentWorkout;
      const exs=cw.exercises.map(e=>{
        if(e.id!==action.exId)return e;
        const last=e.sets[e.sets.length-1];
        return{...e,sets:[...e.sets,{id:uid(),setNum:e.sets.length+1,weight:last?.weight||0,reps:last?.reps||0,done:false}]};
      });
      return{...state,currentWorkout:{...cw,exercises:exs}};
    }
    case'REMOVE_SET':{
      const cw=state.currentWorkout;
      const exs=cw.exercises.map(e=>e.id!==action.exId?e:
        {...e,sets:e.sets.filter(s=>s.id!==action.setId).map((s,i)=>({...s,setNum:i+1}))});
      return{...state,currentWorkout:{...cw,exercises:exs}};
    }
    case'UPDATE_SET':{
      const cw=state.currentWorkout;
      const exs=cw.exercises.map(e=>e.id!==action.exId?e:
        {...e,sets:e.sets.map(s=>s.id!==action.setId?s:{...s,...action.updates})});
      return{...state,currentWorkout:{...cw,exercises:exs}};
    }
    case'TOGGLE_SET_DONE':{
      const cw=state.currentWorkout;
      const exs=cw.exercises.map(e=>e.id!==action.exId?e:
        {...e,sets:e.sets.map(s=>s.id!==action.setId?s:{...s,done:!s.done})});
      return{...state,currentWorkout:{...cw,exercises:exs}};
    }
    case'ADD_WORKOUT_EXERCISE':{
      const cw=state.currentWorkout;
      const lastSets=getLastSessionSets(state.workouts,action.exercise);
      const sets=Array.from({length:action.sets||3},(_,i)=>({
        id:uid(),setNum:i+1,weight:lastSets[i]?.weight||getLastWeightForExercise(state.workouts,action.exercise)||0,
        reps:lastSets[i]?.reps||0,done:false}));
      const ex={id:uid(),exercise:action.exercise,muscle:EX_TO_MUSCLE[action.exercise]||'other',
        repRange:action.repRange||'8-10',sets};
      return{...state,currentWorkout:{...cw,exercises:[...cw.exercises,ex]}};
    }
    case'REMOVE_WORKOUT_EXERCISE':{
      const cw=state.currentWorkout;
      return{...state,currentWorkout:{...cw,exercises:cw.exercises.filter(e=>e.id!==action.exId)}};
    }
    case'COMPLETE_WORKOUT':{
      const cw={...state.currentWorkout,completed:true};
      cw.exercises=cw.exercises.map(e=>({...e,sets:e.sets.filter(s=>s.done||s.reps>0)}));
      cw.totalVolume=cw.exercises.reduce((a,e)=>a+calcVol(e.sets),0);
      const workouts=[...state.workouts,cw];
      return{...state,workouts,currentWorkout:null,prs:detectPRs(workouts)};
    }
    case'DISCARD_WORKOUT':return{...state,currentWorkout:null};
    case'ADD_CUSTOM_EXERCISE':return{...state,customExercises:[...state.customExercises,action.ex]};
    case'RESET_WORKOUTS':return{...state,workouts:[],prs:[],currentWorkout:null};
    case'RESET_ALL':return makeBlankState();
    default:return state;
  }
}

// ─── PROVIDER ─────────────────────────────────────────────────
function AppProvider({children}){
  const[state,dispatch]=useReducer(reducer,null,makeBlankState);
  const[loaded,setLoaded]=useState(false);
  useEffect(()=>{
    store.get().then(d=>{if(d)dispatch({type:'INIT',payload:d});setLoaded(true);});
  },[]);
  useEffect(()=>{if(loaded)store.set(state);},[state,loaded]);
  if(!loaded)return(
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:C.bg}}>
      <div style={{color:C.accent,fontFamily:"'Barlow Condensed',sans-serif",fontSize:32,letterSpacing:4}}>IRONLOG</div>
    </div>
  );
  return<AppCtx.Provider value={{state,dispatch}}>{children}</AppCtx.Provider>;
}

// ─── GLOBAL STYLES ────────────────────────────────────────────
function GlobalStyles(){
  useEffect(()=>{
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href='https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;900&family=DM+Mono:wght@400;500&display=swap';
    document.head.appendChild(link);
    const s=document.createElement('style');
    s.textContent=`
      *{box-sizing:border-box;margin:0;padding:0;}
      body{background:#080808;color:#f1f5f9;overflow-x:hidden;}
      ::-webkit-scrollbar{width:4px;} ::-webkit-scrollbar-track{background:#111;} ::-webkit-scrollbar-thumb{background:#333;border-radius:2px;}
      @keyframes shimmer{0%{background-position:-200% center;}100%{background-position:200% center;}}
      @keyframes fadeIn{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:translateY(0);}}
      @keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,.4);}70%{box-shadow:0 0 0 6px rgba(239,68,68,0);}}
      .shimmer{background:linear-gradient(90deg,#f59e0b,#fcd34d,#f59e0b) 0/200%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:shimmer 2s linear infinite;}
      .fade-in{animation:fadeIn .2s ease;}
      .pulse{animation:pulse 1.5s infinite;}
      input,select,textarea{background:#1a1a1a;border:1px solid #1e293b;color:#f1f5f9;border-radius:8px;padding:8px 12px;font-size:14px;outline:none;width:100%;font-family:inherit;}
      input:focus,select:focus{border-color:#0ea5e9;}
      button{font-family:inherit;}
    `;
    document.head.appendChild(s);
    return()=>{try{document.head.removeChild(link);document.head.removeChild(s);}catch(e){}};
  },[]);
  return null;
}

// ─── UI PRIMITIVES ────────────────────────────────────────────
const Btn=({onClick,children,variant='primary',sx={},small=false,disabled=false})=>{
  const v={primary:{background:C.accent,color:'#fff'},gold:{background:C.gold,color:'#000'},
    ghost:{background:'transparent',color:C.text,border:`1px solid ${C.border}`},
    danger:{background:C.red,color:'#fff'},dim:{background:C.s2,color:C.muted}};
  return<button onClick={disabled?undefined:onClick} disabled={disabled}
    style={{cursor:disabled?'not-allowed':'pointer',border:'none',borderRadius:8,fontFamily:"'Barlow Condensed',sans-serif",
      fontWeight:700,letterSpacing:.5,transition:'opacity .15s',opacity:disabled?.5:1,
      padding:small?'6px 14px':'10px 20px',fontSize:small?13:15,...v[variant],...sx}}>{children}</button>;
};

const Card=({children,sx={}})=>(
  <div style={{background:C.s1,borderRadius:14,padding:16,border:`1px solid ${C.border}`,...sx}}>{children}</div>
);

const Label=({children,sx={}})=>(
  <div style={{fontSize:10,color:C.muted,letterSpacing:2,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,...sx}}>{children}</div>
);

// Weight/Reps stepper
const Stepper=({value,onChange,step=2.5,min=0,label,unit,big=false})=>(
  <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:3}}>
    {label&&<Label>{label}</Label>}
    <div style={{display:'flex',alignItems:'center',background:C.s2,borderRadius:10,border:`1px solid ${C.border}`,overflow:'hidden'}}>
      <button onClick={()=>onChange(Math.max(min,Math.round((value-step)*100)/100))}
        style={{width:big?44:36,height:big?52:44,background:'transparent',border:'none',color:C.muted,cursor:'pointer',fontSize:22,flexShrink:0}}>−</button>
      <div style={{minWidth:big?64:52,textAlign:'center',fontFamily:"'DM Mono',monospace",
        fontSize:big?22:17,color:C.text,fontWeight:700,padding:'0 4px'}}>
        {value}{unit&&<span style={{fontSize:10,color:C.muted,marginLeft:1}}>{unit}</span>}
      </div>
      <button onClick={()=>onChange(Math.round((value+step)*100)/100)}
        style={{width:big?44:36,height:big?52:44,background:'transparent',border:'none',color:C.muted,cursor:'pointer',fontSize:22,flexShrink:0}}>+</button>
    </div>
  </div>
);

// Exercise picker sheet
function ExercisePicker({onAdd,onClose,defaultSets,defaultRepRange}){
  const{state}=useApp();
  const[search,setSearch]=useState('');
  const[muscle,setMuscle]=useState('all');
  const[sets,setSets]=useState(defaultSets||3);
  const[rr,setRr]=useState(defaultRepRange||'8-10');
  const[picked,setPicked]=useState('');

  const allEx=useMemo(()=>{
    const db={};
    Object.entries(EX_DB).forEach(([m,exs])=>exs.forEach(e=>{db[e]=m;}));
    (state.customExercises||[]).forEach(e=>{db[e.name]=e.muscle;});
    return Object.entries(db).map(([name,muscle])=>({name,muscle}));
  },[state.customExercises]);

  const filtered=allEx.filter(e=>(muscle==='all'||e.muscle===muscle)&&
    (!search||e.name.toLowerCase().includes(search.toLowerCase())));
  const grouped={};
  filtered.forEach(e=>{if(!grouped[e.muscle])grouped[e.muscle]=[];grouped[e.muscle].push(e);});

  return(
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.8)',zIndex:200,display:'flex',flexDirection:'column',maxWidth:430,margin:'0 auto'}}>
      <div style={{marginTop:'auto',background:C.s1,borderRadius:'16px 16px 0 0',maxHeight:'88vh',display:'flex',flexDirection:'column'}}>
        <div style={{padding:'16px 16px 0',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <h3 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:20,fontWeight:700}}>Aggiungi Esercizio</h3>
          <button onClick={onClose} style={{background:'none',border:'none',cursor:'pointer',color:C.muted}}><X size={20}/></button>
        </div>
        <div style={{padding:'12px 16px 0'}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cerca esercizio…" style={{marginBottom:10}}/>
          <div style={{display:'flex',gap:6,overflowX:'auto',paddingBottom:8}}>
            {['all',...MUSCLE_GROUPS].map(m=>(
              <button key={m} onClick={()=>setMuscle(m)}
                style={{flexShrink:0,padding:'4px 10px',borderRadius:20,cursor:'pointer',fontSize:11,fontWeight:700,
                  border:`1px solid ${muscle===m?C.accent:C.border}`,
                  background:muscle===m?`${C.accent}20`:C.s2,
                  color:muscle===m?C.accent:C.muted,textTransform:'capitalize'}}>{m}</button>
            ))}
          </div>
          {picked&&(
            <div style={{background:C.s2,borderRadius:10,padding:'10px 14px',marginBottom:8,border:`1px solid ${C.accent}40`}}>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:15,fontWeight:700,color:C.accent,marginBottom:8}}>{picked}</div>
              <div style={{display:'flex',gap:16,alignItems:'center',marginBottom:8}}>
                <div>
                  <Label sx={{marginBottom:4}}>SERIE</Label>
                  <div style={{display:'flex',gap:4}}>
                    {[1,2,3,4,5,6].map(n=>(
                      <button key={n} onClick={()=>setSets(n)}
                        style={{width:32,height:32,borderRadius:6,border:`1px solid ${sets===n?C.gold:C.border}`,
                          background:sets===n?`${C.gold}20`:C.s3,cursor:'pointer',fontSize:13,fontWeight:700,
                          color:sets===n?C.gold:C.muted}}>{n}</button>
                    ))}
                  </div>
                </div>
              </div>
              <Label sx={{marginBottom:4}}>RANGE REPS</Label>
              <div style={{display:'flex',flexWrap:'wrap',gap:4,marginBottom:10}}>
                {REP_RANGES.map(r=>(
                  <button key={r} onClick={()=>setRr(r)}
                    style={{padding:'4px 10px',borderRadius:6,border:`1px solid ${rr===r?C.accent:C.border}`,
                      background:rr===r?`${C.accent}20`:C.s3,cursor:'pointer',fontSize:12,
                      color:rr===r?C.accent:C.muted}}>{r}</button>
                ))}
              </div>
              <Btn onClick={()=>{onAdd(picked,sets,rr);onClose();}} sx={{width:'100%'}}>Aggiungi — {sets}×{rr}</Btn>
            </div>
          )}
        </div>
        <div style={{overflowY:'auto',padding:'0 16px 16px'}}>
          {Object.entries(grouped).map(([mus,exs])=>(
            <div key={mus}>
              <Label sx={{padding:'8px 0 4px',textTransform:'uppercase'}}>{mus}</Label>
              {exs.map(e=>(
                <button key={e.name} onClick={()=>setPicked(e.name)}
                  style={{width:'100%',padding:'10px 12px',background:picked===e.name?`${C.accent}15`:C.s2,
                    border:`1px solid ${picked===e.name?C.accent:C.border}`,borderRadius:8,cursor:'pointer',
                    textAlign:'left',marginBottom:4,color:picked===e.name?C.accent:C.text,fontSize:14}}>{e.name}</button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── SETUP FLOW ───────────────────────────────────────────────
function ProgramBuilderStep({split,program,onChange}){
  const days=[...new Set((SPLITS[split]?.schedule||[]).filter(d=>d!=='Rest'))];
  const[activeDay,setActiveDay]=useState(days[0]||'');
  const[showPicker,setShowPicker]=useState(false);

  const dayProg=program[activeDay]||[];

  const removeEx=(id)=>onChange({...program,[activeDay]:dayProg.filter(e=>e.id!==id)});
  const updateEx=(id,updates)=>onChange({...program,[activeDay]:dayProg.map(e=>e.id===id?{...e,...updates}:e)});
  const addEx=(exercise,sets,repRange)=>{
    const ex={id:uid(),exercise,sets,repRange};
    onChange({...program,[activeDay]:[...dayProg,ex]});
  };

  return(
    <div>
      {/* Day tabs */}
      <div style={{display:'flex',gap:6,marginBottom:16,overflowX:'auto',paddingBottom:4}}>
        {days.map(d=>(
          <button key={d} onClick={()=>setActiveDay(d)}
            style={{flexShrink:0,padding:'8px 14px',borderRadius:20,cursor:'pointer',fontWeight:700,fontSize:13,
              border:`1px solid ${activeDay===d?C.accent:C.border}`,
              background:activeDay===d?`${C.accent}20`:C.s2,
              color:activeDay===d?C.accent:C.muted,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:.5}}>
            {d}</button>
        ))}
      </div>
      {/* Exercise list */}
      {dayProg.map((ex,i)=>(
        <div key={ex.id} style={{background:C.s2,borderRadius:10,padding:'10px 12px',marginBottom:8,
          border:`1px solid ${C.border}`}}>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
            <div style={{flex:1,fontFamily:"'Barlow Condensed',sans-serif",fontSize:15,fontWeight:700}}>{ex.exercise}</div>
            <button onClick={()=>removeEx(ex.id)} style={{background:'none',border:'none',cursor:'pointer',color:C.red,padding:4}}>
              <Trash2 size={14}/></button>
          </div>
          <div style={{display:'flex',gap:12,alignItems:'flex-start'}}>
            <div>
              <Label sx={{marginBottom:4}}>SERIE</Label>
              <div style={{display:'flex',gap:3}}>
                {[1,2,3,4,5,6].map(n=>(
                  <button key={n} onClick={()=>updateEx(ex.id,{sets:n})}
                    style={{width:28,height:28,borderRadius:5,border:`1px solid ${ex.sets===n?C.gold:C.border}`,
                      background:ex.sets===n?`${C.gold}20`:C.s3,cursor:'pointer',fontSize:12,fontWeight:700,
                      color:ex.sets===n?C.gold:C.muted}}>{n}</button>
                ))}
              </div>
            </div>
            <div style={{flex:1}}>
              <Label sx={{marginBottom:4}}>RANGE REPS</Label>
              <div style={{display:'flex',flexWrap:'wrap',gap:3}}>
                {REP_RANGES.map(r=>(
                  <button key={r} onClick={()=>updateEx(ex.id,{repRange:r})}
                    style={{padding:'3px 7px',borderRadius:5,border:`1px solid ${ex.repRange===r?C.accent:C.border}`,
                      background:ex.repRange===r?`${C.accent}20`:C.s3,cursor:'pointer',fontSize:11,
                      color:ex.repRange===r?C.accent:C.muted}}>{r}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
      <button onClick={()=>setShowPicker(true)}
        style={{width:'100%',padding:'12px',border:`2px dashed ${C.accent}40`,borderRadius:10,background:'transparent',
          color:C.accent,cursor:'pointer',fontSize:14,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,
          display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
        <Plus size={16}/> Aggiungi Esercizio
      </button>
      {showPicker&&<ExercisePicker onAdd={addEx} onClose={()=>setShowPicker(false)}/>}
    </div>
  );
}

function SetupFlow(){
  const{dispatch}=useApp();
  const[step,setStep]=useState(0);
  const[unit,setUnit]=useState('kg');
  const[split,setSplit]=useState('ppl');
  const[program,setProgram]=useState(DEFAULT_PROGRAMS.ppl);

  const handleSplitChange=(s)=>{setSplit(s);setProgram(DEFAULT_PROGRAMS[s]||{});};
  const finish=()=>dispatch({type:'SETUP_COMPLETE',payload:{unit,split},program});

  const wrap={minHeight:'100vh',background:C.bg,padding:24,
    backgroundImage:'linear-gradient(rgba(14,165,233,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(14,165,233,0.025) 1px,transparent 1px)',
    backgroundSize:'40px 40px'};

  // Welcome
  if(step===0)return(
    <div style={{...wrap,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}} className="fade-in">
      <Dumbbell size={52} color={C.accent} style={{marginBottom:12,opacity:.8}}/>
      <h1 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:80,fontWeight:900,letterSpacing:6,lineHeight:1,
        background:`linear-gradient(135deg,${C.accent},#38bdf8)`,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>
        IRONLOG</h1>
      <p style={{color:C.muted,letterSpacing:3,fontSize:13,marginBottom:56,fontFamily:"'Barlow Condensed',sans-serif",marginTop:8}}>
        TRACK. PROGRESS. DOMINATE.</p>
      <Btn onClick={()=>setStep(1)} sx={{padding:'16px 52px',fontSize:20,letterSpacing:2}}>INIZIA →</Btn>
    </div>
  );

  // Unit
  if(step===1)return(
    <div style={{...wrap,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}} className="fade-in">
      <Label sx={{marginBottom:8,fontSize:12}}>PASSO 1 DI 3</Label>
      <h2 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:40,fontWeight:700,marginBottom:8}}>Unità di misura</h2>
      <p style={{color:C.muted,marginBottom:36}}>Come misuri i pesi?</p>
      <div style={{display:'flex',gap:16,marginBottom:52}}>
        {['kg','lbs'].map(u=>(
          <button key={u} onClick={()=>setUnit(u)}
            style={{width:130,height:90,borderRadius:14,border:`2px solid ${unit===u?C.accent:C.border}`,
              background:unit===u?`${C.accent}15`:C.s1,cursor:'pointer',
              fontFamily:"'Barlow Condensed',sans-serif",fontSize:30,fontWeight:900,
              color:unit===u?C.accent:C.muted,transition:'all .2s',
              boxShadow:unit===u?`0 0 20px ${C.accent}30`:'none'}}>
            {u.toUpperCase()}</button>
        ))}
      </div>
      <Btn onClick={()=>setStep(2)} sx={{padding:'14px 44px',fontSize:18}}>AVANTI →</Btn>
    </div>
  );

  // Split
  if(step===2)return(
    <div style={{...wrap,paddingTop:48}} className="fade-in">
      <Label sx={{marginBottom:8,fontSize:12}}>PASSO 2 DI 3</Label>
      <h2 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:40,fontWeight:700,marginBottom:24}}>La tua Split</h2>
      <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:32}}>
        {Object.values(SPLITS).map(s=>(
          <button key={s.id} onClick={()=>handleSplitChange(s.id)}
            style={{padding:'14px 16px',borderRadius:12,border:`2px solid ${split===s.id?C.accent:C.border}`,
              background:split===s.id?`${C.accent}12`:C.s1,cursor:'pointer',textAlign:'left',transition:'all .2s',
              boxShadow:split===s.id?`0 0 16px ${C.accent}20`:'none'}}>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:18,fontWeight:700,
              color:split===s.id?C.accent:C.text}}>{s.name}</div>
            <div style={{fontSize:12,color:C.muted,marginTop:2}}>
              {s.schedule.filter((d,i,a)=>a.indexOf(d)===i&&d!=='Rest').join(' · ')}</div>
          </button>
        ))}
      </div>
      <Btn onClick={()=>setStep(3)} sx={{padding:'14px 44px',fontSize:18,width:'100%'}}>AVANTI →</Btn>
    </div>
  );

  // Program builder
  return(
    <div style={{...wrap,paddingTop:48}} className="fade-in">
      <Label sx={{marginBottom:8,fontSize:12}}>PASSO 3 DI 3</Label>
      <h2 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:40,fontWeight:700,marginBottom:4}}>Il tuo Programma</h2>
      <p style={{color:C.muted,fontSize:13,marginBottom:20}}>
        Definisci esercizi e serie per ogni giorno. Puoi modificarlo in qualsiasi momento.</p>
      <ProgramBuilderStep split={split} program={program} onChange={setProgram}/>
      <div style={{marginTop:24}}>
        <Btn onClick={finish} variant="gold" sx={{width:'100%',padding:'16px',fontSize:20,letterSpacing:2}}>
          INIZIA AD ALLENARTI 🏆
        </Btn>
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────
function Dashboard({setTab}){
  const{state,dispatch}=useApp();
  const{settings,workouts,prs,program}=state;
  const unit=settings.unit;
  const suggested=getSuggestedSession(settings.split,workouts);
  const isRest=suggested==='Rest';
  const sched=SPLITS[settings.split]?.schedule||[];
  const todayIdx=(new Date().getDay()+6)%7;
  const muscleAge=getMuscleLastTrained(workouts);
  const thisVol=getWeeklyVolume(workouts,0);
  const lastVol=getWeeklyVolume(workouts,1);
  const totalThis=Object.values(thisVol).reduce((a,v)=>a+v,0);
  const totalLast=Object.values(lastVol).reduce((a,v)=>a+v,0);
  const volDiff=totalLast>0?Math.round(((totalThis-totalLast)/totalLast)*100):0;

  // Streak
  let streak=0;
  const sortedW=[...workouts].sort((a,b)=>new Date(b.date)-new Date(a.date));
  if(sortedW.length){
    let d=new Date();d.setHours(0,0,0,0);
    for(let i=0;i<60;i++){
      if(sortedW.some(w=>new Date(w.date).toDateString()===d.toDateString()))streak++;
      else if(i>0)break;
      d.setDate(d.getDate()-1);
    }
  }

  const getMuscleColor=(m)=>{
    const last=muscleAge[m];
    if(!last)return C.dim;
    const d=daysBetween(last,new Date().toISOString());
    return d<=2?C.green:d<=4?C.gold:C.red;
  };

  // Today's program preview
  const todayProg=program[suggested]||[];

  return(
    <div style={{padding:'16px 16px 100px'}}>
      {/* Header */}
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:20}}>
        <div>
          <h1 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:30,fontWeight:900,letterSpacing:3,
            background:`linear-gradient(135deg,${C.accent},#38bdf8)`,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>
            IRONLOG</h1>
          <p style={{fontSize:12,color:C.muted,marginTop:1}}>
            {new Date().toLocaleDateString('it-IT',{weekday:'long',day:'numeric',month:'long'})}</p>
        </div>
        {streak>0&&<div style={{textAlign:'center',background:`${C.gold}12`,border:`1px solid ${C.gold}30`,
          borderRadius:10,padding:'8px 12px'}}>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:26,fontWeight:700,color:C.gold,lineHeight:1}}>{streak}</div>
          <div style={{fontSize:10,color:C.gold,display:'flex',alignItems:'center',gap:3,justifyContent:'center',marginTop:2}}>
            <Flame size={10}/> streak</div>
        </div>}
      </div>

      {/* Today card */}
      <div onClick={()=>!isRest&&setTab('logger')}
        style={{background:isRest?C.s1:`linear-gradient(135deg,${C.s1},${C.accent}10)`,
          border:`1px solid ${isRest?C.border:C.accent+'50'}`,borderRadius:14,padding:16,marginBottom:12,
          cursor:isRest?'default':'pointer',
          boxShadow:isRest?'none':`0 0 20px ${C.accent}12`}}>
        <Label sx={{marginBottom:8}}>OGGI</Label>
        {isRest?(
          <div style={{textAlign:'center',padding:'4px 0'}}>
            <Moon size={24} color={C.accent} style={{marginBottom:6}}/>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:22,fontWeight:700,color:C.accent}}>Riposo</div>
            <div style={{fontSize:13,color:C.muted}}>Il recupero è crescita 💤</div>
          </div>
        ):(
          <>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:28,fontWeight:700}}>{suggested}</div>
              <div style={{color:C.accent,fontSize:12,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700}}>
                INIZIA →</div>
            </div>
            {todayProg.slice(0,4).map(ex=>(
              <div key={ex.id} style={{display:'flex',justifyContent:'space-between',padding:'5px 0',
                borderTop:`1px solid ${C.border}`}}>
                <span style={{fontSize:13,color:C.text}}>{ex.exercise}</span>
                <span style={{fontFamily:"'DM Mono',monospace",fontSize:12,color:C.muted}}>
                  {ex.sets}×{ex.repRange}</span>
              </div>
            ))}
            {todayProg.length>4&&<div style={{fontSize:11,color:C.muted,marginTop:4}}>
              +{todayProg.length-4} esercizi</div>}
          </>
        )}
      </div>

      {/* Weekly strip */}
      <Card sx={{marginBottom:12}}>
        <Label sx={{marginBottom:10}}>SETTIMANA</Label>
        <div style={{display:'flex',gap:4}}>
          {DAYS_SHORT.map((day,i)=>{
            const session=sched[i]||'Rest';
            const isToday=i===todayIdx;
            const isRestDay=session==='Rest';
            const hasWorkout=workouts.some(w=>{
              const d=new Date(w.date);
              const n=new Date();n.setDate(n.getDate()-(todayIdx-i));
              return d.toDateString()===n.toDateString();
            });
            return(
              <div key={day} style={{flex:1,textAlign:'center',borderRadius:8,padding:'6px 2px',
                background:isToday?`${C.accent}20`:hasWorkout?`${C.green}12`:'transparent',
                border:`1px solid ${isToday?C.accent+'60':hasWorkout?C.green+'40':C.border}`,
                boxShadow:isToday?`0 0 10px ${C.accent}25`:'none'}}>
                <div style={{fontSize:10,color:isToday?C.accent:C.muted,fontWeight:700,marginBottom:3}}>{day}</div>
                <div style={{fontSize:8,color:isToday?C.text:isRestDay?C.dim:C.muted,fontWeight:700,lineHeight:1.3,
                  fontFamily:"'Barlow Condensed',sans-serif"}}>
                  {(session||'Rest').split(' ').map((w,j)=><div key={j}>{w}</div>)}</div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Volume + Muscle grid */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:12}}>
        {/* Volume */}
        <Card>
          <Label sx={{marginBottom:8}}>VOLUME SETTIMANALE</Label>
          <div style={{display:'flex',gap:8,alignItems:'flex-end',height:60}}>
            {[{l:'Prec',v:totalLast,c:C.dim},{l:'Questa',v:totalThis,c:C.accent}].map(({l,v,c})=>{
              const maxV=Math.max(totalThis,totalLast,1);
              return(
                <div key={l} style={{flex:1,textAlign:'center',display:'flex',flexDirection:'column',height:'100%',justifyContent:'flex-end'}}>
                  <div style={{background:C.s2,borderRadius:4,overflow:'hidden',height:'100%',display:'flex',alignItems:'flex-end'}}>
                    <div style={{width:'100%',height:`${(v/maxV*100)||4}%`,background:c,transition:'height .5s'}}/>
                  </div>
                  <div style={{fontSize:9,color:C.muted,marginTop:3}}>{l}</div>
                  <div style={{fontFamily:"'DM Mono',monospace",fontSize:11,fontWeight:700,color:v>0?c:C.dim}}>
                    {(v/1000).toFixed(1)}t</div>
                </div>
              );
            })}
          </div>
          <div style={{textAlign:'center',marginTop:4,fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,fontWeight:700,
            color:volDiff>=0?C.green:C.red}}>
            {totalLast>0?(volDiff>=0?`+${volDiff}%`:`${volDiff}%`):'—'}</div>
        </Card>
        {/* Muscle grid */}
        <Card>
          <Label sx={{marginBottom:8}}>MUSCOLI</Label>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:4}}>
            {MUSCLE_GROUPS.slice(0,6).map(m=>{
              const last=muscleAge[m];
              const days=last?daysBetween(last,new Date().toISOString()):99;
              const col=getMuscleColor(m);
              return(
                <div key={m} style={{background:`${col}12`,borderRadius:6,padding:'4px 6px',textAlign:'center'}}>
                  <div style={{fontSize:9,fontWeight:700,color:col,textTransform:'uppercase',
                    fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:.3}}>{m}</div>
                  <div style={{fontSize:9,color:C.muted}}>{last?days===0?'oggi':days===1?'1g':`${days}g`:'—'}</div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* PR Board */}
      {prs.length>0&&(
        <Card>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}>
            <Trophy size={14} color={C.gold}/>
            <Label>PERSONAL RECORDS</Label>
          </div>
          {prs.slice(0,5).map(pr=>(
            <div key={pr.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',
              padding:'8px 0',borderBottom:`1px solid ${C.border}`}}>
              <div>
                <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:14,fontWeight:700}}>{pr.exercise}</div>
                <div style={{fontSize:10,color:C.muted}}>{fmtDate(pr.date)}</div>
              </div>
              <div style={{textAlign:'right'}}>
                <div className="shimmer" style={{fontFamily:"'DM Mono',monospace",fontSize:15,fontWeight:700}}>
                  {pr.weight}{unit}×{pr.reps}</div>
                <div style={{fontSize:10,color:C.gold}}>e1RM {pr.rm}{unit}</div>
              </div>
            </div>
          ))}
        </Card>
      )}

      {prs.length===0&&workouts.length===0&&(
        <Card sx={{textAlign:'center',padding:32}}>
          <Dumbbell size={32} color={C.dim} style={{marginBottom:10}}/>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:20,color:C.muted,marginBottom:6}}>
            Nessun allenamento ancora</div>
          <Btn onClick={()=>setTab('logger')} sx={{marginTop:8}}>Inizia il primo →</Btn>
        </Card>
      )}
    </div>
  );
}

// ─── LOGGER ───────────────────────────────────────────────────
function SetRow({set,exId,unit,repRange,dispatch,isFirst}){
  const[editing,setEditing]=useState(false);
  const stepW=2.5;

  return(
    <div style={{display:'flex',alignItems:'center',gap:8,padding:'8px 0',
      borderBottom:`1px solid ${C.border}20`,
      background:set.done?`${C.green}08`:'transparent',
      borderRadius:set.done?8:0,paddingLeft:set.done?8:0,paddingRight:set.done?8:0,
      transition:'all .2s'}}>
      {/* Set number */}
      <div style={{width:26,height:26,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,
        background:set.done?C.green:isFirst?`${C.gold}20`:C.s2,
        border:`1px solid ${set.done?C.green:isFirst?C.gold:C.border}`}}>
        {set.done
          ?<Check size={13} color="#000"/>
          :<span style={{fontFamily:"'DM Mono',monospace",fontSize:11,fontWeight:700,
            color:isFirst?C.gold:C.muted}}>{set.setNum}</span>}
      </div>

      {/* Weight */}
      <div style={{flex:1}}>
        {editing?(
          <Stepper value={set.weight} onChange={v=>dispatch({type:'UPDATE_SET',exId,setId:set.id,updates:{weight:v}})}
            step={stepW} min={0} unit={unit}/>
        ):(
          <button onClick={()=>setEditing(true)}
            style={{background:'none',border:'none',cursor:'pointer',padding:'4px 0',textAlign:'left'}}>
            <span style={{fontFamily:"'DM Mono',monospace",fontSize:18,fontWeight:700,color:set.done?C.muted:C.text}}>
              {set.weight>0?`${set.weight}${unit}`:<span style={{color:C.dim,fontSize:14}}>— {unit}</span>}</span>
          </button>
        )}
      </div>

      {/* × */}
      <span style={{color:C.dim,fontSize:13}}>×</span>

      {/* Reps */}
      <div style={{width:70,display:'flex',alignItems:'center',justifyContent:'center',
        background:C.s2,borderRadius:8,border:`1px solid ${C.border}`,overflow:'hidden',height:36}}>
        <button onClick={()=>dispatch({type:'UPDATE_SET',exId,setId:set.id,updates:{reps:Math.max(0,set.reps-1)}})}
          style={{width:28,height:36,background:'transparent',border:'none',color:C.muted,cursor:'pointer',fontSize:16,flexShrink:0}}>−</button>
        <span style={{fontFamily:"'DM Mono',monospace",fontSize:16,fontWeight:700,color:set.done?C.muted:C.text,minWidth:18,textAlign:'center'}}>
          {set.reps||<span style={{color:C.dim}}>0</span>}</span>
        <button onClick={()=>dispatch({type:'UPDATE_SET',exId,setId:set.id,updates:{reps:set.reps+1}})}
          style={{width:28,height:36,background:'transparent',border:'none',color:C.muted,cursor:'pointer',fontSize:16,flexShrink:0}}>+</button>
      </div>

      {/* Done button */}
      <button onClick={()=>{
          dispatch({type:'TOGGLE_SET_DONE',exId,setId:set.id});
          if(editing)setEditing(false);
        }}
        style={{width:36,height:36,borderRadius:8,flexShrink:0,cursor:'pointer',
          background:set.done?C.green:`${C.green}15`,border:`1px solid ${set.done?C.green:C.green+'40'}`,
          display:'flex',alignItems:'center',justifyContent:'center',transition:'all .15s'}}>
        <Check size={16} color={set.done?'#000':C.green}/>
      </button>

      {/* Remove */}
      <button onClick={()=>dispatch({type:'REMOVE_SET',exId,setId:set.id})}
        style={{width:28,height:28,borderRadius:6,background:'none',border:'none',cursor:'pointer',
          color:C.dim,padding:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
        <X size={13}/>
      </button>
    </div>
  );
}

function WorkoutExercise({ex,workouts,unit,dispatch}){
  const[collapsed,setCollapsed]=useState(false);
  const alert=getProgressionAlert(ex.exercise,ex.repRange,workouts,unit);
  const done=ex.sets.filter(s=>s.done).length;
  const total=ex.sets.length;
  const vol=calcVol(ex.sets.filter(s=>s.done||s.reps>0));

  return(
    <Card sx={{marginBottom:10}}>
      {/* Exercise header */}
      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:collapsed?0:10}}>
        <div style={{flex:1}}>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:17,fontWeight:700}}>{ex.exercise}</div>
          <div style={{display:'flex',gap:10,fontSize:11,color:C.muted,marginTop:2}}>
            <span style={{textTransform:'capitalize'}}>{ex.muscle}</span>
            <span style={{color:C.accent}}>{ex.repRange}</span>
            {vol>0&&<span style={{fontFamily:"'DM Mono',monospace",color:C.gold}}>{(vol/1000).toFixed(2)}t</span>}
          </div>
        </div>
        {/* Progress pill */}
        <div style={{background:done===total&&total>0?`${C.green}20`:C.s2,border:`1px solid ${done===total&&total>0?C.green:C.border}`,
          borderRadius:20,padding:'3px 10px',fontSize:12,fontWeight:700,
          fontFamily:"'DM Mono',monospace",color:done===total&&total>0?C.green:C.muted}}>
          {done}/{total}</div>
        <button onClick={()=>setCollapsed(x=>!x)} style={{background:'none',border:'none',cursor:'pointer',color:C.muted,padding:4}}>
          {collapsed?<ChevronDown size={16}/>:<ChevronUp size={16}/>}</button>
        <button onClick={()=>dispatch({type:'REMOVE_WORKOUT_EXERCISE',exId:ex.id})}
          style={{background:'none',border:'none',cursor:'pointer',color:C.red,padding:4}}><Trash2 size={14}/></button>
      </div>

      {!collapsed&&(
        <>
          {/* Progression alert */}
          {alert&&(
            <div style={{background:`${alert.color}12`,border:`1px solid ${alert.color}30`,borderRadius:8,
              padding:'8px 10px',marginBottom:8,fontSize:12,color:C.text,lineHeight:1.5,
              boxShadow:alert.level==='red'?`0 0 8px ${C.red}20`:'none'}}>
              {alert.msg}
            </div>
          )}

          {/* Column headers */}
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4,paddingRight:72}}>
            <div style={{width:26}}/>
            <div style={{flex:1}}><Label>PESO</Label></div>
            <div style={{width:12}}/>
            <div style={{width:70,textAlign:'center'}}><Label>REPS</Label></div>
          </div>

          {/* Sets */}
          {ex.sets.map((set,i)=>(
            <SetRow key={set.id} set={set} exId={ex.id} unit={unit}
              repRange={ex.repRange} dispatch={dispatch} isFirst={i===0}/>
          ))}

          {/* Add extra set */}
          <button onClick={()=>dispatch({type:'ADD_EXTRA_SET',exId:ex.id})}
            style={{marginTop:8,width:'100%',padding:'6px',border:`1px dashed ${C.border}`,borderRadius:8,
              background:'transparent',color:C.muted,cursor:'pointer',fontSize:12,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700}}>
            + Serie extra
          </button>
        </>
      )}
    </Card>
  );
}

function Logger(){
  const{state,dispatch}=useApp();
  const{settings,workouts,currentWorkout,program}=state;
  const unit=settings.unit;
  const[showPicker,setShowPicker]=useState(false);
  const[showFinish,setShowFinish]=useState(false);
  const[showDiscard,setShowDiscard]=useState(false);
  const[elapsed,setElapsed]=useState(0);
  const t0=useRef(null);

  const suggested=getSuggestedSession(settings.split,workouts);
  const isRest=suggested==='Rest';
  const todayProg=program[suggested]||[];

  useEffect(()=>{
    if(!currentWorkout){t0.current=null;return;}
    if(!t0.current)t0.current=Date.now()-elapsed*1000;
    const id=setInterval(()=>setElapsed(Math.round((Date.now()-t0.current)/1000)),1000);
    return()=>clearInterval(id);
  },[currentWorkout]);

  const fmtT=(s)=>`${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  // PRE-WORKOUT VIEW
  if(!currentWorkout){
    return(
      <div style={{padding:'20px 16px 100px'}}>
        <h2 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:28,fontWeight:700,letterSpacing:1,marginBottom:4}}>
          {isRest?'Giorno di Riposo':suggested}</h2>
        <p style={{color:C.muted,fontSize:13,marginBottom:20}}>
          {isRest?'Recupera, mangia bene e dormi.':
            `${todayProg.length} esercizi · ${todayProg.reduce((a,e)=>a+e.sets,0)} serie totali`}</p>

        {!isRest&&todayProg.length>0&&(
          <Card sx={{marginBottom:20}}>
            <Label sx={{marginBottom:12}}>SCHEDA DI OGGI</Label>
            {todayProg.map((ex,i)=>{
              const lastSets=getLastSessionSets(workouts,ex.exercise);
              const lastW=lastSets[0]?.weight||getLastWeightForExercise(workouts,ex.exercise)||0;
              return(
                <div key={ex.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',
                  padding:'10px 0',borderBottom:i<todayProg.length-1?`1px solid ${C.border}`:'none'}}>
                  <div>
                    <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:15,fontWeight:700}}>{ex.exercise}</div>
                    <div style={{fontSize:11,color:C.muted,marginTop:1}}>{ex.sets} serie · {ex.repRange} reps</div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    {lastW>0&&<div style={{fontFamily:"'DM Mono',monospace",fontSize:13,color:C.gold}}>{lastW}{unit}</div>}
                    <div style={{fontSize:10,color:C.muted}}>{lastW>0?'ultima volta':'prima volta'}</div>
                  </div>
                </div>
              );
            })}
          </Card>
        )}

        {isRest?(
          <div style={{textAlign:'center',padding:'32px 0'}}>
            <Moon size={40} color={C.accent} style={{marginBottom:12}}/>
            <div style={{color:C.muted}}>Torna domani più forte 💪</div>
          </div>
        ):(
          <Btn onClick={()=>dispatch({type:'START_WORKOUT',splitDay:suggested})}
            sx={{width:'100%',padding:'16px',fontSize:20,letterSpacing:2}}>
            {todayProg.length===0?'INIZIA ALLENAMENTO LIBERO':'INIZIA ALLENAMENTO →'}
          </Btn>
        )}
        {isRest&&(
          <Btn onClick={()=>dispatch({type:'START_WORKOUT',splitDay:'Training'})} variant="ghost"
            sx={{width:'100%',padding:'14px',fontSize:16,marginTop:12}}>
            Allena comunque
          </Btn>
        )}
      </div>
    );
  }

  // ACTIVE WORKOUT VIEW
  const doneCount=currentWorkout.exercises.reduce((a,e)=>a+e.sets.filter(s=>s.done).length,0);
  const totalCount=currentWorkout.exercises.reduce((a,e)=>a+e.sets.length,0);
  const totalVol=currentWorkout.exercises.reduce((a,e)=>a+calcVol(e.sets.filter(s=>s.done||s.reps>0)),0);
  const pct=totalCount>0?Math.round(doneCount/totalCount*100):0;

  return(
    <div style={{padding:'12px 16px 100px'}}>
      {/* Workout bar */}
      <div style={{background:C.s1,border:`1px solid ${C.accent}40`,borderRadius:12,padding:'10px 14px',
        marginBottom:14,boxShadow:`0 0 16px ${C.accent}10`}}>
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:8}}>
          <div style={{flex:1}}>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:20,fontWeight:700,color:C.accent}}>
              {currentWorkout.splitDay}</div>
            <div style={{display:'flex',gap:12,fontSize:11,color:C.muted,marginTop:2}}>
              <span style={{display:'flex',alignItems:'center',gap:3}}><Clock size={10}/>{fmtT(elapsed)}</span>
              <span>{doneCount}/{totalCount} serie</span>
              {totalVol>0&&<span style={{fontFamily:"'DM Mono',monospace",color:C.gold}}>{(totalVol/1000).toFixed(2)}t</span>}
            </div>
          </div>
          <Btn onClick={()=>setShowDiscard(true)} variant="ghost" small>Annulla</Btn>
          <Btn onClick={()=>setShowFinish(true)} variant="gold" small>Fine 🏆</Btn>
        </div>
        {/* Progress bar */}
        <div style={{height:3,background:C.s2,borderRadius:2,overflow:'hidden'}}>
          <div style={{height:'100%',width:`${pct}%`,background:`linear-gradient(90deg,${C.accent},${C.green})`,
            borderRadius:2,transition:'width .4s'}}/>
        </div>
      </div>

      {/* Exercises */}
      {currentWorkout.exercises.map(ex=>(
        <WorkoutExercise key={ex.id} ex={ex} workouts={workouts} unit={unit} dispatch={dispatch}/>
      ))}

      {/* Add exercise */}
      <button onClick={()=>setShowPicker(true)}
        style={{width:'100%',padding:'12px',border:`2px dashed ${C.accent}30`,borderRadius:12,
          background:'transparent',color:C.accent,cursor:'pointer',fontSize:14,
          fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,
          display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
        <Plus size={16}/> AGGIUNGI ESERCIZIO
      </button>

      {showPicker&&<ExercisePicker
        onAdd={(exercise,sets,rr)=>dispatch({type:'ADD_WORKOUT_EXERCISE',exercise,sets,repRange:rr})}
        onClose={()=>setShowPicker(false)}/>}

      {/* Discard modal */}
      {showDiscard&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.85)',zIndex:300,display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
          <Card sx={{maxWidth:300,width:'100%',textAlign:'center'}}>
            <h3 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:22,marginBottom:8}}>Annullare?</h3>
            <p style={{color:C.muted,fontSize:13,marginBottom:16}}>I dati dell'allenamento saranno persi.</p>
            <div style={{display:'flex',gap:8}}>
              <Btn onClick={()=>setShowDiscard(false)} variant="ghost" sx={{flex:1}}>Continua</Btn>
              <Btn onClick={()=>{dispatch({type:'DISCARD_WORKOUT'});setShowDiscard(false);}} variant="danger" sx={{flex:1}}>Annulla</Btn>
            </div>
          </Card>
        </div>
      )}

      {/* Finish modal */}
      {showFinish&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.85)',zIndex:300,display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
          <Card sx={{maxWidth:300,width:'100%',textAlign:'center'}}>
            <Trophy size={36} color={C.gold} style={{marginBottom:8}}/>
            <h3 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:24,marginBottom:8}}>Salva allenamento?</h3>
            <div style={{display:'flex',justify:'center',gap:16,justifyContent:'center',marginBottom:4}}>
              <div>
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:20,color:C.accent}}>{fmtT(elapsed)}</div>
                <div style={{fontSize:10,color:C.muted}}>durata</div>
              </div>
              <div>
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:20,color:C.gold}}>{doneCount}</div>
                <div style={{fontSize:10,color:C.muted}}>serie</div>
              </div>
              <div>
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:20,color:C.green}}>{(totalVol/1000).toFixed(1)}t</div>
                <div style={{fontSize:10,color:C.muted}}>volume</div>
              </div>
            </div>
            <div style={{display:'flex',gap:8,marginTop:16}}>
              <Btn onClick={()=>setShowFinish(false)} variant="ghost" sx={{flex:1}}>Indietro</Btn>
              <Btn onClick={()=>{dispatch({type:'COMPLETE_WORKOUT'});setShowFinish(false);}} variant="gold" sx={{flex:1}}>Salva 🏆</Btn>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

// ─── STATS ────────────────────────────────────────────────────
const CT=({active,payload,label,unit=''})=>{
  if(!active||!payload?.length)return null;
  return<div style={{background:C.s2,border:`1px solid ${C.border}`,borderRadius:8,padding:'8px 12px',fontSize:12}}>
    <div style={{color:C.muted,marginBottom:4}}>{label}</div>
    {payload.map((p,i)=><div key={i} style={{color:p.color,fontFamily:"'DM Mono',monospace",fontWeight:700}}>
      {p.name}: {p.value}{unit}</div>)}
  </div>;
};

function StatsPage(){
  const{state}=useApp();
  const{workouts,settings}=state;
  const unit=settings.unit;
  const[sel,setSel]=useState('');
  const[showSel,setShowSel]=useState(false);
  const[search,setSearch]=useState('');

  const loggedEx=useMemo(()=>{
    const s=new Set();
    workouts.forEach(w=>w.exercises?.forEach(e=>s.add(e.exercise)));
    return[...s].sort();
  },[workouts]);

  useEffect(()=>{if(loggedEx.length&&!sel)setSel(loggedEx[0]);},[loggedEx]);

  const exData=useMemo(()=>{
    if(!sel)return[];
    const rows=[];
    const sorted=[...workouts].sort((a,b)=>new Date(a.date)-new Date(b.date));
    for(const w of sorted){
      for(const ex of(w.exercises||[])){
        if(ex.exercise===sel){
          const sets=ex.sets?.filter(s=>s.weight>0&&s.reps>0)||[];
          if(!sets.length)continue;
          const topSet=sets.sort((a,b)=>b.weight-a.weight)[0];
          rows.push({date:fmtDate(w.date),weight:topSet.weight,reps:topSet.reps,
            rm:epley(topSet.weight,topSet.reps),vol:Math.round(calcVol(sets))});
        }
      }
    }
    return rows;
  },[sel,workouts]);

  const radarData=useMemo(()=>{
    const vol=getWeeklyVolume(workouts,0);
    return MUSCLE_GROUPS.map(m=>({m:m.charAt(0).toUpperCase()+m.slice(1,4),v:Math.round((vol[m]||0)/100)/10}));
  },[workouts]);

  const totalVol=workouts.reduce((a,w)=>a+(w.totalVolume||0),0);

  return(
    <div style={{padding:'16px 16px 100px'}}>
      <h2 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:28,fontWeight:700,letterSpacing:1,marginBottom:16}}>STATISTICHE</h2>

      {/* Global pills */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,marginBottom:16}}>
        {[{l:'SESSIONI',v:workouts.length,c:C.accent},
          {l:'VOLUME TOT',v:`${(totalVol/1000).toFixed(0)}t`,c:C.gold},
          {l:'ESERCIZI',v:loggedEx.length,c:C.green}].map(s=>(
          <Card key={s.l} sx={{textAlign:'center',padding:'10px 8px'}}>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:22,fontWeight:700,color:s.c}}>{s.v}</div>
            <Label sx={{marginTop:2}}>{s.l}</Label>
          </Card>
        ))}
      </div>

      {workouts.length===0&&(
        <Card sx={{textAlign:'center',padding:40,color:C.muted}}>
          <BarChart2 size={32} style={{marginBottom:8,opacity:.3}}/>
          <div>Completa il tuo primo allenamento per vedere le statistiche.</div>
        </Card>
      )}

      {workouts.length>0&&(
        <>
          {/* Radar */}
          <Card sx={{marginBottom:14}}>
            <Label sx={{marginBottom:8}}>VOLUME MUSCOLARE SETTIMANALE</Label>
            <ResponsiveContainer width="100%" height={180}>
              <RadarChart data={radarData} margin={{top:4,right:20,left:20,bottom:4}}>
                <PolarGrid stroke={C.border}/>
                <PolarAngleAxis dataKey="m" tick={{fill:C.muted,fontSize:10}}/>
                <PolarRadiusAxis tick={false} axisLine={false}/>
                <Radar dataKey="v" stroke={C.accent} fill={C.accent} fillOpacity={0.18}/>
                <Tooltip content={<CT unit="t"/>}/>
              </RadarChart>
            </ResponsiveContainer>
          </Card>

          {/* Exercise selector */}
          <Card sx={{marginBottom:12}}>
            <Label sx={{marginBottom:8}}>PROGRESSIONE ESERCIZIO</Label>
            <button onClick={()=>setShowSel(x=>!x)}
              style={{width:'100%',background:C.s2,border:`1px solid ${C.border}`,borderRadius:8,
                padding:'10px 12px',color:C.text,cursor:'pointer',textAlign:'left',
                display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:14,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700}}>
              {sel||'Seleziona esercizio'}<ChevronDown size={14} color={C.muted}/>
            </button>
            {showSel&&(
              <div style={{marginTop:8}}>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cerca…" style={{marginBottom:8}}/>
                <div style={{maxHeight:160,overflowY:'auto',display:'flex',flexDirection:'column',gap:4}}>
                  {loggedEx.filter(e=>e.toLowerCase().includes(search.toLowerCase())).map(e=>(
                    <button key={e} onClick={()=>{setSel(e);setShowSel(false);setSearch('');}}
                      style={{padding:'8px 12px',background:e===sel?`${C.accent}15`:C.s2,
                        border:`1px solid ${e===sel?C.accent:C.border}`,borderRadius:6,
                        color:e===sel?C.accent:C.text,cursor:'pointer',textAlign:'left',fontSize:13}}>{e}</button>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {sel&&exData.length>0&&(
            <Card>
              {/* Weight progression */}
              <Label sx={{marginBottom:8}}>PESO TOP SET</Label>
              <ResponsiveContainer width="100%" height={140}>
                <LineChart data={exData} margin={{top:4,right:4,left:-20,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border}/>
                  <XAxis dataKey="date" tick={{fill:C.muted,fontSize:9}} tickLine={false}/>
                  <YAxis tick={{fill:C.muted,fontSize:9}} tickLine={false}/>
                  <Tooltip content={<CT unit={unit}/>}/>
                  <Line type="monotone" dataKey="weight" stroke={C.accent} strokeWidth={2} dot={{fill:C.accent,r:3}} name="Peso"/>
                </LineChart>
              </ResponsiveContainer>
              {/* 1RM */}
              <Label sx={{marginTop:12,marginBottom:8}}>1RM STIMATO (Epley)</Label>
              <ResponsiveContainer width="100%" height={110}>
                <LineChart data={exData} margin={{top:4,right:4,left:-20,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border}/>
                  <XAxis dataKey="date" tick={{fill:C.muted,fontSize:9}} tickLine={false}/>
                  <YAxis tick={{fill:C.muted,fontSize:9}} tickLine={false}/>
                  <Tooltip content={<CT unit={unit}/>}/>
                  <Line type="monotone" dataKey="rm" stroke={C.gold} strokeWidth={2} dot={{fill:C.gold,r:3}} name="e1RM"/>
                </LineChart>
              </ResponsiveContainer>
              {/* Last 5 sessions */}
              <Label sx={{marginTop:12,marginBottom:8}}>ULTIME 5 SESSIONI</Label>
              <div style={{borderRadius:8,overflow:'hidden',border:`1px solid ${C.border}`}}>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',
                  background:C.s2,padding:'6px 12px'}}>
                  {['DATA','PESO','REPS','e1RM'].map(h=><Label key={h}>{h}</Label>)}
                </div>
                {exData.slice(-5).reverse().map((s,i)=>{
                  const prev=exData.slice(-5).reverse()[i+1];
                  const dir=prev?(s.rm>prev.rm?'up':s.rm<prev.rm?'down':'eq'):'eq';
                  return(
                    <div key={i} style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',
                      padding:'8px 12px',borderTop:`1px solid ${C.border}`,
                      background:i%2===0?'transparent':C.s1}}>
                      <span style={{fontSize:11,color:C.muted}}>{s.date}</span>
                      <span style={{fontFamily:"'DM Mono',monospace",fontSize:12}}>{s.weight}{unit}</span>
                      <span style={{fontFamily:"'DM Mono',monospace",fontSize:12}}>{s.reps}</span>
                      <span style={{display:'flex',alignItems:'center',gap:3,fontFamily:"'DM Mono',monospace",fontSize:12,
                        color:dir==='up'?C.green:dir==='down'?C.red:C.muted}}>
                        {dir==='up'?<ArrowUp size={10}/>:dir==='down'?<ArrowDown size={10}/>:<Minus size={10}/>}
                        {s.rm}{unit}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
          {sel&&exData.length===0&&<Card sx={{textAlign:'center',padding:24,color:C.muted}}>Nessun dato per {sel}.</Card>}
        </>
      )}
    </div>
  );
}

// ─── HISTORY ─────────────────────────────────────────────────
function CalHeatmap({workouts}){
  const today=new Date();today.setHours(0,0,0,0);
  const volByDate={};
  workouts.forEach(w=>{const k=new Date(w.date).toDateString();volByDate[k]=(volByDate[k]||0)+(w.totalVolume||0);});
  const maxV=Math.max(...Object.values(volByDate),1);
  const weeks=14;
  const start=new Date(today);
  start.setDate(start.getDate()-weeks*7+1);
  const cols=[];
  for(let w=0;w<weeks;w++){
    const col=[];
    for(let d=0;d<7;d++){
      const date=new Date(start);date.setDate(start.getDate()+w*7+d);
      const k=date.toDateString();
      const vol=volByDate[k]||0;
      col.push({date,vol,int:vol>0?Math.max(.15,vol/maxV):0,isToday:date.toDateString()===today.toDateString()});
    }
    cols.push(col);
  }
  return(
    <div>
      <div style={{display:'flex',gap:2,overflowX:'auto',paddingBottom:4}}>
        {cols.map((col,wi)=>(
          <div key={wi} style={{display:'flex',flexDirection:'column',gap:2}}>
            {col.map((c,di)=>(
              <div key={di} title={`${c.date.toLocaleDateString('it-IT')}: ${(c.vol/1000).toFixed(1)}t`}
                style={{width:13,height:13,borderRadius:2,flexShrink:0,
                  background:c.vol>0?`rgba(14,165,233,${c.int})`:'rgba(255,255,255,0.04)',
                  border:c.isToday?`1px solid ${C.accent}`:'1px solid transparent'}}/>
            ))}
          </div>
        ))}
      </div>
      <div style={{display:'flex',alignItems:'center',gap:4,marginTop:6,justifyContent:'flex-end'}}>
        <span style={{fontSize:9,color:C.muted}}>Meno</span>
        {[.05,.2,.4,.7,1].map(i=><div key={i} style={{width:9,height:9,borderRadius:2,background:`rgba(14,165,233,${i})`}}/>)}
        <span style={{fontSize:9,color:C.muted}}>Più</span>
      </div>
    </div>
  );
}

function HistoryPage(){
  const{state}=useApp();
  const{workouts,settings}=state;
  const unit=settings.unit;
  const[open,setOpen]=useState(null);
  const sorted=[...workouts].sort((a,b)=>new Date(b.date)-new Date(a.date));

  return(
    <div style={{padding:'16px 16px 100px'}}>
      <h2 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:28,fontWeight:700,letterSpacing:1,marginBottom:16}}>STORICO</h2>
      <Card sx={{marginBottom:16}}>
        <Label sx={{marginBottom:10}}>HEATMAP ALLENAMENTI</Label>
        <CalHeatmap workouts={workouts}/>
      </Card>
      <Label sx={{marginBottom:10}}>TUTTI GLI ALLENAMENTI ({sorted.length})</Label>
      {sorted.length===0&&(
        <Card sx={{textAlign:'center',padding:40,color:C.muted}}>
          <Calendar size={32} style={{marginBottom:8,opacity:.3}}/>
          <div>Nessun allenamento salvato.</div>
        </Card>
      )}
      {sorted.map(w=>{
        const isOpen=open===w.id;
        const vol=(w.totalVolume||0)/1000;
        return(
          <Card key={w.id} sx={{marginBottom:8}}>
            <button onClick={()=>setOpen(isOpen?null:w.id)}
              style={{width:'100%',background:'none',border:'none',cursor:'pointer',textAlign:'left',color:C.text}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <div>
                  <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:16,fontWeight:700}}>
                    {w.splitDay}
                    <span style={{color:C.muted,fontWeight:400,fontSize:12,marginLeft:8}}>{fmtDateFull(w.date)}</span>
                  </div>
                  <div style={{fontSize:11,color:C.muted,marginTop:2}}>
                    {w.exercises?.length||0} esercizi · {vol.toFixed(1)}t
                  </div>
                </div>
                {isOpen?<ChevronUp size={14} color={C.muted}/>:<ChevronDown size={14} color={C.muted}/>}
              </div>
            </button>
            {isOpen&&(
              <div style={{marginTop:12,paddingTop:12,borderTop:`1px solid ${C.border}`}}>
                {w.exercises?.map(ex=>{
                  const sets=ex.sets?.filter(s=>s.reps>0)||[];
                  if(!sets.length)return null;
                  const best=sets.sort((a,b)=>b.weight-a.weight)[0];
                  return(
                    <div key={ex.id} style={{marginBottom:10}}>
                      <div style={{display:'flex',justifyContent:'space-between',marginBottom:4,alignItems:'center'}}>
                        <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:14,fontWeight:700}}>{ex.exercise}</span>
                        {best&&<span style={{fontFamily:"'DM Mono',monospace",fontSize:12,color:C.gold}}>
                          {best.weight}{unit}×{best.reps}</span>}
                      </div>
                      {sets.map((s,i)=>(
                        <div key={s.id||i} style={{display:'flex',alignItems:'center',gap:8,padding:'3px 0',
                          fontSize:12,color:C.muted,borderTop:`1px solid ${C.border}20`}}>
                          <span style={{width:20,textAlign:'center',fontFamily:"'DM Mono',monospace",fontSize:11}}>{s.setNum}</span>
                          <span style={{fontFamily:"'DM Mono',monospace",color:C.text}}>
                            {s.weight>0?`${s.weight}${unit}`:'BW'} × {s.reps}</span>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

// ─── SETTINGS ─────────────────────────────────────────────────
function SettingsPage(){
  const{state,dispatch}=useApp();
  const{settings,program}=state;
  const[showReset,setShowReset]=useState(false);
  const[showResetW,setShowResetW]=useState(false);
  const[editProg,setEditProg]=useState(false);
  const[localProg,setLocalProg]=useState(program);

  const update=(k,v)=>dispatch({type:'UPDATE_SETTINGS',payload:{[k]:v}});

  return(
    <div style={{padding:'16px 16px 100px'}}>
      <h2 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:28,fontWeight:700,letterSpacing:1,marginBottom:20}}>IMPOSTAZIONI</h2>

      {/* Unit */}
      <Card sx={{marginBottom:10}}>
        <Label sx={{marginBottom:10}}>UNITÀ DI MISURA</Label>
        <div style={{display:'flex',gap:8}}>
          {['kg','lbs'].map(u=>(
            <button key={u} onClick={()=>update('unit',u)}
              style={{flex:1,padding:'12px',borderRadius:10,cursor:'pointer',
                fontFamily:"'Barlow Condensed',sans-serif",fontSize:22,fontWeight:700,
                border:`2px solid ${settings.unit===u?C.accent:C.border}`,
                background:settings.unit===u?`${C.accent}15`:C.s2,
                color:settings.unit===u?C.accent:C.muted,
                boxShadow:settings.unit===u?`0 0 12px ${C.accent}25`:'none',transition:'all .2s'}}>
              {u.toUpperCase()}</button>
          ))}
        </div>
        <p style={{fontSize:11,color:C.red,marginTop:8}}>⚠️ Cambiare unità non converte i dati esistenti.</p>
      </Card>

      {/* Split */}
      <Card sx={{marginBottom:10}}>
        <Label sx={{marginBottom:10}}>SPLIT DI ALLENAMENTO</Label>
        <div style={{display:'flex',flexDirection:'column',gap:6}}>
          {Object.values(SPLITS).map(s=>(
            <button key={s.id} onClick={()=>update('split',s.id)}
              style={{padding:'10px 12px',borderRadius:8,cursor:'pointer',textAlign:'left',
                border:`1px solid ${settings.split===s.id?C.accent:C.border}`,
                background:settings.split===s.id?`${C.accent}12`:C.s2,transition:'all .2s'}}>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:15,fontWeight:700,
                color:settings.split===s.id?C.accent:C.text}}>{s.name}</div>
              <div style={{fontSize:11,color:C.muted}}>
                {s.schedule.filter((d,i,a)=>a.indexOf(d)===i&&d!=='Rest').join(' · ')}</div>
            </button>
          ))}
        </div>
      </Card>

      {/* Program editor */}
      <Card sx={{marginBottom:10}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
          <Label>PROGRAMMA DI ALLENAMENTO</Label>
          {!editProg
            ?<Btn onClick={()=>{setLocalProg(program);setEditProg(true);}} small variant="ghost"><Edit2 size={12}/> Modifica</Btn>
            :<div style={{display:'flex',gap:6}}>
              <Btn onClick={()=>setEditProg(false)} small variant="ghost">Annulla</Btn>
              <Btn onClick={()=>{dispatch({type:'UPDATE_PROGRAM',program:localProg});setEditProg(false);}} small>Salva</Btn>
            </div>}
        </div>
        {editProg
          ?<ProgramBuilderStep split={settings.split} program={localProg} onChange={setLocalProg}/>
          :<div>{Object.entries(program).map(([day,exs])=>(
            <div key={day} style={{marginBottom:10}}>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:14,fontWeight:700,color:C.accent,marginBottom:4}}>{day}</div>
              {(exs||[]).map(ex=>(
                <div key={ex.id} style={{display:'flex',justifyContent:'space-between',padding:'4px 0',
                  fontSize:12,borderBottom:`1px solid ${C.border}20`}}>
                  <span style={{color:C.text}}>{ex.exercise}</span>
                  <span style={{fontFamily:"'DM Mono',monospace",color:C.muted}}>{ex.sets}×{ex.repRange}</span>
                </div>
              ))}
            </div>
          ))}</div>}
      </Card>

      {/* Danger zone */}
      <Card sx={{border:`1px solid ${C.red}30`,marginBottom:10}}>
        <Label sx={{color:C.red,marginBottom:12}}>ZONA PERICOLO</Label>
        <Btn onClick={()=>setShowResetW(true)} variant="ghost"
          sx={{width:'100%',marginBottom:8,borderColor:`${C.red}50`,color:C.red}}>
          Cancella storico allenamenti
        </Btn>
        <Btn onClick={()=>setShowReset(true)} variant="danger" sx={{width:'100%'}}>
          Reset completo app
        </Btn>
      </Card>

      {showResetW&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.85)',zIndex:300,display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
          <Card sx={{maxWidth:300,width:'100%',textAlign:'center'}}>
            <h3 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:20,marginBottom:8}}>Cancellare lo storico?</h3>
            <p style={{color:C.muted,fontSize:13,marginBottom:16}}>Tutti gli allenamenti saranno eliminati. Le impostazioni e il programma rimarranno.</p>
            <div style={{display:'flex',gap:8}}>
              <Btn onClick={()=>setShowResetW(false)} variant="ghost" sx={{flex:1}}>Annulla</Btn>
              <Btn onClick={()=>{dispatch({type:'RESET_WORKOUTS'});setShowResetW(false);}} variant="danger" sx={{flex:1}}>Cancella</Btn>
            </div>
          </Card>
        </div>
      )}
      {showReset&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.85)',zIndex:300,display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
          <Card sx={{maxWidth:300,width:'100%',textAlign:'center'}}>
            <AlertTriangle size={28} color={C.red} style={{marginBottom:8}}/>
            <h3 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:20,marginBottom:8}}>Reset completo?</h3>
            <p style={{color:C.muted,fontSize:13,marginBottom:16}}>Tutto sarà cancellato: allenamenti, programma e impostazioni.</p>
            <div style={{display:'flex',gap:8}}>
              <Btn onClick={()=>setShowReset(false)} variant="ghost" sx={{flex:1}}>Annulla</Btn>
              <Btn onClick={()=>{dispatch({type:'RESET_ALL'});setShowReset(false);}} variant="danger" sx={{flex:1}}>Reset</Btn>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

// ─── BOTTOM NAV ───────────────────────────────────────────────
function BottomNav({tab,setTab,hasWorkout}){
  const tabs=[
    {id:'dashboard',icon:<Activity size={20}/>,label:'Home'},
    {id:'logger',icon:<Dumbbell size={20}/>,label:'Log'},
    {id:'stats',icon:<BarChart2 size={20}/>,label:'Stats'},
    {id:'history',icon:<Calendar size={20}/>,label:'Storico'},
    {id:'settings',icon:<Settings size={20}/>,label:'Impost.'},
  ];
  return(
    <div style={{position:'fixed',bottom:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:430,
      background:C.s1,borderTop:`1px solid ${C.border}`,display:'flex',zIndex:50,
      paddingBottom:'env(safe-area-inset-bottom,0)'}}>
      {tabs.map(t=>{
        const active=tab===t.id;
        return(
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{flex:1,padding:'10px 4px 8px',background:'none',border:'none',cursor:'pointer',
              display:'flex',flexDirection:'column',alignItems:'center',gap:3,
              color:active?C.accent:C.muted,position:'relative',transition:'color .15s'}}>
            {t.id==='logger'&&hasWorkout&&(
              <span style={{position:'absolute',top:8,right:'22%',width:7,height:7,borderRadius:'50%',
                background:C.green,boxShadow:`0 0 6px ${C.green}`}}/>
            )}
            <div style={{filter:active?`drop-shadow(0 0 5px ${C.accent})`:'none',transition:'filter .15s'}}>
              {t.icon}
            </div>
            <span style={{fontSize:9,fontWeight:700,letterSpacing:.3,
              fontFamily:"'Barlow Condensed',sans-serif",textTransform:'uppercase'}}>{t.label}</span>
            {active&&<div style={{position:'absolute',top:0,left:'50%',transform:'translateX(-50%)',
              width:20,height:2,background:C.accent,borderRadius:1}}/>}
          </button>
        );
      })}
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────
function MainApp(){
  const{state}=useApp();
  const[tab,setTab]=useState('dashboard');
  const hasWorkout=!!state.currentWorkout;
  const map={
    dashboard:<Dashboard setTab={setTab}/>,
    logger:<Logger/>,
    stats:<StatsPage/>,
    history:<HistoryPage/>,
    settings:<SettingsPage/>,
  };
  return(
    <div style={{maxWidth:430,margin:'0 auto',minHeight:'100vh',background:C.bg,position:'relative',
      backgroundImage:'linear-gradient(rgba(14,165,233,0.018) 1px,transparent 1px),linear-gradient(90deg,rgba(14,165,233,0.018) 1px,transparent 1px)',
      backgroundSize:'40px 40px'}}>
      <div className="fade-in" key={tab}>{map[tab]}</div>
      <BottomNav tab={tab} setTab={setTab} hasWorkout={hasWorkout}/>
    </div>
  );
}

function AppContent(){
  const{state}=useApp();
  return state.settings.setupComplete?<MainApp/>:<SetupFlow/>;
}

export default function IronLog(){
  return<AppProvider><GlobalStyles/><AppContent/></AppProvider>;
}
