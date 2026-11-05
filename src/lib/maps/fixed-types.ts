export type FixedMapOptions={
  bbox:[number,number,number,number];
  level:'national'|'province'|'municipality'|'ward'|'town'|'voting-district';
  id?:string;
  code?:string;
  wardIds?:string[];
  colors?:{id:string;color:string}[];
};
