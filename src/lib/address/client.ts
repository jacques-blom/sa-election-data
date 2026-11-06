/// <reference types="google.maps" />
/** Google content stays on this Google map and is never persisted in our place directory. */
const key=import.meta.env.PUBLIC_GOOGLE_MAPS_API_KEY;
const initialized = new WeakSet<HTMLElement>();
function setupAddresses() {
  if(key) document.querySelectorAll<HTMLElement>('[data-address-lookup]').forEach(root => {
    if (initialized.has(root)) return;
    initialized.add(root); initialize(root);
  });
}
setupAddresses();
document.addEventListener('results:updated', setupAddresses);
function initialize(root:HTMLElement){
  const search = (root.dataset.addressSearch ? document.getElementById(root.dataset.addressSearch)?.closest('[data-place-search]') : null) ?? root;
  const status=root.querySelector<HTMLElement>('[data-address-status]')!;
  const result=root.querySelector<HTMLElement>('[data-address-result]')!;
  const wardLinks=root.querySelector<HTMLElement>('[data-address-wards]')!;
  let selected=0;
  let controller:AbortController|undefined;
  let map:google.maps.Map|undefined,point:google.maps.Circle|undefined;
  search.addEventListener('place-search:input',()=>{
    ++selected;controller?.abort();result.hidden=true;status.textContent='';
  });
  search.addEventListener('place-search:select',async(event)=>{
      const sequence=++selected;controller?.abort();controller=new AbortController();
      result.hidden=true;wardLinks.replaceChildren();map?.data.forEach(feature=>map!.data.remove(feature));point?.setMap(null);
      status.textContent='Finding this location…';
      try{
        const place=(event as CustomEvent<google.maps.places.Place>).detail;
        if(sequence!==selected)return;
        if(!place.location)throw new Error('no location');
        await google.maps.importLibrary('maps');
        if(sequence!==selected)return;
        result.hidden=false;
        root.querySelector('[data-selected-name]')!.textContent=place.displayName??'Selected location';
        root.querySelector('[data-selected-address]')!.textContent=place.formattedAddress??'';
        map??=new google.maps.Map(root.querySelector<HTMLElement>('[data-google-map]')!,{center:place.location,zoom:15,mapTypeControl:false,streetViewControl:false,fullscreenControl:true,gestureHandling:'cooperative'});
        if(place.viewport)map.fitBounds(place.viewport,35);else{map.setCenter(place.location);map.setZoom(15);}
        point=new google.maps.Circle({map,center:place.location,radius:25,fillColor:'#175b99',fillOpacity:1,strokeColor:'#fff',strokeWeight:3,clickable:false});
        const response=await fetch('/api/locate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(place.location.toJSON()),signal:controller.signal});
        if(!response.ok)throw new Error('lookup unavailable');
        const data=await response.json() as {wards:{id:string;number:number;municipality:string;url:string;geometryUrl:string}[]};
        if(sequence!==selected)return;
        if(data.wards.length!==1){
          const note=document.createElement('p');
          note.textContent=data.wards.length?'Near a ward boundary. Check both ward results.':'No ward match. Try a nearby address.';
          wardLinks.appendChild(note);
        }
        const links=document.createElement('div');links.className='address-ward-links';wardLinks.appendChild(links);
        for(const ward of data.wards){const link=document.createElement('a');link.className='button primary';link.href=ward.url;link.textContent=`Ward ${ward.number}, ${ward.municipality} results ↗`;links.appendChild(link);}
        status.textContent='';
        map.data.setStyle({fillColor:'#277dae',fillOpacity:.12,strokeColor:'#175b99',strokeWeight:2});
        for(const ward of data.wards){try{const response=await fetch(ward.geometryUrl,{signal:controller.signal});if(response.ok){const geometry=await response.json();if(sequence===selected)map.data.addGeoJson(geometry as object);}}catch{/* Results links remain useful if an outline fails. */}}
      }catch(error){if(sequence!==selected || (error instanceof DOMException && error.name==='AbortError'))return;status.textContent='We couldn’t look up this ward. Please try another address or use our area directory.';}
  });
}
