const DDD:Record<string,{state:string,region:string}>={
'11':{state:'SP',region:'São Paulo'},'21':{state:'RJ',region:'Rio de Janeiro'},'31':{state:'MG',region:'Minas Gerais'},'41':{state:'PR',region:'Paraná'},'51':{state:'RS',region:'Rio Grande do Sul'},'61':{state:'DF',region:'Distrito Federal'},'71':{state:'BA',region:'Bahia'},'79':{state:'SE',region:'Sergipe'},'81':{state:'PE',region:'Pernambuco'},'85':{state:'CE',region:'Ceará'},'91':{state:'PA',region:'Pará'}
};
export const lookupDDD=(ddd:string)=>DDD[ddd]??{state:null,region:null};
