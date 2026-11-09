const HOSP={n:'Hospital San Pablo de Coquimbo',lat:-29.9546,lng:-71.3385};/* coordenada aproximada: verificar */
const Tr={map:null,start:null,layers:{},fc:{features:[]},
async init(onPick){
 const el=document.getElementById('map');
 if(typeof L==='undefined'){el.innerHTML='<p class="warn">No se pudo cargar el mapa. Use el botón de Google Maps.</p>';return}
 this.layers={};this.map=L.map('map').setView([HOSP.lat,HOSP.lng],12);
 L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap'}).addTo(this.map);
 L.marker([HOSP.lat,HOSP.lng]).addTo(this.map).bindPopup(HOSP.n);
 this.map.on('click',e=>{if(this.start)this.start.remove();this.start=L.marker(e.latlng).addTo(this.map).bindPopup('Mi punto de partida');onPick(e.latlng)});
 try{this.fc=await (await fetch('data/routes.geojson')).json();
  this.fc.features.forEach(f=>{const p=f.properties;this.layers[p.linea]=L.geoJSON(f,{style:{color:p.color||'#0a7',weight:2,opacity:.35}})});
 }catch(e){}
 return this.fc},
sel(l){Object.entries(this.layers).forEach(([k,v])=>{v.setStyle({weight:k===l?7:2,opacity:k===l?1:.3});if(k===l){v.addTo(this.map);this.map.fitBounds(v.getBounds())}})},
gmaps(o){return 'https://www.google.com/maps/dir/?api=1&destination='+HOSP.lat+','+HOSP.lng+(o?'&origin='+o.lat+','+o.lng:'')}};
