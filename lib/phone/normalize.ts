import {parsePhoneNumberFromString} from 'libphonenumber-js';
import {lookupDDD} from './ddd';
export function normalizeBrazilPhone(input:string){
 const digits=input.replace(/\D/g,''); const raw=digits.startsWith('55')?`+${digits}`:`+55${digits}`;
 const parsed=parsePhoneNumberFromString(raw,'BR');
 if(!parsed||parsed.country!=='BR') return {valid:false,input};
 const national=parsed.nationalNumber; const ddd=national.slice(0,2); const geo=lookupDDD(ddd);
 return {valid:parsed.isValid(),e164:parsed.number,national,ddd,...geo,lineType:national.length===11?'mobile':'fixed_or_other'};
}
