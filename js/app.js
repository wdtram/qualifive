const K='qf1',$=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let S=JSON.parse(localStorage.getItem(K)||'null')||{a:[],cfg:{modo:'normal',fs:16,hc:false},sel:null,log:[]};
const save=()=>localStorage.setItem(K,JSON.stringify(S));
const V=[['inicio','Inicio'],['citas','Mis citas'],['rec','Recordatorios'],['ayuda','Centro de ayuda'],['plan','Mi plan'],['hist','Historial'],['cfg','Configuración']];
const D=[['transporte','Transporte',['Revisar recorridos','Elegir alternativa de traslado','Programar hora de salida']],
['olvido','Olvido de la cita',['Activar recordatorios intensivos','Agregar la cita al calendario']],
['laboral','Trabajo o estudios',['Generar solicitud de permiso','Conversar con empleador/institución']],
['acomp','Necesito acompañamiento',['Crear invitación','Coordinar acompañante']],
['salud','Salud o imprevisto',['Decidir cómo avisar al establecimiento','Reconfirmar más adelante']],
['docs','Documentos o preparación',['Armar lista de preparación','Completar pendientes']],
['otro','Otro motivo',['Describir y definir una acción']],['nr','Prefiero no responder',[]]];
const ES=['Registrada','Confirmada inicialmente','Reconfirmación pendiente','Reconfirmada','Con dificultades','Posible inasistencia comunicada por el paciente','Atención finalizada'];
let view='inicio';
const cur=()=>S.a.find(a=>a.id===S.sel)||S.a.filter(a=>a.estado!==ES[6])[0];
const log=t=>{S.log.unshift({t,w:new Date().toISOString()});save()};
const fmt=a=>new Date(a.fecha+'T'+a.hora).toLocaleString('es-CL',{dateStyle:'full',timeStyle:'short'});
function go(v){view=v;nav();R[v]();$('#main').focus();scrollTo(0,0)}
function nav(){$('#nav').innerHTML=V.map(([k,n])=>`<button onclick="go('${k}')" ${k===view?'aria-current="true"':''}>${n}</button>`).join('');
 document.documentElement.style.setProperty('--fs',S.cfg.fs+'px');document.body.classList.toggle('hc',S.cfg.hc)}
const none=()=>`<div class="card"><p>Aún no tienes citas. Registra una (datos ficticios) para empezar.</p><button onclick="go('citas')">Registrar cita</button></div>`;
const dl=(n,t,m)=>{const u=URL.createObjectURL(new Blob([t],{type:m}));Object.assign(document.createElement('a'),{href:u,download:n}).click()};
function dif(a,k){return (a.dif||[]).find(d=>d.k===k)}
function setTask(i,j,v){const a=cur();a.dif[i].t[j].e=v;log('Tarea "'+a.dif[i].t[j].n+'": '+v);save();
 if(a.dif[i].t.every(t=>t.e==='Resuelta'))a.ask=a.dif[i].n;save();go(view)}
function mark(k,name){const a=cur(),d=dif(a,k);if(!d)return;const t=d.t.find(x=>x.n===name);if(t&&t.e!=='Resuelta'){t.e='Resuelta';log('Completó: '+name);save();if(d.t.every(x=>x.e==='Resuelta'))a.ask=d.n;save()}}
const R={
inicio(){
  const a = cur();
  if(!a){
    $('#main').innerHTML = `
      <h1>Confirmar no garantiza asistir. Te ayudamos a llegar.</h1>
      ${none()}
    `;
    return;
  }

  const totalDif = (a.dif || []).length;
  const totalTasks = (a.dif || []).flatMap(d => d.t || []).length;
  const doneTasks = (a.dif || []).flatMap(d => d.t || []).filter(t => t.e === 'Resuelta').length;
  const pendingTasks = totalTasks - doneTasks;
  const lastConf = (a.conf || []).length ? a.conf[(a.conf || []).length - 1] : null;
  const reconfLabel = a.estado === ES[3] ? 'Actualizar mi disponibilidad' : 'Reconfirmar asistencia';

  $('#main').innerHTML = `
    <h1>Confirmar no garantiza asistir. Te ayudamos a llegar.</h1>

    <section class="hero-home card">
      <div class="hero-home__content">
        <div class="kicker">MI PRÓXIMA CITA</div>
        <span class="tag">${a.estado}</span>
        <h2 class="hero-home__title">${esc(a.esp)} — ${esc(a.lugar)}</h2>
        <p class="hero-home__meta">${fmt(a)}</p>
        ${a.dir ? `<p class="hero-home__meta">📍 ${esc(a.dir)}</p>` : ''}

        <div class="countdown-panel">
          <div class="countdown-label">Tiempo restante</div>
          <div class="countdown-value" id="cd"></div>
        </div>

        <div class="cta-row">
          <button onclick="S.sel='${a.id}';go('rec')">${reconfLabel}</button>
          <button class="s" onclick="go('plan')">Ver mi plan</button>
          <button class="s" onclick="go('ayuda')">Necesito ayuda</button>
        </div>
      </div>
    </section>

    <section class="metrics-strip">
      <div class="metric-card">
        <div class="metric-card__value">${totalDif}</div>
        <div class="metric-card__label">Dificultades registradas</div>
      </div>
      <div class="metric-card">
        <div class="metric-card__value">${pendingTasks}</div>
        <div class="metric-card__label">Tareas pendientes</div>
      </div>
      <div class="metric-card">
        <div class="metric-card__value">${doneTasks}/${totalTasks || 0}</div>
        <div class="metric-card__label">Avance de preparación</div>
      </div>
      <div class="metric-card">
        <div class="metric-card__value">${a.salida ? 'Lista' : 'Pendiente'}</div>
        <div class="metric-card__label">Hora de salida</div>
      </div>
    </section>

    <section class="home-grid-2">
      <article class="card soft-card">
        <div class="section-top">
          <div>
            <div class="kicker">ESTADO DE ASISTENCIA</div>
            <h2>Seguimiento de tu disponibilidad</h2>
          </div>
        </div>

        <div class="info-list">
          <div class="info-item">
            <span class="info-item__label">Estado actual</span>
            <span class="info-item__value">${a.estado}</span>
          </div>
          <div class="info-item">
            <span class="info-item__label">Última respuesta</span>
            <span class="info-item__value">${lastConf ? esc(lastConf.r) : 'Sin respuestas todavía'}</span>
          </div>
          <div class="info-item">
            <span class="info-item__label">Última actualización</span>
            <span class="info-item__value">${lastConf ? new Date(lastConf.w).toLocaleString('es-CL') : '—'}</span>
          </div>
        </div>

        <div class="cta-row">
          <button class="s" onclick="go('rec')">Ir a recordatorios</button>
        </div>
      </article>

      <article class="card soft-card">
        <div class="section-top">
          <div>
            <div class="kicker">MI PREPARACIÓN</div>
            <h2>Qué me falta para poder asistir</h2>
          </div>
        </div>

        ${
          totalDif
          ? `
            <div class="prep-summary">
              <p>Tienes <b>${totalDif}</b> dificultad(es) registrada(s) y <b>${pendingTasks}</b> tarea(s) pendiente(s).</p>
              <ul class="clean-list">
                ${(a.dif || []).map(d => {
                  const pend = (d.t || []).filter(t => t.e !== 'Resuelta').length;
                  return `<li><b>${esc(d.n)}</b> — ${pend} pendiente(s)</li>`;
                }).join('')}
              </ul>
            </div>
          `
          : `<p class="empty-inline">Aún no registras dificultades. Si aparece un problema para asistir, entra al <b>Centro de ayuda</b>.</p>`
        }

        ${a.salida ? `<p class="mini-highlight">🕒 Tu hora de salida estimada es <b>${a.salida}</b>.</p>` : ''}

        <div class="cta-row">
          <button class="s" onclick="go('ayuda')">Abrir centro de ayuda</button>
          <button class="s" onclick="go('plan')">Revisar mi plan</button>
        </div>
      </article>
    </section>

    <section class="home-grid-3">
      <article class="card action-card">
        <div class="kicker">RECORDATORIOS</div>
        <h2>Próximos avisos</h2>
        <p>Revisa tus reconfirmaciones y la planificación de avisos antes de la cita.</p>
        <button class="s" onclick="go('rec')">Ver recordatorios</button>
      </article>

      <article class="card action-card">
        <div class="kicker">TRANSPORTE</div>
        <h2>Planifica tu traslado</h2>
        <p>Explora alternativas de locomoción y guarda tu hora estimada de salida.</p>
        <button class="s" onclick="pick('transporte')">Resolver transporte</button>
      </article>

      <article class="card action-card">
        <div class="kicker">PLAN DE ASISTENCIA</div>
        <h2>Organiza lo pendiente</h2>
        <p>Haz seguimiento a tus tareas y revisa si ya estás en condiciones de asistir.</p>
        <button class="s" onclick="go('plan')">Ver mi plan</button>
      </article>
    </section>

    ${a.ask ? askBox(a) : ''}
  `;

  const u = () => {
    const e = $('#cd');
    if(!a || !e) return;
    const m = Rem.dt(a) - new Date();
    e.textContent = m > 0
      ? `Faltan ${Math.floor(m/864e5)} d ${Math.floor(m%864e5/36e5)} h ${Math.floor(m%36e5/6e4)} min`
      : 'La hora ya pasó';
  };

  u();
  countdownTimer = setInterval(u, 60000);
},
citas(){const e=S.edit?S.a.find(x=>x.id===S.edit):{};
 $('#main').innerHTML=`<h1>Mis citas médicas</h1><form class="card" onsubmit="saveA(event)"><h2>${e.id?'Editar':'Registrar'} cita</h2><div class="row"><div><label for="esp">Especialidad</label><input id="esp" required value="${esc(e.esp||'Traumatología')}"></div><div><label for="lug">Establecimiento</label><input id="lug" required value="${esc(e.lugar||'Hospital San Pablo')}"></div></div>
 <label for="dir">Dirección</label><input id="dir" value="${esc(e.dir||'Coquimbo')}"><div class="row"><div><label for="fec">Fecha</label><input id="fec" type="date" required value="${e.fecha||''}"></div><div><label for="hor">Hora</label><input id="hor" type="time" required value="${e.hora||''}"></div></div>
 <label for="obs">Observaciones (opcional, sin datos clínicos)</label><input id="obs" value="${esc(e.obs||'')}"><label><input id="ci" type="checkbox" ${e.estado&&e.estado!==ES[0]?'checked':''}> Confirmo inicialmente que asistiré</label><button>Guardar</button></form>`+
 [...S.a].sort((x,y)=>Rem.dt(x)-Rem.dt(y)).map(a=>`<div class="card"><span class="tag">${a.estado}</span><h2>${esc(a.esp)} — ${esc(a.lugar)}</h2><p>${fmt(a)}</p><button class="s" onclick="S.sel='${a.id}';go('rec')">Reconfirmar</button><button class="s" onclick="S.edit='${a.id}';go('citas')">Editar</button><button class="s" onclick="delA('${a.id}')">Eliminar</button></div>`).join('')},
rec(){const a=cur();if(!a)return $('#main').innerHTML=none();const pl=Rem.plan(a,S.cfg.int?'intensivo':S.cfg.modo);
 $('#main').innerHTML=`<h1>Recordatorios y reconfirmaciones</h1><div class="card"><h2>${esc(a.esp)} — ${fmt(a)}</h2><p><b>¿Sigues teniendo la posibilidad de asistir a tu cita médica?</b></p>
 <button onclick="reconf(1)">Sí, podré asistir</button><button class="s" onclick="reconf(2)">Quiero asistir, pero tengo dificultades</button><button class="s" onclick="reconf(3)">No podré asistir</button></div>
 <div class="card"><h2>Avisos programados (${S.cfg.int?'intensivo':S.cfg.modo})</h2>${pl.map(r=>`<p>${r.en.toLocaleString('es-CL')} — ${r.h} h antes</p>`).join('')||'<p>No quedan avisos futuros.</p>'}
 <p class="warn">Este prototipo solo muestra avisos dentro de la página y notificaciones del navegador mientras está abierta. El envío con la página cerrada requiere el servidor descrito en el README.</p></div>
 <div class="card"><h2>Respuestas registradas</h2>${(a.conf||[]).map(c=>`<p>${new Date(c.w).toLocaleString('es-CL')}: ${c.r}</p>`).join('')||'<p>Sin respuestas.</p>'}</div>`},
ayuda(){const a=cur();if(!a)return $('#main').innerHTML=none();
 $('#main').innerHTML=`<h1>Centro de ayuda</h1><p>Cita: ${esc(a.esp)}. Selecciona lo que te dificulta asistir:</p><div class="grid">${D.map(([k,n])=>`<button class="s" onclick="pick('${k}')">${n}</button>`).join('')}</div>`+
 (a.dif||[]).map(d=>`<div class="card" id="t_${d.k}">${tools[d.k]?tools[d.k](a,d):''}</div>`).join('')+(a.dif||[]).some(d=>d.k==='transporte')?'':'';
 if(dif(a,'transporte'))initMap(a)},
plan(){const a=cur();if(!a)return $('#main').innerHTML=none();
 $('#main').innerHTML=`<h1>Mi plan de asistencia</h1><div class="card"><h2>${esc(a.esp)} — ${esc(a.lugar)}</h2><p>Estado: <span class="tag">${a.estado}</span></p></div>`+(a.ask?askBox(a):'')+
 ((a.dif||[]).map((d,i)=>`<div class="card"><h2>${d.n}</h2>${d.t.map((t,j)=>`<div class="row"><span>${t.n}</span><select aria-label="Estado de ${esc(t.n)}" onchange="setTask(${i},${j},this.value)">${['Pendiente','En proceso','Resuelta','No resuelta'].map(o=>`<option ${o===t.e?'selected':''}>${o}</option>`).join('')}</select></div>`).join('')||'<p>Sin tareas.</p>'}</div>`).join('')||'<p class="card">Sin dificultades declaradas.</p>')},
hist(){const A=S.a,n=A.length,rc=A.filter(a=>(a.conf||[]).some(c=>c.r.startsWith('Sí'))).length,ds={},T=A.flatMap(a=>(a.dif||[]).flatMap(d=>{ds[d.n]=(ds[d.n]||0)+1;return d.t})),res=T.filter(t=>t.e==='Resuelta').length,
 as=A.filter(a=>a.res==='Sí, asistí').length,na=A.filter(a=>a.res==='No pude asistir').length,ch=A.filter(a=>(a.conf||[]).some(c=>!c.r.startsWith('Sí'))&&a.conf.length>0).length;
 $('#main').innerHTML=`<h1>Historial e indicadores</h1><p class="warn">Indicadores de uso del prototipo con datos declarados. No miden reducción de inasistencias reales.</p><div class="grid">${[['Citas registradas',n],['Reconfirmadas',n?Math.round(rc/n*100)+'%':'—'],['Con cambio de disponibilidad',ch],['Tareas resueltas',T.length?Math.round(res/T.length*100)+'%':'—'],['Asistencias declaradas',as],['Inasistencias declaradas',na]].map(([k,v])=>`<div class="card"><div class="big">${v}</div>${k}</div>`).join('')}</div>
 <div class="card"><h2>Dificultades por categoría</h2>${Object.entries(ds).map(([k,v])=>`<p>${k}: ${v}</p>`).join('')||'<p>Sin datos.</p>'}</div>
 <div class="card"><h2>Seguimiento posterior a la cita</h2>${A.map(a=>`<p><b>${esc(a.esp)}</b> (${a.fecha}) ${a.res?'— '+a.res:`<button class="s" onclick="post('${a.id}')">Registrar resultado</button>`}</p>`).join('')||'<p>—</p>'}</div>
 <div class="card"><h2>Bitácora</h2>${S.log.slice(0,30).map(l=>`<p>${new Date(l.w).toLocaleString('es-CL')} — ${esc(l.t)}</p>`).join('')}</div>`},
cfg(){$('#main').innerHTML=`<h1>Configuración y accesibilidad</h1><div class="card"><label for="m">Modo de recordatorios</label><select id="m" onchange="S.cfg.modo=this.value;save()">${['normal','intensivo','minimo'].map(m=>`<option ${m===S.cfg.modo?'selected':''}>${m}</option>`).join('')}</select>
 <label for="fs">Tamaño de letra: <span id="fv">${S.cfg.fs}</span> px</label><input id="fs" type="range" min="14" max="26" value="${S.cfg.fs}" oninput="S.cfg.fs=+this.value;$('#fv').textContent=this.value;nav();save()">
 <label><input type="checkbox" ${S.cfg.hc?'checked':''} onchange="S.cfg.hc=this.checked;nav();save()"> Alto contraste</label>
 <button class="s" onclick="Notification.requestPermission().then(p=>alert('Notificaciones: '+p))">Permitir notificaciones del navegador</button>
 <p>Correo, push, WhatsApp y SMS: <b>no disponibles</b> en esta versión (requieren servidor).</p><button class="s" onclick="if(confirm('¿Borrar todos los datos?')){localStorage.removeItem(K);location.reload()}">Borrar mis datos</button></div>`}};
function askBox(a){return `<div class="card warn"><b>Ahora que organizaste «${esc(a.ask)}», ¿podrás asistir a tu cita?</b><br><button onclick="askAns(true)">Sí, podré asistir</button><button class="s" onclick="askAns(false)">Aún tengo dudas</button></div>`}
function askAns(y){const a=cur();a.conf=a.conf||[];a.conf.push({r:y?'Sí, podré asistir (tras resolver '+a.ask+')':'Aún con dudas',w:new Date().toISOString()});if(y)a.estado=ES[3];delete a.ask;log('Reconfirmación tras plan');save();go(view)}
function saveA(e){e.preventDefault();const g=i=>$('#'+i).value,x=S.edit?S.a.find(a=>a.id===S.edit):{id:'a'+Date.now(),conf:[],dif:[]};
 Object.assign(x,{esp:g('esp'),lugar:g('lug'),dir:g('dir'),fecha:g('fec'),hora:g('hor'),obs:g('obs')});if(!x.estado||x.estado===ES[0])x.estado=$('#ci').checked?ES[1]:ES[0];
 if(!S.edit)S.a.push(x);S.sel=x.id;S.edit=null;log('Cita guardada');save();go('citas')}
function delA(id){if(confirm('¿Eliminar cita?')){S.a=S.a.filter(a=>a.id!==id);save();go('citas')}}
function reconf(n){const a=cur();a.conf=a.conf||[];const r=['','Sí, podré asistir','Quiero asistir, pero tengo dificultades','No podré asistir'][n];a.conf.push({r,w:new Date().toISOString()});
 a.estado=[0,ES[3],ES[4],ES[5]][n];log('Reconfirmación: '+r);save();if(n===1)go('rec');else if(n===2)go('ayuda');else{$('#main').insertAdjacentHTML('beforeend','<div class="card warn">Avisa al establecimiento por sus canales oficiales (teléfono u oficina de atención). QualiFive no cancela tu cita en el hospital.</div>')}}
function pick(k){const a=cur(),d=D.find(x=>x[0]===k);a.dif=a.dif||[];if(!dif(a,k))a.dif.push({k,n:d[1],t:d[2].map(n=>({n,e:'Pendiente'}))});log('Dificultad: '+d[1]);save();go('ayuda');setTimeout(()=>$('#t_'+k)?.scrollIntoView(),50)}
function post(id){const a=S.a.find(x=>x.id===id),r=prompt('¿Asististe? Escribe: 1 = Sí, asistí  2 = No pude asistir  3 = Prefiero no responder');a.res=['','Sí, asistí','No pude asistir','Prefiero no responder'][+r]||'Prefiero no responder';a.estado=ES[6];
 if(r==2)a.motivo=prompt('Motivo principal (declarado por ti):')||'';log('Resultado declarado: '+a.res);save();go('hist')}
const tools={
transporte:(a,d)=>`<h2>Transporte a ${HOSP.n}</h2><p>Haz clic en el mapa para marcar tu punto de partida (sin usar ubicación).</p><div id="map"></div><div id="lines" class="row"></div>
 <div class="row"><div><label for="tv">Tiempo de viaje estimado (min, ingresado por ti)</label><input id="tv" type="number" value="40"></div><div><label for="mg">Margen (min)</label><input id="mg" type="number" value="20"></div></div>
 <p id="sal"></p><button onclick="planSalida()">Calcular y guardar hora de salida</button><a class="btn s" id="gm" target="_blank" rel="noopener" href="${Tr.gmaps()}">Abrir en Google Maps</a><a class="btn s" target="_blank" rel="noopener" href="https://m.uber.com">Uber</a><a class="btn s" target="_blank" rel="noopener" href="https://didiglobal.com">DiDi</a>
 <p style="font-size:.85rem">Uber/DiDi: enlaces externos; QualiFive no verifica disponibilidad ni precios.</p>
 <p><b>¿Ya lograste organizar cómo llegar?</b></p><button onclick="trAns(1)">Sí, ya tengo organizado mi traslado</button><button class="s" onclick="trAns(2)">Todavía necesito ayuda</button><button class="s" onclick="trAns(3)">No podré asistir por transporte</button>`,
olvido:(a,d)=>`<h2>Plan contra el olvido</h2><label><input type="checkbox" ${S.cfg.int?'checked':''} onchange="S.cfg.int=this.checked;save();if(this.checked)mark('olvido','Activar recordatorios intensivos')"> Modo intensivo (7 d, 3 d, 1 d, 3 h)</label>
 <button onclick="dl('cita.ics',Rem.ics(cur()),'text/calendar');mark('olvido','Agregar la cita al calendario');go('ayuda')">Descargar .ics para mi calendario</button>
 <button class="s" onclick="Notification.requestPermission().then(()=>Rem.notify('Prueba de aviso QualiFive'))">Probar notificación del navegador</button><p>Revisa tu cuenta regresiva en Inicio.</p>`,
laboral:(a,d)=>`<h2>Solicitud de permiso</h2><label for="msg">Mensaje editable (sin información clínica)</label><textarea id="msg" rows="5">Estimado/a: solicito autorización para ausentarme el ${fmt(a)} por una atención de salud programada. Quedo atento/a a sus indicaciones. Saludos.</textarea>
 <button onclick="navigator.clipboard.writeText($('#msg').value);mark('laboral','Generar solicitud de permiso');go('ayuda')">Copiar mensaje</button><a class="btn s" target="_blank" rel="noopener" href="#" onclick="this.href='https://wa.me/?text='+encodeURIComponent($('#msg').value)">Compartir por WhatsApp</a>
 <button class="s" onclick="mark('laboral','Conversar con empleador/institución');go('ayuda')">Ya conversé con mi empleador/institución</button>`,
acomp:(a,d)=>`<h2>Invitación para acompañarme</h2><label for="lu">Lugar de encuentro</label><input id="lu"><label for="inv">Mensaje (tú eliges qué compartir)</label><textarea id="inv" rows="4">Hola, ¿puedes acompañarme a una atención el ${fmt(a)}? Nos vemos en: </textarea>
 <a class="btn" target="_blank" rel="noopener" href="#" onclick="this.href='https://wa.me/?text='+encodeURIComponent($('#inv').value+$('#lu').value);mark('acomp','Crear invitación')">Compartir por WhatsApp</a><button class="s" onclick="mark('acomp','Coordinar acompañante');go('ayuda')">Ya tengo acompañante</button><p style="font-size:.85rem">QualiFive no contacta a terceros ni guarda sus teléfonos.</p>`,
salud:(a,d)=>`<h2>Si surge un imprevisto</h2><p class="warn">QualiFive no da consejos clínicos ni cancela tu cita. Decide avisando al establecimiento por sus canales oficiales.</p><textarea id="sm" rows="3">Hola, tengo una cita el ${fmt(a)} y podría no poder asistir. ¿Cómo debo avisar o reprogramar?</textarea>
 <button onclick="navigator.clipboard.writeText($('#sm').value);mark('salud','Decidir cómo avisar al establecimiento');go('ayuda')">Copiar mensaje</button><button class="s" onclick="mark('salud','Reconfirmar más adelante');go('ayuda')">Aún no sé; consultarme después</button>`,
docs:(a,d)=>{a.chk=a.chk||[];return`<h2>Mi lista de preparación</h2><p>Escribe solo lo que el establecimiento te indicó.</p>${a.chk.map((c,i)=>`<label><input type="checkbox" ${c.ok?'checked':''} onchange="cur().chk[${i}].ok=this.checked;save()"> ${esc(c.t)}</label>`).join('')}<div class="row"><input id="nc" aria-label="Nueva tarea"><button onclick="if($('#nc').value){cur().chk.push({t:$('#nc').value});mark('docs','Armar lista de preparación');go('ayuda')}">Agregar</button></div><button class="s" onclick="mark('docs','Completar pendientes');go('ayuda')">Todo listo</button>`},
otro:(a,d)=>`<h2>Otro motivo</h2><label for="ot">Describe qué te impide asistir</label><textarea id="ot" rows="3"></textarea><button onclick="cur().otro=$('#ot').value;mark('otro','Describir y definir una acción');go('ayuda')">Guardar</button>`,
nr:()=>'<p>Gracias. Puedes cambiar de opinión cuando quieras.</p>'};
function initMap(a){Tr.init(ll=>{Tr.org=ll;$('#gm').href=Tr.gmaps(ll);mark('transporte','Revisar recorridos')}).then(fc=>{const el=$('#lines');if(!el)return;
 el.innerHTML=fc&&fc.features.length?fc.features.map(f=>`<button class="s" onclick="Tr.sel('${f.properties.linea}')">${f.properties.linea}</button>`).join(''):'<p class="warn">Recorridos de micros y colectivos: <b>todavía no disponibles</b>. No se inventan trazados; se mostrarán cuando se cargue GeoJSON verificado en data/routes.geojson.</p>'})}
function planSalida(){const a=cur(),m=+$('#tv').value+ +$('#mg').value,s=new Date(Rem.dt(a)-m*6e4);a.salida=s.toLocaleString('es-CL',{dateStyle:'short',timeStyle:'short'});$('#sal').innerHTML='Hora recomendada de salida: <b>'+a.salida+'</b> (estimación manual)';
 mark('transporte','Elegir alternativa de traslado');mark('transporte','Programar hora de salida');log('Salida: '+a.salida);save()}
function trAns(n){const a=cur(),d=dif(a,'transporte');if(n===1)d.t.forEach(t=>t.e='Resuelta');if(n===2)d.t.forEach(t=>t.e==='Pendiente'&&(t.e='En proceso'));if(n===3){a.estado=ES[5];d.t.forEach(t=>t.e='No resuelta')}
 if(n===1)a.ask='transporte';log('Seguimiento transporte: '+n);save();go('plan')}
nav();go('inicio');
setInterval(()=>S.a.forEach(a=>{if(a.estado===ES[6])return;Rem.plan(a,S.cfg.int?'intensivo':S.cfg.modo).forEach(r=>{const k=a.id+r.h;if(r.en<=new Date()&&!(S.sent||(S.sent={}))[k]){S.sent[k]=1;Rem.notify(a.esp+': tu cita es en '+r.h+' h. ¿Sigues pudiendo asistir?');log('Aviso en página: '+r.h+' h');save()}})}),3e4);
/* ===== HOME REDISEÑADO ===== */
.kicker{
  display:inline-block;
  margin-bottom:10px;
  font-size:11px;
  font-weight:800;
  letter-spacing:.14em;
  color:var(--p);
  text-transform:uppercase;
}

.hero-home{
  position:relative;
  overflow:hidden;
  background:
    radial-gradient(circle at top right, rgba(22,160,163,.12), transparent 28%),
    linear-gradient(135deg, #ffffff 0%, #f6fbfb 100%);
  border:1px solid #dbe9ea;
  box-shadow:0 18px 45px rgba(8, 71, 78, .08);
}

.hero-home__content{
  display:flex;
  flex-direction:column;
  gap:10px;
}

.hero-home__title{
  margin:0;
  font-size:clamp(24px, 3vw, 34px);
  line-height:1.15;
}

.hero-home__meta{
  margin:0;
  color:var(--mute);
  font-size:15px;
}

.countdown-panel{
  margin-top:8px;
  padding:16px 18px;
  border-radius:18px;
  background:linear-gradient(135deg, #0a5c63, #0c7779);
  color:#fff;
  width:min(100%, 420px);
  box-shadow:0 14px 30px rgba(10,92,99,.18);
}

.countdown-label{
  font-size:12px;
  font-weight:700;
  opacity:.85;
  margin-bottom:6px;
  letter-spacing:.04em;
  text-transform:uppercase;
}

.countdown-value{
  font:800 clamp(24px, 3.6vw, 36px)/1.15 'Manrope', sans-serif;
  letter-spacing:-1px;
}

.metrics-strip{
  display:grid;
  grid-template-columns:repeat(4, minmax(0,1fr));
  gap:15px;
  margin:18px 0;
}

.metric-card{
  background:#fff;
  border:1px solid var(--line);
  border-radius:18px;
  padding:18px;
  box-shadow:var(--shadow);
}

.metric-card__value{
  font:800 28px 'Manrope', sans-serif;
  color:var(--d);
  letter-spacing:-1px;
}

.metric-card__label{
  color:var(--mute);
  font-size:13px;
  margin-top:6px;
}

.home-grid-2{
  display:grid;
  grid-template-columns:1.2fr 1fr;
  gap:16px;
  margin:18px 0;
}

.home-grid-3{
  display:grid;
  grid-template-columns:repeat(3, minmax(0,1fr));
  gap:16px;
  margin:18px 0;
}

.soft-card{
  background:linear-gradient(180deg, #ffffff 0%, #fbfdfd 100%);
}

.section-top{
  display:flex;
  justify-content:space-between;
  align-items:flex-start;
  gap:10px;
  margin-bottom:8px;
}

.info-list{
  display:grid;
  gap:10px;
  margin-top:10px;
}

.info-item{
  display:flex;
  justify-content:space-between;
  align-items:flex-start;
  gap:15px;
  padding:12px 14px;
  border:1px solid #e2ecec;
  border-radius:14px;
  background:#f9fcfc;
}

.info-item__label{
  color:var(--mute);
  font-size:13px;
  font-weight:700;
}

.info-item__value{
  color:var(--d);
  font-size:14px;
  font-weight:700;
  text-align:right;
}

.clean-list{
  margin:10px 0 0 18px;
  padding:0;
  color:var(--mute);
}

.clean-list li{
  margin:8px 0;
}

.prep-summary p{
  margin-top:0;
}

.mini-highlight{
  margin-top:14px;
  padding:12px 14px;
  background:#eef8f7;
  border:1px solid #d2ebe8;
  border-radius:14px;
  color:#0b5d60;
  font-size:14px;
}

.action-card h2{
  margin-bottom:6px;
}

.action-card p{
  min-height:66px;
}

.cta-row{
  display:flex;
  flex-wrap:wrap;
  gap:10px;
  margin-top:12px;
}

.cta-row button,
.cta-row .btn{
  margin:0;
}

.empty-inline{
  color:var(--mute);
  background:#f8fbfb;
  border:1px dashed #d7e7e8;
  border-radius:14px;
  padding:14px;
}

/* responsive */
@media (max-width: 980px){
  .metrics-strip{
    grid-template-columns:repeat(2, minmax(0,1fr));
  }
  .home-grid-2{
    grid-template-columns:1fr;
  }
  .home-grid-3{
    grid-template-columns:1fr;
  }
}

@media (max-width: 640px){
  .metrics-strip{
    grid-template-columns:1fr;
  }
  .countdown-panel{
    width:100%;
  }
  .info-item{
    flex-direction:column;
    align-items:flex-start;
  }
  .info-item__value{
    text-align:left;
  }
}
