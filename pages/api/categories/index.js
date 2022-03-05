// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { getSession } from 'next-auth/client'

"use strict";

// Import the dependency.
import clientPromise from '../../../mongodb-client';

export default async (req, res) => {
    const session = await getSession({ req })
    if (session) {

        const client = await clientPromise;
        const collection = await client.db().collection('categories');
        try {
            let mySort= {createdOn:-1, lastModified: -1, name: 1};
            const categories= await collection.find().sort(mySort).toArray();
            res.json(categories);
        } catch(err){
            res.send('Error '+ err);
        }
    }
    else res.send('No permission');
 };
