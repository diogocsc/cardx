// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { getSession } from 'next-auth/client'

"use strict";

// Import the dependency.
import clientPromise from '../../../mongodb-client';

export default async (req, res) => {
  const session = await getSession({ req })
  if (session) {

    const client = await clientPromise;
    const collection = await client.db().collection('cards');
    const card = {
      cardText: req.body.cardText,
      category: req.body.category,
      cardUsers: req.body.cardUsers,
      source: req.body.source,
      createdBy: session.user.email,
      createdByName: session.user.name,
      createdOn: new Date()
    }
    try {
      const c= await collection.insertOne(card);
      res.json(c);

  } catch(err){
      res.send('Error '+ err);
  }
 }
 else res.send('No permission');
};
