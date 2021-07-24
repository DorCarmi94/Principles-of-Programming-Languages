import { Exp, Program, isProgram, isBoolExp, isNumExp, isVarRef, isPrimOp, isDefineExp, isProcExp, isIfExp, isAppExp, CExp, PrimOp, makeProgram } from '../imp/L2-ast';
import { map, is } from "ramda";
import { Result, makeOk, makeFailure, mapResult, bind, safe3, safe2 } from '../imp/result';
/*
Purpose: turns a program or an exp from L2 language to Javascript structure
Signature: l2ToJS(exp)
Type: (Exp|Program)-> Result <string>
*/
export const l2ToJS = (exp: Exp | Program): Result<string> => 
    isProgram(exp) && exp.exps.length==1? bind(l2ToJS(exp.exps[0]),(x)=>makeOk(`${x};`)):
    isProgram(exp)? safe2((firstExps: string[], lastExp: string) => makeOk(`${firstExps.join(";\n")};\nconsole.log(${lastExp});`))
                        (mapResult(l2ToJS, exp.exps.slice(0,exp.exps.length-1)), l2ToJS(exp.exps[exp.exps.length-1])):
    isBoolExp(exp) ? makeOk(exp.val ? "true" : "false") :
    isNumExp(exp) ? makeOk(exp.val.toString()) :
    isVarRef(exp) ? makeOk(exp.var) :
    isPrimOp(exp) ? makeOk(parsePrimop(exp)) :
    isDefineExp(exp) ? bind(l2ToJS(exp.val), (val: string) => makeOk(`const ${exp.var.var} = ${val}`)) :
    
    isProcExp(exp) && exp.body.length===1 ? bind(mapResult(l2ToJS, exp.body), (body: string[]) => makeOk(`((${map(v => v.var, exp.args).join(",")}) => ${body.join("")})`)) :
    isProcExp(exp) && exp.body.length>1 ? bind(mapResult(l2ToJS, exp.body), (body: string[]) => makeOk(`((${map(v => v.var, exp.args).join(",")}) => {${body.slice(0,body.length-1).join("; ")}; return ${body[body.length-1]};})`)) :
    isIfExp(exp) ? safe3((test: string, then: string, alt: string) => makeOk(`(${test} ? ${then} : ${alt})`))
                    (l2ToJS(exp.test), l2ToJS(exp.then), l2ToJS(exp.alt)) :
    //isAppExp(exp) && isVarRef(exp.rator).... (varRef)(operands..)
    isAppExp(exp)&& isPrimOp(exp.rator) && ! isUnaryOp(exp.rator) && !isQuesionOp(exp.rator) ? safe2((rator: string, rands: string[]) => makeOk(`(${rands.join(' '+rator+' ')})`))
                        (l2ToJS(exp.rator), mapResult(l2ToJS, exp.rands)):
    isAppExp(exp)&& isPrimOp(exp.rator) && isUnaryOp(exp.rator) && exp.rands.length===1 ? safe2((rator: string, rands: string[]) => makeOk(`(${rator}${rands[0]})`))
                        (l2ToJS(exp.rator), mapResult(l2ToJS, exp.rands)) :  
    isAppExp(exp)&& isPrimOp(exp.rator) && isQuesionOp(exp.rator) && exp.rands.length===1 ? safe2((rator: string, rands: string[]) => makeOk(`typeof(${rands[0]}) ==='${rator}'`))
                        (l2ToJS(exp.rator), mapResult(l2ToJS, exp.rands)) :               
    isAppExp(exp) ? safe2((rator: string, rands: string[]) => makeOk(`${rator}(${rands.join(',')})`))
                        (l2ToJS(exp.rator), mapResult(l2ToJS, exp.rands)) :       
    makeFailure(`Unknown expression: ${exp}`);


    // export const isPrimitiveOp = (x: string): boolean =>
    // ["+", "-", "*", "/", ">", "<", "=", "not", "and", "or",
    //  "eq?","number?", "boolean?"].includes(x);
const parsePrimop= (exp:PrimOp) : string =>
    exp.op==="=" ? "===" :
    exp.op==="not" ? "!" :
    exp.op==="and" ? "&&" :
    exp.op==="or" ? "||" :
    exp.op==="eq?" ? "===" :
    exp.op==="number?" ? "number":
    exp.op==="boolean?" ? "boolean":
    exp.op;

const isUnaryOp= (exp:PrimOp): boolean =>
    exp.op==="not";
    
const isQuesionOp=(exp:PrimOp): boolean=>
 exp.op==="number?" || exp.op==="boolean?";


