/* QualiFive / transporte V3 — solo dibuja geometrías obtenidas de OSM.
   Origen hospitalario: coordenadas del registro MINSAL.
   Los sectores E01/E02 proceden de Transporte Informa (06-02-2025).
*/
const HOSP={n:'Hospital San Pablo de Coquimbo',lat:-29.968488,lng:-71.337017,dir:'Avenida Videla S/N, Coquimbo'};
const Tr={
 map:null,origin:null,line:null,features:[],loading:false,sourceId:'qf-transit',sourceName:'OpenStreetMap (colaborativo)',ready:false,
 lineMeta:{
  E01:{color:'#2476df',title:'E01 · El Sauce ↔ Las Compañías',regions:'El Sauce · San Juan · Villa del Mar · Balmaceda · Centro de La Serena · Pinamar · Villa El Romero',note:'Servicio publicado por Transporte Informa. El detalle de calles puede cambiar.'},
  E02:{color:'#e98b35',title:'E02 · El Llano ↔ Las Compañías',regions:'El Llano · Centro de Coquimbo · Ruta 5 · Balmaceda · Centro de La Serena · Las Compañías',note:'Servicio publicado por Transporte Informa. El detalle de calles puede cambiar.'}
 },
 official:'https://coquimbo.transporteinforma.cl/noticias/recorrido-de-buses-electricos-coquimbo-la-serena/',
 officialMap:'https://coquimbo.transporteinforma.cl/wp-content/uploads/sites/3/2024/10/Trazados-Buses-Electricos-Coquimbo-La-Serena.pdf',
 gmaps(){const d=`${HOSP.lat},${HOSP.lng}`;return 'https://www.google.com/maps/dir/?api=1&destination='+d+(this.origin?'&origin='+this.origin.lat+','+this.origin.lng:'')+'&travelmode=transit'},
 label(text,type='info'){const e=document.querySelector('#tr-notice');if(e){e.className='tr-notice tr-'+type;e.textContent=text}},
 destroy(){if(this.map){try{this.map.remove()}catch(e){}this.map=null}this.ready=false},
 init(){
  this.destroy();this.line=null;this.origin=null;this.features=[];this.loading=false;
  const el=document.getElementById('map');if(!el)return;
  this.renderCards();
  if(typeof maplibregl==='undefined') {el.innerHTML='<div class="tr-map-fallback">No se pudo cargar la biblioteca del mapa. Puedes consultar los recorridos oficiales en los enlaces inferiores.</div>';this.label('Mapa no disponible: se requiere conexión a Internet.','warn');return;}
  try{
   this.map=new maplibregl.Map({container:el,style:'https://tiles.openfreemap.org/styles/positron',center:[-71.317,-29.933],zoom:10.7,attributionControl:true});
   this.map.addControl(new maplibregl.NavigationControl({showCompass:false}),'top-right');
   this.map.on('load',()=>{this.ready=true;this.drawHospital();this.label('Mapa de calles cargado. Marca tu origen y selecciona E01 o E02 para consultar el trazado disponible.');});
   this.map.on('click',e=>{this.origin={lat:e.lngLat.lat,lng:e.lngLat.lng};this.drawOrigin();this.updateOrigin();this.calculateSuggestions();});
   this.map.on('error',()=>{if(!this.ready)this.label('El mapa de calles no pudo cargarse. Las líneas y su información oficial siguen disponibles.','warn')});
  }catch(e){el.innerHTML='<div class="tr-map-fallback">El mapa de calles no está disponible en este navegador. Puedes usar el enlace externo de Google Maps.</div>';this.label('Mapa no disponible. Prueba abrir QualiFive desde GitHub Pages con conexión a Internet.','warn')}
 },
 drawHospital(){if(!this.map||!this.map.loaded())return;
  if(!this.map.getSource('hospital'))this.map.addSource('hospital',{type:'geojson',data:{type:'Feature',geometry:{type:'Point',coordinates:[HOSP.lng,HOSP.lat]}}});
  if(!this.map.getLayer('hospital-halo'))this.map.addLayer({id:'hospital-halo',type:'circle',source:'hospital',paint:{'circle-radius':13,'circle-color':'#d63a56','circle-opacity':.17}});
  if(!this.map.getLayer('hospital-dot'))this.map.addLayer({id:'hospital-dot',type:'circle',source:'hospital',paint:{'circle-radius':7,'circle-color':'#d63a56','circle-stroke-color':'#ffffff','circle-stroke-width':2}});
  this.map.on('click','hospital-dot',()=>new maplibregl.Popup().setLngLat([HOSP.lng,HOSP.lat]).setText(HOSP.n+' · '+HOSP.dir).addTo(this.map));
 },
 drawOrigin(){if(!this.map||!this.ready)return;const data={type:'Feature',geometry:{type:'Point',coordinates:[this.origin.lng,this.origin.lat]}};
  if(this.map.getSource('origin'))this.map.getSource('origin').setData(data);else{
   this.map.addSource('origin',{type:'geojson',data});this.map.addLayer({id:'origin-dot',type:'circle',source:'origin',paint:{'circle-radius':8,'circle-color':'#0e9a88','circle-stroke-width':3,'circle-stroke-color':'#fff'}})}},
 updateOrigin(){const e=document.getElementById('tr-origin-label');if(e&&this.origin)e.textContent=`Origen elegido: ${this.origin.lat.toFixed(4)}, ${this.origin.lng.toFixed(4)} (posición marcada en el mapa)`;
  const g=document.getElementById('tr-gmaps');if(g)g.href=this.gmaps()},
 setLine(code){this.line=code;this.renderCards();this.drawRoutes();this.calculateSuggestions();
  const text=this.lineMeta[code].title;this.label('Seleccionaste '+text+'. Se mostrará su trazado solo si existe geometría cartográfica disponible.');},
 renderCards(){document.querySelectorAll('[data-tr-line]').forEach(e=>{const on=e.dataset.trLine===this.line;e.classList.toggle('tr-selected',on);e.setAttribute('aria-pressed',String(on))});
  const detail=document.getElementById('tr-line-detail');if(detail&&this.line){const m=this.lineMeta[this.line];detail.innerHTML='<div class="tr-detail-label">LÍNEA SELECCIONADA</div><strong>'+m.title+'</strong><p><b>Sectores de referencia publicados:</b> '+m.regions+'</p><small>Los sectores no equivalen a paraderos ni garantizan que la línea llegue a tu origen o destino.</small>'}},
 async load(){if(this.loading)return;this.loading=true;
  const b=document.getElementById('tr-load');if(b){b.disabled=true;b.textContent='Consultando recorridos…'}
  this.label('Consultando geometrías cartográficas públicas. Esto puede tardar o no devolver resultados.');
  // Solo consulta relaciones tipo bus con ref exacta en el área Coquimbo–La Serena.
  const q='[out:json][timeout:25];relation["type"="route"]["route"="bus"]["ref"~"^(E01|E02)$",i](-30.10,-71.50,-29.80,-71.13);out geom;';
  const urls=['https://overpass.kumi.systems/api/interpreter','https://overpass-api.de/api/interpreter'];let json=null,reason='';
  for(const u of urls){const ctl=new AbortController(),timer=setTimeout(()=>ctl.abort(),14500);
   try{const r=await fetch(u+'?data='+encodeURIComponent(q),{signal:ctl.signal});if(!r.ok)throw new Error('HTTP '+r.status);json=await r.json();break}catch(e){reason=e.message}finally{clearTimeout(timer)}}
  this.features=this.parse(json);this.loading=false;if(b){b.disabled=false;b.textContent='Actualizar recorridos del mapa'}
  if(this.features.length){this.label('Se encontraron '+this.features.length+' tramos cartográficos en OpenStreetMap (datos comunitarios, no certificados). Contrasta siempre con las fuentes oficiales.','ok');this.drawRoutes();this.calculateSuggestions()}
  else {this.label('No se encontraron trazados utilizables de E01/E02 en OpenStreetMap'+(reason?' o la consulta falló':'')+'. No se dibujarán líneas inventadas. Usa los sectores publicados y el mapa oficial.','warn');this.calculateSuggestions()}
 },
 parse(json){let out=[];for(const r of (json?.elements||[])){
  if(r.type!=='relation')continue;const code=(r.tags?.ref||'').toUpperCase().trim();if(!this.lineMeta[code])continue;
  for(const m of (r.members||[])){if(m.type!=='way'||!Array.isArray(m.geometry)||m.geometry.length<2)continue;
   const coords=m.geometry.filter(p=>Number.isFinite(p.lon)&&Number.isFinite(p.lat)).map(p=>[p.lon,p.lat]);if(coords.length<2)continue;
   out.push({type:'Feature',properties:{linea:code,rel:r.id,source:'OpenStreetMap'},geometry:{type:'LineString',coordinates:coords}})}}return out},
 drawRoutes(){if(!this.map||!this.ready)return;
  const data={type:'FeatureCollection',features:this.features.filter(f=>f.properties.linea===this.line)};
  if(this.map.getSource('routes'))this.map.getSource('routes').setData(data);
  else {this.map.addSource('routes',{type:'geojson',data});this.map.addLayer({id:'route-border',type:'line',source:'routes',paint:{'line-color':'#fff','line-width':10,'line-opacity':.92}});this.map.addLayer({id:'route-highlight',type:'line',source:'routes',paint:{'line-color':'#2476df','line-width':6,'line-opacity':.97}})}
  if(this.map.getLayer('route-highlight'))this.map.setPaintProperty('route-highlight','line-color',this.lineMeta[this.line]?.color||'#2476df');
  const coords=data.features.flatMap(f=>f.geometry.coordinates);if(coords.length>1){let xs=coords.map(x=>x[0]),ys=coords.map(x=>x[1]);this.map.fitBounds([[Math.min(...xs),Math.min(...ys)],[Math.max(...xs),Math.max(...ys)]],{padding:65,maxZoom:14,duration:600})}
 },
 hav(a,b){const x=(a[1]-b[1])*Math.PI/180,y=(a[0]-b[0])*Math.PI/180,h=Math.sin(x/2)**2+Math.cos(a[1]*Math.PI/180)*Math.cos(b[1]*Math.PI/180)*Math.sin(y/2)**2;return 12742*Math.asin(Math.min(1,Math.sqrt(h)))},
 nearPoint(p,code){let min=Infinity;for(const f of this.features.filter(f=>f.properties.linea===code)){for(const c of f.geometry.coordinates){let d=this.hav(p,c);if(d<min)min=d}}return min},
 calculateSuggestions(){const e=document.getElementById('tr-suggestions');if(!e)return;
  if(!this.origin){e.innerHTML='<div class="tr-placeholder">Marca tu punto de partida haciendo clic en el mapa. Después podremos comprobar qué líneas tienen un trazado cartográfico cercano.</div>';return}
  if(!this.features.length){e.innerHTML='<div class="tr-placeholder">Todavía no tenemos geometrías de recorridos. No es responsable recomendar una micro sin saber por dónde pasa. Puedes consultar los sectores oficiales más abajo.</div>';return}
  const rows=Object.keys(this.lineMeta).map(code=>({code,origin:this.nearPoint([this.origin.lng,this.origin.lat],code),hosp:this.nearPoint([HOSP.lng,HOSP.lat],code)})).filter(o=>Number.isFinite(o.origin)&&Number.isFinite(o.hosp)).sort((a,b)=>(a.origin+a.hosp)-(b.origin+b.hosp));
  e.innerHTML=rows.length?rows.map(o=>`<div class="tr-suggestion"><div><strong>${o.code}</strong><p>Distancia geométrica aproximada del origen al trazado: ${o.origin.toFixed(2)} km · del hospital al trazado: ${o.hosp.toFixed(2)} km</p><small>Es distancia en línea recta al trazado cartográfico, NO distancia caminable ni garantía de servicio.</small></div><button type="button" class="s" onclick="Tr.setLine('${o.code}')">Ver línea</button></div>`).join(''):'<div class="tr-placeholder">No hay líneas con datos suficientes para comparar.</div>'},
 saveChoice(){if(!this.line){this.label('Selecciona E01 o E02 antes de guardar una alternativa.','warn');return}
  const a=cur();if(!a)return;const verified=this.features.some(f=>f.properties.linea===this.line);
  a.traslado={linea:this.line,origen:this.origin?{lat:this.origin.lat,lng:this.origin.lng}:null,cartografia:verified?'Trazado OSM no verificado':'Sin trazado disponible',fecha:new Date().toISOString()};
  mark('transporte','Revisar recorridos');mark('transporte','Elegir alternativa de traslado');log('Alternativa de transporte guardada: '+this.line);save();this.label('Guardaste '+this.line+' en tu plan de asistencia. Es una preferencia, no una ruta recomendada oficialmente.','ok');
  const b=document.getElementById('tr-saved');if(b)b.textContent='Alternativa guardada: '+this.line+' · '+a.traslado.cartografia;
 }
};
