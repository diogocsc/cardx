import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';

"use strict";

// Import the dependency.
import clientPromise from '../../../../mongodb-client';

export default withApiAuthRequired( async (req, res) => {
    const { user } = getSession(req, res);
    if (user) {
        const client = await clientPromise;
        const colcards = await client.db().collection('cards');
        let decksCount= await colcards.count({decks:req.query.id})
        let myobject = {totalCards: decksCount};
       
        try {
            res.json(decksCount);
        } catch(err){
            res.send('Error '+ err);
        }
    }
    else res.send('No permission');
 })
