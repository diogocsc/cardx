// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { getSession } from 'next-auth/client'

"use strict";

// Import the dependency.
import clientPromise from '../../../mongodb-client';

export default async (req, res) => {
  const session = await getSession({ req })
  if (session) {

    const client = await clientPromise;
    const collection = await client.db().collection('decks');
    const deck = {
      name: req.body.name,
      description: req.body.description,
      url: req.body.url,
      createdBy: session.user.email,
      createdByName: session.user.name,
      ownedBy: [session.user.email],
      createdOn: new Date(),

    }
    try {
      const c= await collection.insertOne(deck);
      res.json(c);

  } catch(err){
      res.send('Error '+ err);
  }
 }
 else res.send('No permission');
};
