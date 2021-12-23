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
        const client = await clientPromise;
        const email = "papoapapo2020@gmail.com"
        /* retrieves all decks for papo a papo account. */
        const colDecks = await client.db().collection('decks');
        try {
            let mySort= {name: 1};
            const decks= await colDecks.find({ownedBy: email},{projection: {name: 1, description:1, _id:0}}).sort(mySort).toArray();
            res.json(decks);
        } catch(err){
            res.send('Error '+ err);
        }
   
 };
