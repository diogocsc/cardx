"use strict";

import clientPromise from '../../../mongodb-client';
import { ObjectId } from "mongodb";
import { getSession } from 'next-auth/client'


export default async (req, res) => {
    const session = await getSession({ req })
    if (session) {

        const client = await clientPromise;
        const collection = await client.db().collection('cards');
        try {
            if(req.method == 'DELETE'){
                const r= await collection.deleteOne({_id: ObjectId(req.query.id)});
                res.json(r);
            }
            else if(req.method == 'PATCH'){
                const card = await collection.updateOne({_id: ObjectId(req.query.id)},{ $set: { "cardText": req.body.cardText,"category": req.body.category, "cardUsers": req.body.cardUsers, "source": req.body.source},
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

};