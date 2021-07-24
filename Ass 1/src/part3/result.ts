/* Question 3 */

import { reduce } from "ramda";

interface Ok<T>{
    tag:"Ok"
    value:T
}

interface Failure{
    tag:"Failure"
    message:String
}

export type Result<T> = Ok<T>|Failure;

export const makeOk =  <T>(value: T): Result<T> => { 
    return {tag:"Ok",value:value};
}


export const makeFailure = <T>(message: String): Result<T> => { 
    return {tag:"Failure",message:message};
}

export const isOk =  <T>(x: Result<T>): x is Ok<T> => x.tag === "Ok";
export const isFailure = <T>(x: Result<T>): x is Failure => x.tag === "Failure";




/* Question 4 */
export const bind = <T, U>(result: Result<T>, f: (x: T) => Result<U>): Result<U> => {
    const newResult = isOk(result)? f(result.value): result;
    return newResult;
    }

/* Question 5 */
interface User {
    name: string;
    email: string;
    handle: string;
}

const validateName = (user: User): Result<User> =>
    user.name.length === 0 ? makeFailure("Name cannot be empty") :
    user.name === "Bananas" ? makeFailure("Bananas is not a name") :
    makeOk(user);

const validateEmail = (user: User): Result<User> =>
    user.email.length === 0 ? makeFailure("Email cannot be empty") :
    user.email.endsWith("bananas.com") ? makeFailure("Domain bananas.com is not allowed") :
    makeOk(user);

const validateHandle = (user: User): Result<User> =>
    user.handle.length === 0 ? makeFailure("Handle cannot be empty") :
    user.handle.startsWith("@") ? makeFailure("This isn't Twitter") :
    makeOk(user);

export const naiveValidateUser = (user:User)=>
{
    let answer:Result<User>= validateEmail(user);
    let answer2=answer.tag==="Ok"?validateHandle(user):answer;
    let answer3=answer2.tag==="Ok"?validateName(user):answer2;
    return answer3;
}



export const monadicValidateUser =(user:User)=> reduce((acc:Result<User>,curr:(x:User)=>Result<User>)=>bind(acc,curr),validateName(user) ,[validateHandle,validateEmail]);

