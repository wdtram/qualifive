const Rem={
modos:{normal:[168,72,24],intensivo:[168,72,24,3],minimo:[24]},
dt:a=>new Date(a.fecha+'T'+a.hora),
plan(a,modo,extra){const h=[...this.modos[modo]];if(extra)h.push(extra);const t=this.dt(a);
 return h.map(x=>({h:x,en:new Date(t-x*36e5)})).filter(r=>r.en>new Date()).sort((x,y)=>x.en-y.en)},
ics(a){const l=d=>d.getFullYear()+String(d.getMonth()+1).padStart(2,0)+String(d.getDate()).padStart(2,0)+'T'+String(d.getHours()).padStart(2,0)+String(d.getMinutes()).padStart(2,0)+'00',s=this.dt(a),e=new Date(+s+36e5),
 al=[1440,180].map(m=>`BEGIN:VALARM\nACTION:DISPLAY\nDESCRIPTION:Cita médica\nTRIGGER:-PT${m}M\nEND:VALARM`).join('\n');
 return `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//QualiFive//ES\nBEGIN:VEVENT\nUID:${a.id}@qualifive\nDTSTAMP:${l(new Date())}\nDTSTART;TZID=America/Santiago:${l(s)}\nDTEND;TZID=America/Santiago:${l(e)}\nSUMMARY:${a.esp} - ${a.lugar}\nLOCATION:${a.dir||a.lugar}\n${al}\nEND:VEVENT\nEND:VCALENDAR`},
notify(t){if('Notification' in window&&Notification.permission==='granted'){new Notification('QualiFive',{body:t});return true}return false}};
