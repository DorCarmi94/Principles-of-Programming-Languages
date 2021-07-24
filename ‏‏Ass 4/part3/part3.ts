export function *braid(generator1:Generator,generator2:Generator)
{
    let x=generator1.next();
    let y=generator2.next();
    while(x.done===false && y.done===false)
    {
        yield x.value;
        yield y.value;
        x=generator1.next();
        y=generator2.next();
    }
    while(x.done===false)
    {
        yield x.value;
        x=generator1.next();
    }
    while(y.done===false)
    {
        yield y.value;
        y=generator2.next();
    }


}

export function *biased(generator1:Generator,generator2:Generator)
{
    let x=generator1.next();
    let xx=generator1.next();
    let y=generator2.next();
    while(x.done===false && xx.done===false&&y.done===false)
    {
        yield x.value;
        yield xx.value;
        yield y.value;
        x=generator1.next();
        xx=generator1.next();
        y=generator2.next();
    }
    if(x.done===false && xx.done===false)
    {
        yield x.value;
        yield xx.value;
        x=generator1.next();
    }
    while(x.done===false)
    {
        yield x.value;
        x=generator1.next();
    }
    while(y.done===false)
    {
        yield y.value;
        y=generator2.next();
    }
}