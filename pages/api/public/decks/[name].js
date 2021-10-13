// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
"use strict";
import Cors from 'cors'
import initMiddleware from '../../../../lib/init-middleware'
// Import the dependency.
import clientPromise from '../../../../mongodb-client';

export default async (req, res) => {

        // Initialize the cors middleware
        const cors = initMiddleware(
            // You can read more about the available options here: https://github.com/expressjs/cors#configuration-options
            Cors({
            // Only allow requests with GET, POST and OPTIONS
            methods: ['GET', 'POST', 'OPTIONS'],
            //  methods: ['GET'],
            })
        ) 
        await cors(req, res); 
        const name=req.query.name;
        const client = await clientPromise;
        const collection = await client.db().collection('cards');
        const colDecks = await client.db().collection('decks');
        try {
            const decks= await colDecks.find({name: name}).toArray();
            const deckList = JSON.parse(JSON.stringify(decks));
            const deckId = deckList[0] ? deckList[0]._id : 0;
            let mySort= {createdOn:-1, lastModified: -1, cardText: 1};
            const cards= await collection.find({decks: deckId},{projection: {cardText: 1, url:1, _id:0}}).sort(mySort).toArray();
            res.json(cards);
        } catch(err){
            res.send('Error '+ err);
        }
   
 };
