import {isAtomicExp,isAppExp,isProcExp, isCExp, isProgram, isDefineExp,Exp, isExp,ForExp,CExp, isForExp, AtomicExp, isIfExp, makeForExp, makeVarDecl, parseL21CExp } from "./L21-ast";
import { Result, mapResult, makeOk, makeFailure, bind, safe2, isOk } from "../imp/result";
import {Program,makeProcExp,makeAppExp,makeNumExp,makeDefineExp, ProcExp,NumExp, AppExp, makeProgram ,makeIfExp, isNumExp, isBoolExp, makeBoolExp, isPrimOp, makePrimOp, isVarRef, makeVarRef} from "./L21-ast";
import { map } from "ramda";


/*
Purpose: make app expression from for expression
Signature: for2app(exp)
Type: (ForExp) -> AppExp
*/
export const for2app = (exp: ForExp): AppExp =>
{
    let theLambda:ProcExp=makeProcExp([exp.var],[exp.body]);
    let lambdotApps:AppExp[]=[];
    for (let index:number = exp.start.val; index <= exp.end.val; index++) {
        let y:NumExp=makeNumExp(index);
        lambdotApps.push(makeAppExp(theLambda,[y]));  
    }
    let myproc:ProcExp=makeProcExp([],lambdotApps);
    return makeAppExp(myproc,[]);
    
}

/*
Purpose: Trasnform a program or an epression that is wrriten in L21 to the s-exp structure of L2- with no for experssion.
Each for expression wil be turend into app expression using for2app
Signature: L21ToL2(exp)
Type: (Exp | Program) -> Result <Exp | Program>
*/

export const L21ToL2 = (exp: Exp | Program): Result<Exp | Program> =>
    isProgram(exp)? bind(mapResult(rewriteAllForExp,exp.exps),makeProgramOkFunction):    
    isExp(exp) ? rewriteAllForExp(exp):
    
    makeFailure("Not an expression and not a program");

const rewriteAllForExp = (exp: Exp): Result<Exp> =>
    isCExp(exp) ? makeOk(rewriteAllForCExp(exp)) :
    isDefineExp(exp) ? makeOk(makeDefineExp(exp.var, rewriteAllForCExp(exp.val))) :
    makeFailure("Unknown expression");
    
const rewriteAllForCExp =(cexp:CExp):CExp=>
    isAtomicExp(cexp) ?  cexp:
    isForExp(cexp)?  rewriteAllForCExp(for2app(cexp)):
    isIfExp(cexp) ? makeIfExp(rewriteAllForCExp(cexp.test),
                                 rewriteAllForCExp(cexp.then),
                               rewriteAllForCExp(cexp.alt)) :
    isAppExp(cexp) ? makeAppExp(rewriteAllForCExp(cexp.rator),
                                 map(rewriteAllForCExp, cexp.rands)) :
    isProcExp(cexp) ? makeProcExp(cexp.args, map(rewriteAllForCExp, cexp.body)) :
    cexp;

const makeProgramOkFunction=(myExpression:Exp[])=>
{
    return makeOk(makeProgram(myExpression));
}