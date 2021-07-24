import { filter, map, reduce, reduceRight, compose, indexOf } from "ramda"; 

/* Question 1 */

export const partition: <T> (pred: Function, elements:T[]) =>  T[][]= (pred,elements) => 
    [elements.filter(x => pred(x)),elements.filter(x => !pred(x))]

/* Question 2 */
export const mapMat: <T> (func: ((x:T) => T), matrix:T[][]) => T[][]=(func,matrix)=> matrix.map(x=> x.map(y=>func(y)));

/* Question 3 */
export const composeMany:<T>(elements:Array<((x:T)=>T)>)=>(x:T)=>T =(elements)=>
{
    return elements.reduceRight(<T>(acc:((x:T)=>T),cur:((x:T)=>T))=>compose(cur,acc),);
}

/* Question 4 */
interface Languages {
    english: string;
    japanese: string;
    chinese: string;
    french: string;
}

interface Stats {
    HP: number;
    Attack: number;
    Defense: number;
    "Sp. Attack": number;
    "Sp. Defense": number;
    Speed: number;
}

interface Pokemon {
    id: number;
    name: Languages;
    type: string[];
    base: Stats;
}

export const maxSpeed: (pokemons:Pokemon[])=> Pokemon[] = (pokemons:Pokemon[])=>
{
    return pokemons.filter((x:Pokemon)=> x.base.Speed===(pokemons.reduce((acc:number,curr:Pokemon)=>Math.max(acc,curr.base.Speed),0)));
};


export const uniqueTypes :((pokemons:Pokemon[])=>string[])= function(pokemons:Pokemon[]):string[]
{
    let typesArr:string[] = pokemons.reduce((acc:string[],cur:Pokemon)=> acc.concat(cur.type) ,[]);
   
    return typesArr.filter((type:string,possition:number)=>typesArr.indexOf(type)===possition).sort()
}

export const grassTypes = (Pokemons:Pokemon[])=> Pokemons.filter(x=> x.type.reduce((acc:boolean,curr:String)=>acc||(curr==="Grass"),false)===true).map((x:Pokemon)=>x.name.english).sort()

// const Pokedex = [{"id":15, "name": {"english": "NOAME", "japanese": "NOAMJ", "chinese": "NOAMC", "french": "NOAMF"}, "type": ["Grass", "Fire"], "base": {"HP": 97, "Attack": 99, "Defense": 95, "Sp. Attack": 67, "Sp. Defense": 87, "Speed": 105}},
//                  {"id":17, "name": {"english": "ALONE", "japanese": "ALONJ", "chinese": "ALONC", "french": "ALONF"}, "type": ["Water", "Fire"], "base": {"HP": 97, "Attack": 99, "Defense": 95, "Sp. Attack": 67, "Sp. Defense": 87, "Speed": 56}},
//                  {"id":16, "name": {"english": "AVIE", "japanese": "AVIJ", "chinese": "AVIC", "french": "AVIF"}, "type": [], "base": {"HP": 97, "Attack": 99, "Defense": 95, "Sp. Attack": 67, "Sp. Defense": 87, "Speed": 105}},  
//                  {"id":15, "name": {"english": "TOMERE", "japanese": "TOMERJ", "chinese": "TOMERC", "french": "TOMERF"}, "type": ["Grass"], "base": {"HP": 97, "Attack": 99, "Defense": 95, "Sp. Attack": 67, "Sp. Defense": 87, "Speed": 80}}];


// console.log("gel");
// console.log(uniqueTypes(Pokedex));

