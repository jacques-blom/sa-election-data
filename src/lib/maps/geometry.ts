import { gunzipSync } from 'node:zlib';
import type { Feature, Polygon, MultiPolygon } from 'geojson';
export type GeometryRow = {level:string;id:string;minx:number;miny:number;maxx:number;maxy:number;object_key:string;byte_offset:number;byte_length:number};
export async function readGeometry(bucket:R2Bucket,row:GeometryRow):Promise<Feature<Polygon|MultiPolygon>> {
  if(row.byte_length>3_000_000) throw new Error('Geometry exceeds read limit');
  const object=await bucket.get(row.object_key,{range:{offset:row.byte_offset,length:row.byte_length}});
  if(!object)throw new Error('Geometry unavailable');
  const bytes=Buffer.from(await object.arrayBuffer());
  if(bytes.length!==row.byte_length)throw new Error('Incomplete geometry range');
  return JSON.parse(gunzipSync(bytes,{maxOutputLength:10_000_000}).toString('utf8'));
}
// Ray casting with explicit edge handling; holes and multipart polygons are preserved.
function ringContains(point:[number,number],ring:number[][]):number {
  const [x,y]=point;let inside=false;
  for(let i=0,j=ring.length-1;i<ring.length;j=i++){
    const [xi,yi]=ring[i]!,[xj,yj]=ring[j]!;
    const cross=(x-xi!)*(yj!-yi!)-(y-yi!)*(xj!-xi!);
    if(Math.abs(cross)<1e-12 && x>=Math.min(xi!,xj!)-1e-12 && x<=Math.max(xi!,xj!)+1e-12 && y>=Math.min(yi!,yj!)-1e-12 && y<=Math.max(yi!,yj!)+1e-12)return 2;
    if((yi!>y)!==(yj!>y) && x<(xj!-xi!)*(y-yi!)/(yj!-yi!)+xi!)inside=!inside;
  }
  return inside?1:0;
}
export function pointInGeometry(point:[number,number],geometry:Polygon|MultiPolygon) {
  const polygons=geometry.type==='Polygon'?[geometry.coordinates]:geometry.coordinates;
  return polygons.some(rings=>{
    const outer=ringContains(point,rings[0]!);if(!outer)return false;if(outer===2)return true;
    for(const hole of rings.slice(1)){const hit=ringContains(point,hole);if(hit===2)return true;if(hit)return false;}
    return true;
  });
}
