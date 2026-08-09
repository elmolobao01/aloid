import {NextRequest,NextResponse} from 'next/server';
import {normalizeBrazilPhone} from '@/lib/phone/normalize';
import {DevelopmentTelecomProvider} from '@/lib/providers/telecom/provider';
export async function POST(req:NextRequest){
 const body=await req.json().catch(()=>({})); if(typeof body.phone!=='string') return NextResponse.json({error:'Telefone obrigatório'},{status:400});
 const phone=normalizeBrazilPhone(body.phone); if(!phone.valid) return NextResponse.json({phone,telecom:null,reputation:{score:null,risk:'unknown',reports:0}});
 const telecom=await new DevelopmentTelecomProvider().lookup(phone.e164!);
 return NextResponse.json({phone,telecom,reputation:{score:null,risk:'unknown',reports:0},tier:'free'});
}
