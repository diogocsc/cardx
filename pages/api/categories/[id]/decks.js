// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { getSession } from 'next-auth/client'
import { ObjectId } from 'bson'

"use strict";

// Import the dependency.
import clientPromise from '../../../../mongodb-client';

export default async (req, res) => {
    const session = await getSession({ req })
    if (session) {
        const client = await clientPromise;
        const coldecks = await client.db().collection('decks');
        let mySort= {name: 1};
        const decks= await coldecks.find({categories:req.query.id}).sort(mySort).toArray();
       
        try {
            let mySort= {name: 1};
            res.json(decks);
        } catch(err){
            res.send('Error '+ err);
        }
    }
    else res.send('No permission');
 };
