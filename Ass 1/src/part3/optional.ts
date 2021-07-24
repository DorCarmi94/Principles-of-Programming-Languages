/* Question 1 */
interface Some<T>{
    tag:"Some"
    value: T
}

interface None<T>{
    tag:"None"
}
export type Optional<T>  = Some<T>|None<T>;

export const makeSome = <T>(value: T): Optional<T> => { 
    return {tag:"Some",value:value};
}
export const makeNone = <T>(): Optional<T> => { 
    return {tag:"None"};
}

export const isSome = <T>(x: Optional<T>): x is Some<T> => x.tag === "Some";
export const isNone = <T>(x: Optional<T>): x is None<T> => x.tag === "None";


/* Question 2 */
export const bind = <T, U>(optional: Optional<T>, f: (x: T) => Optional<U>): Optional<U> => {
    const newOptional = isSome(optional)? f(optional.value): optional;
    return newOptional;
    }

