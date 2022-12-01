const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
var jwt = require('jsonwebtoken');
require('dotenv').config();
const cors = require('cors');
const port = process.env.PORT || 5000;

//middleware
app.use(express.json());
app.use(cors());


//verified json Token

function verifyjwt(req, res, next) {
    const authHeader = req?.headers?.authorization;

    //condition for they have a token or not 
    if (!authHeader) {
        return res.status(401).send({ message: 'unathorized access' })
    }

    // Now I think they have the token, so this is the token validation condition

    const token = authHeader.split(' ')[1];
        
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'forbidden access' })
        }
        req.decoded = decoded
        next()
    })
    

}




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zzyokmq.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        await client.connect();
        const wareHouseCollection = client.db('warehouse').collection('house')
        const watchCollection = client.db('watchStore').collection('watches')
        const orderCollection = client.db('orders').collection('order')
        const reviewCollection = client.db('reviews').collection('review')

        //get
        app.get('/product', async (req, res) => {
            const query = {};
            const corsur = wareHouseCollection.find(query);
            const result = await corsur.toArray();
            res.send(result)
        })





        //get one product 

        app.get('/product/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await wareHouseCollection.findOne(query)
            res.send(result)
        })

        //auth

        app.post('/login', async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1d'
            })

            res.send(accessToken)
        })

        //get  myorders

        app.get('/myorders',verifyjwt, async (req, res) => {
            const decodedEmail = req.decoded.email
            const email = req.query.email
            if (email === decodedEmail) {
                const query = { Email: email };
                const orders = orderCollection.find(query);  
                const result = await orders.toArray();
                res.send(result)
            } else {
                res.send(403).send({ message: 'forbidden access' })
            }
        })



        //get one product watch

        app.get('/watch/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await watchCollection.findOne(query);
            res.send(result)
        })

        // delete my order
        app.delete('/myorders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await orderCollection.deleteOne(query);
            res.send(result);
        })

        //post 
        // app.post('/product', async (req, res) => {
        //     const product = req.body;
        //     const result = await wareHouseCollection.insertOne(product)
        //     console.log('add new product', result)
        //     res.send(result)
        // })

        // add new product post
        app.post('/product', async (req, res) => {
            const product = req.body;
            const result = await watchCollection.insertOne(product)
            res.send(result)
        })

        // post orders
        app.post('/myorder', async (req, res) => {
            const product = req.body;
            const result = await orderCollection.insertOne(product)
            res.send(result)
        })


        //review post 
        app.post('/review', async (req, res) => {
            const body = req.body;
            const result = await reviewCollection.insertOne(body)
            res.send(result)
        })

        // get watch products
        app.get('/watch', async (req, res) => {
            const query = {};
            const cursor = watchCollection.find(query)
            const result = await cursor.toArray();
            res.send(result)
        })

        // get customer review

        app.get('/review', async (req, res) => {
            const qeury = {};
            const cursor = reviewCollection.find(qeury)
            const result = await cursor.toArray()
            res.send(result)
        })






    }

    finally {
        // await client.close()
    }
}

run().catch(console.dir)


app.get('/', (req, res) => {
    res.send('hey mama my node code is working')
})

app.listen(port, () => {
    console.log('listen to port', port)
})