"use strict";

import clientPromise from '../../../mongodb-client';
import { ObjectId } from "mongodb";
import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';


export default withApiAuthRequired(async (req, res) => {
    const { user } = getSession(req, res);
    if (user) {

        const client = await clientPromise;
        const collection = await client.db().collection('cards');
        try {
            if(req.method == 'DELETE'){
                const r= await collection.deleteOne({_id: ObjectId(req.query.id)});
                res.json(r);
            }
            else if(req.method == 'PATCH'){
                const card = await collection.updateOne({_id: ObjectId(req.query.id)},{ $set: { "cardText": req.body.cardText,"category": req.body.category, "cardUsers": req.body.cardUsers, "source": req.body.source, "ownedBy": req.body.ownedBy, "url": req.body.url, "decks": req.body.decks},
                $currentDate: { lastModified: true } });
                res.json(card);
            }
            else {
                const card = await collection.findOne({_id: ObjectId(req.query.id)});
                res.json(card);
            }

        } catch(err){
            res.send('Error '+ err);
        }  
    }
    else res.send('No permission');

})