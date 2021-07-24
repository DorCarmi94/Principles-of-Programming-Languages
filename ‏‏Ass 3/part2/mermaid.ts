import { makeGraph, makeHeader, GraphContent, CompundGraph, Header, Graph, makeNodeDecl, makeCompundGraph, makeEdge,Edge, makeNodeRef, NodeRef,Node, NodeDecl, makeEdgeLabel, AtomicGrpah, makeAtomicGraph, isGraph, isAtomicGrpah, isCompundGraph, isEdgeLabel, isNodeDecl, isNodeRef } from "./mermaid-ast"
import { isProgram, makeProgram, Parsed, Exp, CExp, VarDecl,isExp, isDefineExp, DefineExp, isCExp, isProcExp, ProcExp, makeVarDecl, isAppExp, isPrimOp, isIfExp, isLitExp, CompoundExp, LitExp, isLetExp, isBinding, Binding, isLetrecExp, isSetExp, isAtomicExp, AtomicExp, isBoolExp, isNumExp, isStrExp, isVarRef, parseL4, makeLetrecExp, parseL4Program  } from "./L4-ast"
import { Result, makeOk, makeFailure, mapResult, safe2,bind } from '../shared/result';
import { reduce, is, isEmpty, map } from "ramda";
import { isCompoundSExp, isEmptySExp, SExpValue, isSymbolSExp, SymbolSExp, isSExp } from "./L4-value";
import { isNumber, isArray } from "util";
import { EPERM } from "constants";
import { isSexp } from "../shared/parser";
import { safe3 } from "../shared/optional";
import { cons, first } from "../shared/list";
import { parse as p, isSexpString, isToken } from "../shared/parser";
import { Sexp } from "s-expression";
import { parseL4Exp } from "../test/L4-ast";
//Graph ->Header& GraphContent -> Compund|Atomic

        
const makeVarGen = (): (v: string) => string => {
    let count: number = 0;
        return (v: string) => {
            count++;
            return `${v}__${count}`;
        };
    };

export const mapL4toMermaid = (exp: Parsed): Result<Graph>=>
    isAtomicExp(exp)? makeOk(makeGraph(makeHeader("TD"),makeAtomicGraph(makeAtomicNodeDecl(exp)))):
    isProgram(exp)? safe2((header: Header, content: CompundGraph) => makeOk(makeGraph(header, content)))
        (makeOk(makeHeader("TD")), makeOk(mapAllExps(exp.exps))):
    isDefineExp(exp)? safe2((rator: Header, rands: GraphContent) => makeOk(makeGraph(rator, rands)))
    (makeOk(makeHeader("TD")), makeOk(makeSoloDefeineTree(exp))):
    isCExp(exp)? safe2((rator: Header, rands: GraphContent) => makeOk(makeGraph(rator, rands)))
    (makeOk(makeHeader("TD")),makeOk(makeSoloCExpTree(exp))):
    makeFailure("Problem");
    

const makeSoloDefeineTree=(exp:DefineExp):CompundGraph=>
    (((defineTree:Edge[])=>makeCompundGraph(defineTree))(makeDefineNoDaddy(exp)))




const makeSoloCExpTree=(exp:CExp):CompundGraph=>
(
    (
    (cexpTree:Edge[])=>
    makeCompundGraph(cexpTree)
    )
    (makeDaddyTreeNoDad(exp))
)


const getProcGen=makeVarGen();
const getParamsGen=makeVarGen();
const getBodyGen=makeVarGen();
const getAppGen=makeVarGen();

const NodeDeclToRef= (node:Node):NodeRef=>
     makeNodeRef(node.id);


     const mapAllExps=(exps:Exp[]):CompundGraph=>
     (
         (
         (programNodeDecl:NodeDecl,totalExps:NodeDecl)=>
             (
             (firstExpHandle:Edge[],mapmap:Edge[][])=>
                     (
                     (newMap:Edge[])=>
                         makeCompundGraph(newMap)
                     )  
                     (firstExpHandle.concat(mapmap.reduce((acc:Edge[],cur:Edge[])=> acc.concat(cur) ,[])))
 
             )
             ([makeEdge(programNodeDecl,totalExps,makeEdgeLabel("exps"))],exps.map(x=>makeExpNodeDeclToTreeNoExps(NodeDeclToRef(totalExps),x)))
         )
         (makeNodeDecl(`${makeProgramGen("Program")}`,'["Program"]'),makeNodeDecl(makeExpGen("Exp"),`[":"]`))
     )
// const mapAllExps2NotFunctional=(exps:Exp[]):CompundGraph=>
// {
//     const programNodeDecl:NodeDecl=makeNodeDecl(`${makeProgramGen("Program")}`,'["Program"]');
//     const totalExps:NodeDecl=makeNodeDecl(makeExpGen("Exp"),`[":"]`);
//     const firstExpHandle:Edge[]=[makeEdge(programNodeDecl,totalExps,makeEdgeLabel("exps"))];
//     const mapmap:Edge[][]=exps.map(x=>makeExpNodeDeclToTreeNoExps(NodeDeclToRef(totalExps),x));
//     const newMap:Edge[]=firstExpHandle.concat(mapmap.reduce((acc:Edge[],cur:Edge[])=> acc.concat(cur) ,[]));
//     return makeCompundGraph(newMap);
// }

// const mapAllExps=(exps:Exp[]):Edge[]=>
//     (
        
//         (
//             (programNodeDecl:NodeDecl, totalExps:NodeDecl)=>[makeEdge(programNodeDecl,totalExps,makeEdgeLabel("exps"))]
//         )
//                 (makeNodeDecl(`${makeProgramGen("Program")}`,'["Program"]'),makeNodeDecl(makeExpGen("Exp"),`[":"]`))
//     )



export const makeExpNodeDeclToTreeNoExps=(node:Node,exp:Exp):Edge[]=>
    isDefineExp(exp)? makeDefineWithDaddy(NodeDeclToRef(node),exp):
    isCExp(exp)? makeDaddyTree(NodeDeclToRef(node),exp):
    [makeEdge(node,makeNodeDecl("problemmakeExpNodeDeclToTree","problemmakeExpNodeDeclToTree"))]

export const makeExpNodeDeclToTree=(programNode:Node,node:NodeDecl,exp:Exp):Edge[]=>
    isDefineExp(exp)? [makeEdge(programNode,node,makeEdgeLabel(`exps`))].concat(makeDefineWithDaddy(NodeDeclToRef(node),exp)):
    isCExp(exp)?[makeEdge(programNode,node,makeEdgeLabel(`exps`))].concat(makeTree(NodeDeclToRef(node),exp)):
    [makeEdge(node,makeNodeDecl("problemmakeExpNodeDeclToTree","problemmakeExpNodeDeclToTree"))]


const makeDefineNoDaddy=(exp:DefineExp):Edge[]=>
(((newDefine:NodeDecl)=>
handleDefine2(newDefine,exp)))
(makeNodeDecl(makeDefineGen("DefineExp"),`["DefineExp"]`))

const makeDefineWithDaddy=(dady:Node,exp:DefineExp):Edge[]=>
(((dad:Node,newDefine:NodeDecl)=>
[makeEdge(NodeDeclToRef(dad),newDefine)].concat(handleDefine(newDefine,exp)))
(dady,makeNodeDecl(makeDefineGen("DefineExp"),`["DefineExp"]`)))

const handleDefine=(dady:Node,exp:DefineExp):Edge[]=>
(((dad:Node,var11:NodeDecl,val:NodeDecl)=>
    [makeEdge(NodeDeclToRef(dad),var11,makeEdgeLabel("var")),makeEdge(NodeDeclToRef(dad),val,makeEdgeLabel("val"))].concat(makeTree(val,exp.val)))
    (dady,makeNodeDecl(makeVarDeclGen("VarDecl"),`["VarDecl(${exp.var.var})"]`),makeNodeDeclCExp(exp.val)))


const handleDefine2=(dady:Node,exp:DefineExp):Edge[]=>
    (((dad:Node,var11:NodeDecl,val:NodeDecl)=>
        [makeEdge(dad,var11,makeEdgeLabel("var")),makeEdge(dad,val,makeEdgeLabel("val"))].concat(makeTree(val,exp.val)))
        (dady,makeNodeDecl(makeVarDeclGen("VarDecl"),`["VarDecl(${exp.var.var})"]`),makeNodeDeclCExp(exp.val)))


const makeProgramGen=makeVarGen();
const makeProcGen=makeVarGen();
const makeParamsGen=makeVarGen();
const makeBodyGen=makeVarGen();
const makeAppGen=makeVarGen();
const makeVarDeclGen=makeVarGen();
const makeRandsGen=makeVarGen();
const makeIfGen=makeVarGen();
const makeTestGen=makeVarGen();
const makeThenGen=makeVarGen();
const makeAltGen=makeVarGen();
const makeDefineGen=makeVarGen();
const makeLitGen=makeVarGen();
const makeLetGen=makeVarGen();
const makeCompundGen=makeVarGen();
const makeLetRecGen=makeVarGen();
const makeExpGen=makeVarGen();
const makeSymbolGen=makeVarGen();
const makeNumExpaGen=makeVarGen();
const makeBoolExpGen=makeVarGen();
const makeStrExpGen=makeVarGen();
const makenumberGen=makeVarGen();
const makeboolGen=makeVarGen();
const makestringGen=makeVarGen();
const makeprimOpGen=makeVarGen();
const makeVarRefGen=makeVarGen();
const makeVar4VarGen= makeVarGen();
const makeSetGen= makeVarGen();
const makeBindingGen= makeVarGen();
const makeEmptyGen= makeVarGen();
const makeValGen=makeVarGen();




                                        
// const defineVarGen=makeVarGen();
// const defineLitGen=makeVarGen();
// const define4defineGen=makeVarGen();
// const AppVarGen=makeVarGen()
// const ProcVarGen=makeProcGen()



// const makeProcEdge (x:ProcExp ) =>

//     makeNodeRef("Name",mapResult(makeEdge(makeCompundGraph(mapResult(x.args,mapAllCExps)))));
//     makeEdge(dad,);
//     makeEdge(dad,makeCompundGraph(mapResult(x.body,mapAllCExps)));



// ((f)3)




//MakeChild, makeSymbolExp, bindings

export const makeDaddyTreeNoDad=(exp:Exp):Edge[]=>
isProcExp(exp)?                             (((newProc:NodeDecl)=>
                                            makeTree(newProc,exp))
                                            (makeNodeDecl(makeProcGen("ProcExp"),`["ProcExp"]`))):
isAppExp(exp)?                              (((newApp:NodeDecl)=>
                                            makeTree(newApp,exp))
                                            (makeNodeDecl(makeAppGen("AppExp"),`["AppExp"]`))):
isIfExp(exp)?                               (((newIf:NodeDecl)=>
                                            makeTree(newIf,exp))
                                            (makeNodeDecl(makeIfGen("IfExp"),`["IfExp"]`))):
isLitExp(exp)?                              (((newLit:NodeDecl)=>
                                            makeTree(newLit,exp))
                                            (makeNodeDecl(makeLitGen("LitExp"),`["LitExp"]`))):
isDefineExp(exp)?                           (((newDefine:NodeDecl)=>
                                            makeTree(newDefine,exp))
                                            (makeNodeDecl(makeDefineGen("DefineExp"),`["DefineExp"]`))):
isBinding(exp)?                             (((newBinding:NodeDecl)=>
                                            makeTree(newBinding,exp))
                                            (makeNodeDecl(makeBindingGen("BindingExp"),`["BindingExp"]`))):
isLetExp(exp)?                              (((newLet:NodeDecl)=>
                                            makeTree(newLet,exp))
                                            (makeNodeDecl(makeLetGen("LetExp"),`["LetExp"]`))):
isLetrecExp(exp)?                           (((newLetRec:NodeDecl)=>
                                            makeTree(newLetRec,exp))
                                            (makeNodeDecl(makeLetRecGen("LetRecExp"),`["LetRecExp"]`))):
isSetExp(exp)?                              (((newSet:NodeDecl)=>
                                            makeTree(newSet,exp))
                                            (makeNodeDecl(makeSetGen("SetExp"),`["SetExp"]`))):
                                            [makeEdge(makeNodeDecl("ProblemMakeDaddyTree",`${exp}`),makeNodeDecl("ProblemMakeDaddyTree",`${exp}`))]

export const makeDaddyTree=(grandpa:Node,exp:Exp):Edge[]=>
isProcExp(exp)?                             (((newProc:NodeDecl)=>[makeEdge(grandpa,newProc)]
                                            .concat(makeTree(NodeDeclToRef(newProc),exp)))
                                            (makeNodeDecl(makeProcGen("ProcExp"),`["ProcExp"]`))):
isAppExp(exp)?                              (((newApp:NodeDecl)=>[makeEdge(grandpa,newApp)]
                                            .concat(makeTree(NodeDeclToRef(newApp),exp)))
                                            (makeNodeDecl(makeAppGen("AppExp"),`["AppExp"]`))):
isIfExp(exp)?                               (((newIf:NodeDecl)=>[makeEdge(grandpa,newIf)]
                                            .concat(makeTree(NodeDeclToRef(newIf),exp)))
                                            (makeNodeDecl(makeIfGen("IfExp"),`["IfExp"]`))):
isLitExp(exp)?                              (((newLit:NodeDecl)=>[makeEdge(grandpa,newLit)]
                                            .concat(makeTree(NodeDeclToRef(newLit),exp)))
                                            (makeNodeDecl(makeLitGen("LitExp"),`["LitExp"]`))):
isDefineExp(exp)?                           (((newDefine:NodeDecl)=>[makeEdge(grandpa,newDefine)]
                                            .concat(makeTree(NodeDeclToRef(newDefine),exp)))
                                            (makeNodeDecl(makeDefineGen("DefffffffffineExp"),`["DefffffffffineExp"]`))):
isBinding(exp)?                             (((newBinding:NodeDecl)=>[makeEdge(grandpa,newBinding)]
                                            .concat(makeTree(NodeDeclToRef(newBinding),exp)))
                                            (makeNodeDecl(makeBindingGen("BindingExp"),`["BindingExp"]`))):
isLetExp(exp)?                              (((newLet:NodeDecl)=>[makeEdge(grandpa,newLet)]
                                            .concat(makeTree(NodeDeclToRef(newLet),exp)))
                                            (makeNodeDecl(makeLetGen("LetExp"),`["LetExp"]`))):
isLetrecExp(exp)?                           (((newLetRec:NodeDecl)=>[makeEdge(grandpa,newLetRec)]
                                            .concat(makeTree(NodeDeclToRef(newLetRec),exp)))
                                            (makeNodeDecl(makeLetRecGen("LetRecExp"),`["LetRecExp"]`))):
isSetExp(exp)?                              (((newSet:NodeDecl)=>[makeEdge(grandpa,newSet)]
                                            .concat(makeTree(NodeDeclToRef(newSet),exp)))
                                            (makeNodeDecl(makeSetGen("SetExp"),`["SetExp"]`))):
isAtomicExp(exp)?                           (((dad:Node,ato:NodeDecl)=>
                                            [makeEdge(dad,ato)])
                                            (grandpa,makeAtomicNodeDecl(exp))):
                                            [makeEdge(grandpa,makeNodeDecl("ProblemMakeDaddyTree",`${exp}`))]

export const makeTree=(daddy:Node,exp:Exp):Edge[]=>
    isProcExp(exp)?                             (((dad:Node,x:NodeDecl,y:NodeDecl)=>[makeEdge(dad,x,makeEdgeLabel("args")),makeEdge(NodeDeclToRef(dad),y,makeEdgeLabel("body"))]
                                                .concat(makeChildVarDecl(NodeDeclToRef(x),exp.args)).concat(makeChildCExp(y,exp.body)))
                                                (daddy,makeNodeDecl(makeParamsGen("Params"),`[":"]`),makeNodeDecl(makeBodyGen("Body"),`[":"]`))):
    isAppExp(exp) && isProcExp(exp.rator)?      (((dad:Node,x:NodeDecl,y:NodeDecl)=>[makeEdge(dad,x,makeEdgeLabel("rator")),makeEdge(NodeDeclToRef(dad),y,makeEdgeLabel("rands"))]
                                                .concat(makeTree(NodeDeclToRef(x),exp.rator)).concat(makeChildCExp(y,exp.rands)))(daddy,makeNodeDecl(makeProcGen("ProcExp"),'["ProcExp"]'),makeNodeDecl(makeRandsGen("Rands"),`[":"]`))):
    isAppExp(exp) && isPrimOp(exp.rator)?       (((dad:Node,x:NodeDecl,y:NodeDecl)=>[makeEdge(dad,x,makeEdgeLabel("rator")),makeEdge(NodeDeclToRef(dad),y,makeEdgeLabel("rands"))]
                                                .concat(makeChildCExp(y,exp.rands)))(daddy,makeNodeDecl(makeprimOpGen("PrimOp"),`["PrimOp(${exp.rator.op})"]`),makeNodeDecl(makeRandsGen("Rands"),`[":"]`))):
    isAppExp(exp) && isVarRef(exp.rator)?       (((dad:Node,x:NodeDecl,y:NodeDecl)=>[makeEdge(dad,x,makeEdgeLabel("rator")),makeEdge(NodeDeclToRef(dad),y,makeEdgeLabel("rands"))]
                                                .concat(makeChildCExp(y,exp.rands)))(daddy,makeNodeDecl(makeVarRefGen("VarRef"),`["VarRef(${exp.rator.var})"]`),makeNodeDecl(makeRandsGen("Rands"),`[":"]`))):
    isIfExp(exp)?                               (((dad:Node,test:NodeDecl,then:NodeDecl,alt:NodeDecl)=>
                                                [makeEdge(dad,test,makeEdgeLabel("test")),makeEdge(NodeDeclToRef(dad),then,makeEdgeLabel("then")),
                                                makeEdge(NodeDeclToRef(dad),alt,makeEdgeLabel("alt"))].concat(makeTree(NodeDeclToRef(test),exp.test)).concat(makeTree(NodeDeclToRef(then),exp.then)).concat(makeTree(NodeDeclToRef(alt),exp.alt)))
                                                (daddy,makeNodeDeclCExp(exp.test),makeNodeDeclCExp(exp.then),makeNodeDeclCExp(exp.alt))):
    isLitExp(exp) && isCompoundSExp(exp.val)?   (((dad:Node,SCompund:NodeDecl)=>
                                                [makeEdge(dad,SCompund,makeEdgeLabel("val"))].concat(makeChildSExp(SCompund,exp.val)))
                                                (daddy,makeNodeDecl(makeCompundGen("CompundSExp"),'["CompundSExp"]'))):
    isLitExp(exp) && isSymbolSExp(exp.val)?     (((dad:Node,Ssymbol:NodeDecl)=>
                                                [makeEdge(dad,Ssymbol,makeEdgeLabel("val"))].concat(makeSymbolExps(Ssymbol,exp.val)))
                                                (daddy,makeNodeDecl(makeSymbolGen("Symbol"),'["Symbol"]'))):
    isDefineExp(exp)?                           (((dad:Node,var11:NodeDecl,val:NodeDecl)=>
                                                [makeEdge(dad,var11,makeEdgeLabel("var")),makeEdge(NodeDeclToRef(dad),val,makeEdgeLabel("val"))].concat(makeTree(NodeDeclToRef(val),exp.val)))
                                                (daddy,makeNodeDecl(makeVar4VarGen("Var"),`["VarDecl(${exp.var.var})"]`),makeNodeDecl(`${makeCExpTitle(exp.val)}`,`["${exp.val.tag}"]`))):
    // isBinding(exp)?                             (((dad:Node,var11:NodeDecl,val:NodeDecl)=>
    //                                             [makeEdge(dad,var11,makeEdgeLabel("var")),makeEdge(NodeDeclToRef(dad),val,makeEdgeLabel("val"))].concat(makeTree(NodeDeclToRef(val),exp.val)))
    //                                             (daddy,makeNodeDecl(makeVar4VarGen("Var"),`["VarDecl(${exp.var.var})"]`),makeNodeDecl(`${makeCExpTitle(exp.val)}`,`["${exp.val.tag}"]`))):
    isLetExp(exp)||isLetrecExp(exp)?            (((dad:Node,bindings:NodeDecl,body:NodeDecl)=>
                                                [makeEdge(dad,bindings,makeEdgeLabel("bindings")),makeEdge(NodeDeclToRef(dad),body,makeEdgeLabel("body"))].concat(makeLetTree(NodeDeclToRef(bindings),exp.bindings)).concat(makeChildCExp(body,exp.body)))
                                                (daddy,makeNodeDecl(makeBindingGen("Binding"),`[":"]`),makeNodeDecl(makeBodyGen("Body"),`[":"]`))):
                          
    isSetExp(exp)?                              (((dad:Node,varR:NodeDecl,body:NodeDecl)=>
                                                [makeEdge(dad,varR,makeEdgeLabel("varRef")),makeEdge(NodeDeclToRef(dad),body,makeEdgeLabel("body"))].concat(makeTree(NodeDeclToRef(body),exp.val)))
                                                (daddy,makeNodeDecl(makeVarRefGen("VarRef"),`["VarRef(${exp.val})"]`),makeNodeDecl(makeBodyGen("Body"),`["${exp.val.tag}"]`))):
    // isAtomicExp(exp)?                           (((dad:Node,ato:NodeDecl)=>
    //                                             [makeEdge(dad,ato)])
    //                                             (daddy,makeAtomicNodeDecl(exp))):
    isAtomicExp(exp)?                           []:
                                                [makeEdge(daddy,makeNodeDecl("ProblemMakeTreeeeeeeeeeeeee",`${exp.tag}`))]

const makeBindingLeafs=(dady:Node,exp:Binding):Edge[]=>
    (((dad:Node,newBindNode:NodeDecl,var11:NodeDecl,val:NodeDecl)=>
    [makeEdge(dad,newBindNode),makeEdge(NodeDeclToRef(newBindNode),var11,makeEdgeLabel("var")),makeEdge(NodeDeclToRef(newBindNode),val,makeEdgeLabel("val"))].concat(makeTree(NodeDeclToRef(val),exp.val)))
    (dady,makeNodeDecl(makeBindingGen("Binding"),`["Binding"]`),makeNodeDecl(makeVar4VarGen("Var"),`["VarDecl(${exp.var.var})"]`),makeNodeDeclCExp(exp.val)))

const makeLetTree=(dady:Node,bindings:Binding[]):Edge[]=>
        bindings.reduce((acc:Edge[],cur:Binding)=> acc.concat(makeBindingLeafs(dady,cur)) ,[]);

const makeChildVarDecl=(dady:NodeRef,exps:VarDecl[]):Edge[]=>
    exps.reduce((acc:Edge[],cur:VarDecl)=> acc.concat(makeEdge(dady,makeNodeDecl(makeVarDeclGen("VarDecl"),`["VarDecl(${cur.var})"]`))) ,[]);

const makeAtomicSexp=(dady:NodeDecl,exp:SExpValue):NodeDecl=>
    isEmptySExp(exp)? makeNodeDecl(makeEmptyGen("EmptySExp"),'["EmptySexp"]'):
    typeof(exp) === 'string'?makeNodeDecl(makestringGen("string"),`["string(${exp})"]`):
    typeof(exp) === 'boolean' && exp===true? makeNodeDecl(makeboolGen("bool"),`["bool(#t)"]`):
    typeof(exp) === 'boolean'&&exp===false? makeNodeDecl(makeboolGen("bool"),`["bool(#f)"]`):
    typeof(exp) === 'boolean'? makeNodeDecl(makeboolGen("bool"),`["bool(${exp})"]`):
    typeof(exp) === 'number'?makeNodeDecl(makenumberGen("number"),`["number(${exp})"]`):
    
    isPrimOp(exp)? makeNodeDecl(makeprimOpGen("PrimOp"),`["PrimOp(${exp})"]`):
    makeNodeDecl("ProblemAtomicSExp","ProblemAtomicSExp")
    // export type SExpValue = number | boolean | string | PrimOp | Closure | SymbolSExp | EmptySExp | CompoundSExp;
    // export const isSExp = (x: any): x is SExpValue =>
    //     typeof(x) === 'string' || typeof(x) === 'boolean' || typeof(x) === 'number' ||
    //     isSymbolSExp(x) || isCompoundSExp(x) || isEmptySExp(x) || isPrimOp(x) || isClosure(x);

//TODO: check about symbol
const makeChildSExp= (dady:NodeDecl,sexp:SExpValue):Edge[]=>
isCompoundSExp(sexp)?   isCompoundSExp(sexp.val1)&&isCompoundSExp(sexp.val2)?   (((dad:NodeDecl,val1:NodeDecl,val2:NodeDecl)=>
                                                                                [makeEdge(NodeDeclToRef(dad),val1,makeEdgeLabel("val1")),makeEdge(NodeDeclToRef(dad),val2,makeEdgeLabel("val2"))]
                                                                                .concat(makeChildSExp(val1,sexp.val1)).concat(makeChildSExp(val2,sexp.val2)))
                                                                                (dady,makeNodeDecl(makeCompundGen("CompoundSExp"),'["CompoundSExp"]'),makeNodeDecl(makeCompundGen("CompoundSExp"),'["CompoundSExp"]'))):
                        isSymbolSExp(sexp.val1)&&isCompoundSExp(sexp.val2)?     (((dad:NodeDecl,val1:NodeDecl,val2:NodeDecl)=>
                                                                                [makeEdge(NodeDeclToRef(dad),val1,makeEdgeLabel("val1")),makeEdge(NodeDeclToRef(dad),val2,makeEdgeLabel("val2"))]
                                                                                .concat(makeSymbolExps(val1,sexp.val1)).concat(makeChildSExp(val2,sexp.val2)))
                                                                                (dady,makeAtomicSexp(dady,sexp.val1),makeNodeDecl(makeCompundGen("CompoundSExp"),'["CompoundSExp"]'))):





                        isSymbolSExp(sexp.val1)?                                (((dad:NodeDecl,val1:NodeDecl,val2:NodeDecl)=>
                                                                                [makeEdge(NodeDeclToRef(dad),val1,makeEdgeLabel("val1")),makeEdge(NodeDeclToRef(dad),val2,makeEdgeLabel("val2"))]
                                                                                .concat(makeSymbolExps(val1,sexp.val1)))
                                                                                (dady,makeAtomicSexp(dady,sexp.val1),makeAtomicSexp(dady,sexp.val2))):




                        isCompoundSExp(sexp.val1)&&isSymbolSExp(sexp.val2)?     (((dad:NodeDecl,val1:NodeDecl,val2:NodeDecl)=>
                                                                                [makeEdge(NodeDeclToRef(dad),val1,makeEdgeLabel("val1")),makeEdge(NodeDeclToRef(dad),val2,makeEdgeLabel("val2"))]
                                                                                .concat(makeChildSExp(val1,sexp.val1)).concat(makeSymbolExps(val2,sexp.val2)))
                                                                                (dady,makeNodeDecl(makeCompundGen("CompoundSExp"),'["CompoundSExp"]'),makeAtomicSexp(dady,sexp.val2))):


                        isSymbolSExp(sexp.val2)?                                (((dad:NodeDecl,val1:NodeDecl,val2:NodeDecl)=>
                                                                                [makeEdge(NodeDeclToRef(dad),val1,makeEdgeLabel("val1")),makeEdge(NodeDeclToRef(dad),val2,makeEdgeLabel("val2"))]
                                                                                .concat(makeSymbolExps(val2,sexp.val2)))
                                                                                (dady,makeAtomicSexp(dady,sexp.val1),makeAtomicSexp(dady,sexp.val2))):


                        isCompoundSExp(sexp.val1)?                              (((dad:NodeDecl,val1:NodeDecl,val2:NodeDecl)=>
                                                                                [makeEdge(NodeDeclToRef(dad),val1,makeEdgeLabel("val1")),makeEdge(NodeDeclToRef(dad),val2,makeEdgeLabel("val2"))]
                                                                                .concat(makeChildSExp(val1,sexp.val1)))
                                                                                (dady,makeNodeDecl(makeCompundGen("CompoundSExp"),'["CompoundSExp"]'),makeAtomicSexp(dady,sexp.val2))):                                                                                
                        isCompoundSExp(sexp.val2)?                              (((dad:NodeDecl,val1:NodeDecl,val2:NodeDecl)=>
                                                                                [makeEdge(NodeDeclToRef(dad),val1,makeEdgeLabel("val1")),makeEdge(NodeDeclToRef(dad),val2,makeEdgeLabel("val2"))]
                                                                                .concat(makeChildSExp(val2,sexp.val2)))
                                                                                (dady,makeAtomicSexp(dady,sexp.val1),makeNodeDecl(makeCompundGen("CompoundSExp"),'["CompoundSExp"]'))):

                                                                                (((dad:NodeDecl,val1:NodeDecl,val2:NodeDecl)=>
                                                                                [makeEdge(NodeDeclToRef(dad),val1,makeEdgeLabel("val1")),makeEdge(NodeDeclToRef(dad),val2,makeEdgeLabel("val2"))])
                                                                                (dady,makeAtomicSexp(dady,sexp.val1),makeAtomicSexp(dady,sexp.val2))):
                                                                                [makeEdge(makeNodeDecl("ProblemmakeChildSExp","problemmakeChildSExp"),makeNodeDecl("ProblemmakeChildSExp","problemmakeChildSExp"))]

                                                    



const makeChildCExp=(dady:Node,exps:CExp[]):Edge[]=>
    exps.reduce((acc:Edge[],cur:CExp)=> acc.concat(makeEdgesCExp(dady,cur)) ,[]);

//AppExp | IfExp | ProcExp | LetExp | LitExp | LetrecExp | SetExp;
const makeNodeDeclCExp=(exp:Exp):NodeDecl=>
    isAtomicExp(exp)? makeAtomicNodeDecl(exp):
    isProcExp(exp)? makeNodeDecl(makeProcGen("ProcExp"),`["ProcExp"]`):
    isAppExp(exp)? makeNodeDecl(makeAppGen("AppExp"),`["AppExp"]`):
    isIfExp(exp)? makeNodeDecl(makeIfGen("IfExp"),`["IfExp"]`):
    isLetExp(exp)? makeNodeDecl(makeLetGen("LetExp"),`["LetExp"]`):
    isLetrecExp(exp)? makeNodeDecl(makeLetRecGen("LetRecExp"),`["LetRecExp"]`):
    isLitExp(exp)? makeNodeDecl(makeLitGen("LitExp"),`["LitExp"]`):
    isSetExp(exp)? makeNodeDecl(makeSetGen("SetExp"),`["SetExp"]`):
    makeNodeDecl("ProblemMakeNodeDeclCExp","makeNodeDeclCExp")


const makeSymbolExps=(dady:NodeDecl,exp:SymbolSExp):Edge[]=>
        (((dad:NodeDecl,val1:NodeDecl)=>
        [makeEdge(NodeDeclToRef(dad),val1,makeEdgeLabel("val1"))])
        (dady,makeNodeDecl(makeValGen("Val"),`["(${exp.val})"]`)));

//isEmpty(params) ? makeFailure("Empty args for special form") :
// op === "if" ? parseIfExp(params) :
// op === "lambda" ? parseProcExp(first(params), rest(params)) :
// op === "let" ? parseLetExp(first(params), rest(params)) :
// op === "quote" ? parseLitExp(first(params)) :
// op === "letrec" ? parseLetrecExp(first(params), rest(params)) :
// op === "set!" ? parseSetExp(params) :
// makeFailure("Never");
//Define

const makeEdgesCExp=(dady:Node,exp:CExp):Edge[]=>
    isAtomicExp(exp)?  (((dad:Node,val1:NodeDecl)=>
                        [makeEdge(NodeDeclToRef(dad),val1)])
                        (dady,makeAtomicNodeDecl(exp))):
                        (((dad:Node,val1:NodeDecl)=>
                        [makeEdge(NodeDeclToRef(dad),val1)].concat(makeTree(NodeDeclToRef(val1),exp)))
                        (dady,makeNodeDecl(`${makeCExpTitle(exp)}`,`["${exp.tag}"]`)))


const makeAtomicNodeDecl=(exp:AtomicExp):NodeDecl=>
    isBoolExp(exp)&&(exp.val===true)?makeNodeDecl(`${makeBoolExpGen("BoolExp")}`,`["${exp.tag}(#t)"]`):
    isBoolExp(exp)&&(exp.val===false)?makeNodeDecl(`${makeBoolExpGen("BoolExp")}`,`["${exp.tag}(#f)"]`):
    isBoolExp(exp)?makeNodeDecl(`${makeBoolExpGen("BoolExp")}`,`["${exp.tag}(${exp.val})"]`):
    isNumExp(exp)?makeNodeDecl(`${makeNumExpaGen("NumExp")}`,`["${exp.tag}(${exp.val})"]`):
    isStrExp(exp)?makeNodeDecl(`${makeStrExpGen("StrExp")}`,`["${exp.tag}(${exp.val})"]`):
    isPrimOp(exp)?makeNodeDecl(`${makeprimOpGen("PrimOp")}`,`["${exp.tag}(${exp.op})"]`):
    isVarRef(exp)?makeNodeDecl(`${makeVarRefGen("VarRef")}`,`["${exp.tag}(${exp.var})"]`):
    makeNodeDecl("ProblemAtomicDecl","ProblemAtomicDecl")

const makeEdgeString=(edge:Edge):Result<string>=>
    (edge.edgeLabel===undefined)? makeOk(`${makeNodeString(edge.from)} --> ${makeNodeString(edge.to)}`):
    makeOk(`${makeNodeString(edge.from)} -->|${edge.edgeLabel?.identifier}| ${makeNodeString(edge.to)}`)
    


const makeNodeString=(node:Node):string=>
    isNodeDecl(node)?  `${node.id}${node.label}`:
    isNodeRef(node)?    `${node.id}`:
    'failure';


const unparseGraphContent=(exp:GraphContent):Result<string[]>=>
    isCompundGraph(exp)? mapResult(makeEdgeString,exp.edges):
    isAtomicGrpah(exp)? makeOk([makeNodeString(exp.nodeDecl)]):
    makeFailure("not atomic or compund graph");


export const unparseMermaid = (exp: Graph): Result<string>=>
    //bind(mapResult(l2ToJS, exp.body), (body: string[]) => makeOk(`((${map(v => v.var, exp.args).join(",")}) => ${body.join("")})`)) :
    isGraph(exp)?   bind(unparseGraphContent(exp.graphContect),(x:string[])=>makeOk(`graph ${exp.header.Dir} \n${x.join("\n")}`)):
    makeFailure("badInput");

export const L4toMermaid = (concrete: string): Result<string>=>
    bind(bind(bind(p(concrete),parseMyProgramL4),mapL4toMermaid),unparseMermaid);

const parseMyProgramL4= (sexp:Sexp):Result<Parsed>=>

    (sexp===""||isEmpty(sexp))?
    (makeFailure("Problem")):
    (isArray(sexp)&&first(sexp)==='L4'?
    parseL4Program(sexp):parseL4Exp(sexp))




const makeCExpTitle=(exp:CExp):string=>
    isNumExp(exp)? makeNumExpaGen("NumExp"):
    isBoolExp(exp)? makeBoolExpGen("BoolExp"):
    isStrExp(exp)? makeStrExpGen("StrExp"):
    isPrimOp(exp)? makeprimOpGen("PrimOp"):
    isVarRef(exp)? makeVarRefGen("VarRef"):
    isAppExp(exp)? makeAppGen("AppExp"):
    isIfExp(exp)? makeIfGen("IfExp"):
    isProcExp(exp)? makeProcGen("BoolExp"):
    isLetExp(exp)? makeLetGen("BoolExp"):
    isLetrecExp(exp)? makeLetRecGen("BoolExp"):
    isLitExp(exp)? makeLitGen("BoolExp"):
    isSetExp(exp)? makeSetGen("BoolExp"):
    "balagan";
    