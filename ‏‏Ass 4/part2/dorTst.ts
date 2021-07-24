import {parseL5, parseL5Exp, parseDefine, unparse} from "./L5-ast"
import { cons } from "../shared/list";
import{evalValues, applicativeEval, evalParse} from "../part2/L5-eval";
import { parse as p, isToken, isSexpString } from "../shared/parser";
import { bind, makeOk, Result } from "../shared/result";
import { valueToString, SExpValue } from "./L5-value";
import { L5typeof } from "./L5-typecheck";
import { parseTE, TExp, unparseTExp } from "./TExp";
//console.log(JSON.stringify(parseL5("(L5(define f(lambda (x)(values 1 2 3)))(let-values (((a b c) (f 0)))(+ a b c)))"),null,2));
// console.log(JSON.stringify(bind((p("(values 1 2 3)")),parseL5Exp)));
// console.log(JSON.stringify(evalParse("(values 1 2 3)")));
//console.log(JSON.stringify(evalParse("(let-values (((n s) (values 1 2))) s)")));
//console.log(JSON.stringify(evalParse("(+ (* 3 (+ 4 2) (* 2 5)) 7)")));
//console.log(evalParse("(values 1 2 3)"));

//console.log(JSON.stringify(bind(bind(p("(values 1 2 3)"),parseL5),evalParse)));
//console.log(L5typeof('(values 1 2)'));

//console.log(JSON.stringify(parseTE('(boolean)'),null,2));

const parseUnparse = (texp: string): Result<string> =>
            bind(parseTE(texp), (texp: TExp) => unparseTExp(texp));

console.log(parseUnparse('(Empty)'));