/** Direction follows the displayed value, so rounded zero never looks like a gain/loss. */
export function changeValue(value:number,unit:'pp'|'seats'='pp') {
  const magnitude=unit==='seats'?Math.round(Math.abs(value)):Math.round((Math.abs(value)+Number.EPSILON)*10)/10;
  const direction=magnitude===0?'flat':value>0?'up':'down';
  const number=unit==='seats'?String(magnitude):magnitude.toFixed(1);
  return {direction,text:`${direction==='up'?'+':direction==='down'?'−':''}${number} ${unit==='seats'&&magnitude===1?'seat':unit}`,
    description:`${direction==='flat'?'No change':direction==='up'?'Increase':'Decrease'}${direction==='flat'?'':` of ${number} ${unit==='pp'?'percentage points':magnitude===1?'seat':'seats'}`}`};
}
