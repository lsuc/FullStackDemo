import express from 'express'

class ExpressServerTest {
    constructor(){}
    test() 
    {
        const app = express()
        app.get('/', (_ /* just an unused req */, res)=>{res.send('Hello world')});

        app.listen(4000, ()=>{console.log("server started on localhost:4000")});
    }
}

export default ExpressServerTest