"use strict";

import clientPromise from '../../../mongodb-client';
import { ObjectId } from "mongodb";
import { getSession } from 'next-auth/client'


export default async (req, res) => {
    const session = await getSession({ req })
    if (session) {

        const client = await clientPromise;
        const collection = await client.db().collection('categories');
        try {
            if(req.method == 'DELETE'){
                const r= await collection.deleteOne({_id: ObjectId(req.query.id)});
                res.json(r);
            }
            else if(req.method == 'PATCH'){
                const category = await collection.updateOne({_id: ObjectId(req.query.id)},{ $set: { "name": req.body.name, "description": req.body.description, "url": req.body.url},
                $currentDate: { lastModified: true } });
                res.json(category);
            }
            else {
                const category = await collection.findOne({_id: ObjectId(req.query.id)});
                res.json(category);
            }

        } catch(err){
            res.send('Error '+ err);
        }  
    }
    else res.send('No permission');

};