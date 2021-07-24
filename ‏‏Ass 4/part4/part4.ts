import { pair } from "ramda";
import { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } from "constants";

export function f (x:number):Promise<number>{
    return new Promise<number>((success,onError)=>
    {   
        if(x==0)
        {
            onError("no divide by zero");
        }
        else
        {
            success(1/x);
        }
    });
}


export function g(x:number):Promise<number>{
    return new Promise<number>((success,onError)=>
    {
        success(x*x);
    });
}

export function h(x:number):Promise<number>{
    return g(x).then((oded:number)=>f(oded));
}

export function slower(ps:Promise<any>[]):Promise<any[]>{
    return new Promise<any[]>((success,onError)=>
    {
        let oded=0;
        ps[0].then(value=>{
            if(oded===0)
            {
                oded++;
            }
            else
            {
                success([0,value]);
            }
        }).catch((err)=>console.error(err));
        ps[1].then(value=>{
            if(oded===0)
            {
                oded++;
            }
            else
            {
                success([1,value]);
            }
        }).catch((err)=>console.error(err));
    })
}