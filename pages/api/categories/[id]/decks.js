import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';

"use strict";

// Import the dependency.
import clientPromise from '../../../../mongodb-client';

export default withApiAuthRequired( async (req, res) => {
    const { user } = getSession(req, res);
    if (user) {
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
 })
