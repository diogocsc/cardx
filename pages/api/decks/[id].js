"use strict";

import clientPromise from '../../../mongodb-client';
import { ObjectId } from "mongodb";
import { getSession } from 'next-auth/client'


export default async (req, res) => {
    const session = await getSession({ req })
    if (session) {

        const client = await clientPromise;
        const collection = await client.db().collection('decks');
        try {
            if(req.method == 'DELETE'){
                const r= await collection.deleteOne({_id: ObjectId(req.query.id)});
                res.json(r);
            }
            else if(req.method == 'PATCH'){
                const deck = await collection.updateOne({_id: ObjectId(req.query.id)},{ $set: { "name": req.body.name, "description": req.body.description, "ownedBy": req.body.ownedBy, "url": req.body.url},
                $currentDate: { lastModified: true } });
                res.json(deck);
            }
            else {
                const deck = await collection.findOne({_id: ObjectId(req.query.id)});
                res.json(deck);
            }

        } catch(err){
            res.send('Error '+ err);
        }  
    }
    else res.send('No permission');

};