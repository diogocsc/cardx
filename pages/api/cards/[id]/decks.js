import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';

import { ObjectId } from 'bson'

"use strict";

// Import the dependency.
import clientPromise from '../../../../mongodb-client';

export default withApiAuthRequired( async (req, res) => {
    const { user } = getSession(req, res);
    if (user) {
        const client = await clientPromise;
        const coldecks = await client.db().collection('decks');
        const colcards = await client.db().collection('cards');
        const card = await colcards.find({_id:ObjectId(req.query.id)}).toArray();
        const cardList = JSON.parse(JSON.stringify(card));
        let cardDecks = cardList[0] && cardList[0].decks ? cardList[0].decks : [];
        cardDecks.map ? cardDecks= cardDecks.map( x  => ObjectId(x)) : '';
       
        try {
            let mySort= {createdOn:-1, lastModified: -1, name: 1};
            const decks= await coldecks.find({_id : {$in : cardDecks}}).sort(mySort).toArray();
            res.json(decks);
        } catch(err){
            res.send('Error '+ err);
        }
    }
    else res.send('No permission');
 })
