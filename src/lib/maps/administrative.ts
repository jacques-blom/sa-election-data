import metadata from './administrative-index.json' with { type:'json' };
import type { FixedMapOptions } from './fixed-types.ts';
export const administrative=metadata as unknown as {provinces:Record<string,{id:string;name:string;slug:string;code:string;url:string;bbox:FixedMapOptions['bbox']}>;municipalities:Record<string,{id:string;name:string;slug:string;code:string;provinceId:string;url:string;bbox:FixedMapOptions['bbox']}>};
