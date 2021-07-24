import {map,zipWith, intersection} from "ramda"

import { first, second, rest, allT, isEmpty } from "../shared/list";
import { isArray, isString, isNumericString, isIdentifier } from "../shared/type-predicates";
import { Result, makeOk, makeFailure, bind, mapResult, safe2 } from "../shared/result";
import { parse as p, isSexpString, isToken } from "../shared/parser";
import { Sexp, Token } from "s-expression";

// <graph> ::= <header> <graphContent> // Graph(dir: Dir, content: GraphContent)
// <header> ::= graph (TD|LR)<newline> // Direction can be TD or LR
// <graphContent> ::= <atomicGraph> | <compoundGraph>
// <atomicGraph> ::= <nodeDecl>
// <compoundGraph> ::= <edge>+
// <edge> ::= <node> --><edgeLabel>? <node><newline> // <edgeLabel> is optional
// // Edge(from: Node, to: Node, label?: string)
// <node> ::= <nodeDecl> | <nodeRef>
// <nodeDecl> ::= <identifier>["<string>"] // NodeDecl(id: string, label: string)
// <nodeRef> ::= <identifier> // NodeRef(id: string)
// <edgeLabel> ::= |<identifier>| // string

export type GraphContent=AtomicGrpah | CompundGraph;
export type Node=NodeDecl|NodeRef;

export interface Graph{tag: "Graph";header:Header;graphContect:GraphContent;}
export interface Header{tag:"Header",Dir:string;}
export interface AtomicGrpah{tag:"AtomicGraph";nodeDecl:NodeDecl;}
export interface CompundGraph{tag:"CompundGraph";edges:Edge[];}
export interface Edge{tag:"Edge";from:Node;to:Node;edgeLabel?:EdgeLabel;}
export interface NodeDecl{tag:"NodeDecl";id:string;label:string;}
export interface NodeRef{tag:"NodeRef";id:string;}
export interface EdgeLabel{tag:"EdgeLabel";identifier:string;}

export const makeGraph          =(header:Header,graphContect:GraphContent):Graph=>({tag:"Graph",header:header,graphContect:graphContect});
export const makeHeader         =(dir:string):Header=>({tag:"Header",Dir:dir});
export const makeAtomicGraph    =(nodeDecl:NodeDecl):AtomicGrpah=>({tag:"AtomicGraph",nodeDecl:nodeDecl});
export const makeCompundGraph   =(edges:Edge[]):CompundGraph=>({tag:"CompundGraph",edges:edges});
export const makeEdge           =(from:Node,to:Node,label?:EdgeLabel):Edge=>({tag:"Edge",from:from,to:to,edgeLabel:label});
export const makeNodeDecl       =(id:string,label:string):NodeDecl=>({tag:"NodeDecl",id:id,label:label})
export const makeNodeRef        =(id:string):NodeRef=>({tag:"NodeRef",id:id});
export const makeEdgeLabel      =(id:string):EdgeLabel=>({tag:"EdgeLabel",identifier:id});

export const isGraph = (x: any): x is Graph => x.tag === "Graph";
export const isHeader = (x: any): x is Header => x.tag === "Header";
export const isAtomicGrpah = (x: any): x is AtomicGrpah => x.tag === "AtomicGraph";
export const isCompundGraph = (x: any): x is CompundGraph => x.tag === "CompundGraph";
export const isEdge = (x: any): x is Edge => x.tag === "Edge";
export const isNodeDecl = (x: any): x is NodeDecl => x.tag === "NodeDecl";
export const isNodeRef = (x: any): x is NodeRef => x.tag === "NodeRef";
export const isEdgeLabel = (x: any): x is EdgeLabel => x.tag === "EdgeLabel";

export const isGraphContent= (x: any): x is GraphContent => isAtomicGrpah(x) || isCompundGraph(x);
export const isNode= (x: any): x is Node => isNodeDecl(x) || isNodeRef(x);