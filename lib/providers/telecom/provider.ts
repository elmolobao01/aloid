export type TelecomResult={carrierCurrent:string|null;carrierOriginal:string|null;ported:boolean|null;source:string;checkedAt:string};
export interface TelecomProvider{lookup(e164:string):Promise<TelecomResult>}
export class DevelopmentTelecomProvider implements TelecomProvider{async lookup(_e164:string){return {carrierCurrent:null,carrierOriginal:null,ported:null,source:'development',checkedAt:new Date().toISOString()}}}
