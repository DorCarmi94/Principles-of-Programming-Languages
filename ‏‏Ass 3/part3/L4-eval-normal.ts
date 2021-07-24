    // ========================================================
    // L4 normal eval
    import { Sexp } from "s-expression";
    import { map, indexOf, zip, filter, contains, KeyValuePair } from "ramda";
    import { CExp, Exp, IfExp, Program, parseL4Exp, makeProcExp, makeVarDecl, VarRef, makeIfExp, makeAppExp, ProcExp, VarDecl, makeVarRef } from "./L4-ast";
    import { isAppExp, isBoolExp, isCExp, isDefineExp, isIfExp, isLitExp, isNumExp,
            isPrimOp, isProcExp, isStrExp, isVarRef, isLetExp, LetExp } from "./L4-ast";
    import { applyEnv, makeEmptyEnv, makeExtEnv, Env } from './L4-env-normal';
    import { applyPrimitive } from "./evalPrimitive";
    import { isClosure, makeClosure, Value } from "./L4-value";
    import { first, rest, isEmpty } from '../shared/list';
    import { Result, makeOk, makeFailure, bind, mapResult } from "../shared/result";

    /*
    Purpose: Evaluate an L4 expression with normal-eval algorithm
    Signature: L4-normal-eval(exp,env)
    Type: CExp * Env => Value
    */
    export const L4normalEval = (exp: CExp, env: Env): Result<Value> =>
        isBoolExp(exp) ? makeOk(exp.val) :
        isNumExp(exp) ? makeOk(exp.val) :
        isStrExp(exp) ? makeOk(exp.val) :
        isPrimOp(exp) ? makeOk(exp) :
        isLitExp(exp) ? makeOk(exp.val) :
        //isVarRef(exp) ? bind(applyEnv(env, exp.var),L4normalEval) :
        isVarRef(exp) ? bind(applyEnv(env,exp.var),(x:CExp)=>L4normalEval(x,env)):
        isIfExp(exp) ? evalIf(exp, env) :
        isProcExp(exp) ? makeOk(makeClosure(exp.args, exp.body,env)) :
        // This is the difference between applicative-eval and normal-eval
        // Substitute the arguments into the body without evaluating them first.
        isAppExp(exp) ? bind(L4normalEval(exp.rator, env), proc => L4normalApplyProc(proc, exp.rands, env)) :
        isLetExp(exp)? evalLetL4Idodo(exp,env):
        makeFailure(`Bad ast: ${exp}`);
    
        export const isTrueValue = (x: Value): boolean =>
        ! (x === false);
    const evalIf = (exp: IfExp, env: Env): Result<Value> =>
        bind(L4normalEval(exp.test, env),
            test => isTrueValue(test) ? L4normalEval(exp.then, env) : L4normalEval(exp.alt, env));

    /*
    ===========================================================
    Normal Order Application handling
    Purpose: Apply a procedure to NON evaluated arguments.
    Signature: L4-normalApplyProcedure(proc, args)
    Pre-conditions: proc must be a prim-op or a closure value
    */
    const L4normalApplyProc = (proc: Value, args: CExp[], env: Env): Result<Value> => {
        if (isPrimOp(proc)) {
            const argVals: Result<Value[]> = mapResult((arg) => L4normalEval(arg, env), args);
            return bind(argVals, (args: Value[]) => applyPrimitive(proc, args));
        } else if (isClosure(proc)) {
            // Substitute non-evaluated args into the body of the closure
            const vars = map((p) => p.var, proc.params);
            const newEnv = makeExtEnv(vars,args,env);
            return L4normalEvalSeq(proc.body,newEnv);
        } else {
            return makeFailure(`Bad proc applied ${proc}`);
        }
    };

    const evalLetL4Idodo=(exp:LetExp,env:Env):Result<Value>=>
    {
        const vars = map((p) => p.var.var, exp.bindings);
        const vals = map((p) => p.val, exp.bindings);
        const newEnv = makeExtEnv(vars,vals,env);
        return L4normalEvalSeq(exp.body,newEnv);
    }

    /*
    Purpose: Evaluate a sequence of expressions
    Signature: L4-normal-eval-sequence(exps, env)
    Type: [List(CExp) * Env -> Value]
    Pre-conditions: exps is not empty
    */
    const L4normalEvalSeq = (exps: CExp[], env: Env): Result<Value> => {
        if (isEmpty(rest(exps)))
            return L4normalEval(first(exps), env);
        else {
            L4normalEval(first(exps), env);
            return L4normalEvalSeq(rest(exps), env);
        }
    };

    /*
    Purpose: evaluate a program made up of a sequence of expressions. (Same as in L1)
    When def-exp expressions are executed, thread an updated env to the continuation.
    For other expressions (that have no side-effect), execute the expressions sequentially.
    Signature: L4normalEvalProgram(program)
    Type: [Program -> Value]
    */
    export const L4normalEvalProgram = (program: Program): Result<Value> =>
        evalExps(program.exps, makeEmptyEnv());

    // Evaluate a sequence of expressions (in a program)
    export const evalExps = (exps: Exp[], env: Env): Result<Value> =>
        isEmpty(exps) ? makeFailure("Empty program") :
        isDefineExp(first(exps)) ? evalDefineExps(first(exps), rest(exps), env) :
        evalCExps(first(exps), rest(exps), env);
        
    export const evalCExps = (exp1: Exp, exps: Exp[], env: Env): Result<Value> =>
        isCExp(exp1) && isEmpty(exps) ? L4normalEval(exp1, env) :
        isCExp(exp1) ? bind(L4normalEval(exp1, env), _ => evalExps(exps, env)) :
        makeFailure("Never");
        
    // Eval a sequence of expressions when the first exp is a Define.
    // Compute the rhs of the define, extend the env with the new binding
    // then compute the rest of the exps in the new env.
    export const evalDefineExps = (def: Exp, exps: Exp[], env: Env): Result<Value> =>
        isDefineExp(def) ? evalExps(exps, makeExtEnv([def.var.var], [def.val], env)) :
        makeFailure("Unexpected " + def);

        export const substitute = (body: CExp[], vars: string[], exps: CExp[]): CExp[] => {
            const subVarRef = (e: VarRef): CExp => {
                const pos = indexOf(e.var, vars);
                return ((pos > -1) ? exps[pos] : e);
            };
            
            const subProcExp = (e: ProcExp): ProcExp => {
                const argNames = map((x) => x.var, e.args);
                const subst = zip(vars, exps);
                const freeSubst = filter((ve) => !contains(first(ve), argNames), subst);
                return makeProcExp(e.args, substitute(e.body, map((x: KeyValuePair<string, CExp>) => x[0], freeSubst), map((x: KeyValuePair<string, CExp>) => x[1], freeSubst)));
            };
            
            const sub = (e: CExp): CExp => isNumExp(e) ? e :
                isBoolExp(e) ? e :
                isPrimOp(e) ? e :
                isLitExp(e) ? e :
                isStrExp(e) ? e :
                isVarRef(e) ? subVarRef(e) :
                isIfExp(e) ? makeIfExp(sub(e.test), sub(e.then), sub(e.alt)) :
                isProcExp(e) ? subProcExp(e) :
                isAppExp(e) ? makeAppExp(sub(e.rator), map(sub, e.rands)) :
                e;
            
            return map(sub, body);
        };

        export const makeVarGen = (): (v: string) => string => {
            let count: number = 0;
            return (v: string) => {
                count++;
                return `${v}__${count}`;
            };
        };