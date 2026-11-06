export type FixedMapOptions={
  bbox:[number,number,number,number];
  level:'national'|'province'|'district'|'municipality'|'ward'|'town'|'voting-district';
  id?:string;
  code?:string;
  wardIds?:string[];
  municipalityCodes?:string[];
  colors?:{id:string;color:string}[];
};
