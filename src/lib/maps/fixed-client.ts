import * as maplibregl from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import 'maplibre-gl/dist/maplibre-gl.css';
import {Protocol} from 'pmtiles';
import {layers,namedFlavor} from '@protomaps/basemaps';
import {BASEMAP_URL,WARDS_URL,ADMIN_URL,VD_URL,PROVINCES_URL} from './config.ts';
import type {FixedMapOptions} from './fixed-types.ts';
import {bindAreaInteractions,type AreaSource} from './area-interactions.ts';
import {collapseAttribution} from './attribution.ts';
maplibregl.setWorkerUrl(workerUrl);
maplibregl.addProtocol('pmtiles',new Protocol().tile);
export function mountRegionMap(figure:HTMLElement){
  const historical=()=>figure.dataset.mapHistorical==='true';
  const options=JSON.parse(figure.dataset.options!) as FixedMapOptions;
  const container=figure.querySelector<HTMLElement>('.region-map-canvas')!;
  const status=figure.querySelector<HTMLElement>('.region-map-status')!;
  const fill=options.colors?.length && !historical() ? ['match',['get','id'],...options.colors.flatMap(c=>[c.id,c.color]),'#dce1d5'] as unknown as maplibregl.ExpressionSpecification : '#7894ad';
  const theme={...namedFlavor('light'),background:'#f5f3e9',earth:'#f5f3e9',water:'#c8dce2',park_a:'#dce5d1',park_b:'#e6ebdd',buildings:'#d9dace'};
  const base=layers('basemap',theme,{lang:'en'});
  let source:AreaSource='administrative';
  let sourceLayer:string|undefined=options.level==='national'?undefined:'administrative';
  let filter:maplibregl.FilterSpecification=['==',['get','level'],'province'];
  if(options.level==='province')filter=['all',['==',['get','level'],'municipality'],['==',['get','provinceId'],options.id!]];
  if(options.level==='municipality'){source='wards';sourceLayer='wards';filter=['==',['get','code'],options.code!];}
  if(options.level==='town'){source='wards';sourceLayer='wards';filter=['in',['get','id'],['literal',options.wardIds??[]]];}
  if(options.level==='ward'){source='districts';sourceLayer='voting-districts';filter=['==',['get','wardId'],options.id!];}
  if(options.level==='voting-district'){source='districts';sourceLayer='voting-districts';filter=['==',['get','id'],options.id!];}
  const childLayers:maplibregl.LayerSpecification[]=[
    {id:'regions-fill',type:'fill',source,'source-layer':sourceLayer,filter,paint:{'fill-color':fill,'fill-opacity':['case',['boolean',['feature-state','hover'],false],options.colors?.length&&!historical()?0.85:0.32,options.colors?.length&&!historical()?0.65:0.16]}},
    {id:'regions-line',type:'line',source,'source-layer':sourceLayer,filter,paint:{'line-color':['case',['boolean',['feature-state','hover'],false],'#163a30','#49678a'],'line-width':['case',['boolean',['feature-state','hover'],false],2.5,1.15],'line-opacity':0.85}},
  ];
  base.splice(base.findIndex(l=>l.type==='symbol'),0,...childLayers);
  const overlays:Record<string,maplibregl.SourceSpecification>={
    administrative:options.level==='national'
      ?{type:'geojson',data:PROVINCES_URL,promoteId:'id',maxzoom:6}
      :{type:'vector',url:`pmtiles://${location.origin}${ADMIN_URL}`,promoteId:'id'},
    wards:{type:'vector',url:`pmtiles://${location.origin}${WARDS_URL}`,promoteId:'id'},
    districts:{type:'vector',url:`pmtiles://${location.origin}${VD_URL}`,promoteId:'id'},
  };
  const sources:maplibregl.StyleSpecification['sources']={
    basemap:{type:'vector',url:`pmtiles://${location.origin}${BASEMAP_URL}`,attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors · <a href="https://protomaps.com">Protomaps</a> · Boundaries: MDB'},
    [source]:overlays[source]!,
  };
  if(source==='wards')base.push({id:'region-labels',type:'symbol',source,'source-layer':sourceLayer,filter,minzoom:9,layout:{'text-field':['concat','Ward ',['to-string',['get','number']]],'text-font':['Noto Sans Medium'],'text-size':11},paint:{'text-color':'#254535','text-halo-color':'#fffdf6','text-halo-width':2}});
  if(options.level!=='national'){
    sources.outline={type:'geojson',data:`/api/v1/geometry/${options.level}/${options.id}?v=20261105-3`};
    base.push({id:'region-outline',type:'line',source:'outline',paint:{'line-color':'#163a30','line-width':2.5,...(options.level==='town'?{'line-dasharray':[3,2]}:{})}});
  }
  try {
    const map=new maplibregl.Map({container,interactive:false,attributionControl:{compact:true},style:{version:8,glyphs:`${location.origin}/maps/fonts/{fontstack}/{range}.pbf`,sprite:`${location.origin}/maps/sprites/light`,sources,layers:base},bounds:[[options.bbox[0],options.bbox[1]],[options.bbox[2],options.bbox[3]]],fitBoundsOptions:{padding:24,maxZoom:14},maxZoom:17});
    collapseAttribution(map);
    map.getCanvas().removeAttribute('tabindex');
    const fit=()=>{map.resize();map.fitBounds([[options.bbox[0],options.bbox[1]],[options.bbox[2],options.bbox[3]]],{padding:24,maxZoom:14,duration:0});};
    const resizeObserver = new ResizeObserver(fit);
    resizeObserver.observe(container);
    const interactions=bindAreaInteractions(map,{layer:'regions-fill',source,sourceLayer,navigateOnClick:options.level!=='voting-district',enabled:()=>!historical()});
    const updateColors=()=>{
      const latest=JSON.parse(figure.dataset.options!) as FixedMapOptions;
      if(historical())interactions.clear();
      if(!map.getLayer('regions-fill'))return;
      const colored=!!latest.colors?.length&&!historical();
      map.setPaintProperty('regions-fill','fill-color',colored?['match',['get','id'],...latest.colors!.flatMap(c=>[c.id,c.color]),'#dce1d5'] as unknown as maplibregl.ExpressionSpecification:'#7894ad');
      map.setPaintProperty('regions-fill','fill-opacity',['case',['boolean',['feature-state','hover'],false],colored?0.85:0.32,colored?0.65:0.16]);
    };
    figure.addEventListener('results:map-update',updateColors);
    map.on('remove',()=>{ figure.removeEventListener('results:map-update',updateColors); resizeObserver.disconnect(); });
    map.on('load',()=>{status.hidden=true;updateColors();});
    map.on('error',()=>{status.hidden=false;status.textContent='Map details are unavailable. Area links and results remain below.';});
    return () => map.remove();
  }catch{status.textContent='Map preview is unavailable in this browser. Open the area links below.';}
}
