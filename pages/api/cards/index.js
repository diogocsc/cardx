import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';


"use strict";

// Import the dependency.
import clientPromise from '../../../mongodb-client';

export default withApiAuthRequired( async (req, res) => {
    const { user } = getSession(req, res);
    if (user) {

        const client = await clientPromise;
        const collection = await client.db().collection('cards');
        try {
            let mySort= {createdOn:-1, lastModified: -1, cardText: 1};
            const cards= await collection.find({ownedBy:{$ne: user.email}}).sort(mySort).toArray();
            res.json(cards);
        } catch(err){
            res.send('Error '+ err);
        }
    }
    else res.send('No permission');
 })