import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';


"use strict";

// Import the dependency.
import clientPromise from '../../../mongodb-client';

export default withApiAuthRequired(  async (req, res) => {
  const { user } = getSession(req, res);
  if (user) {

    const client = await clientPromise;
    const collection = await client.db().collection('cards');
    const card = {
      cardText: req.body.cardText,
      category: req.body.category,
      cardUsers: req.body.cardUsers,
      source: req.body.source,
      url: req.body.url,
      decks: req.body.decks,
      createdBy: user.email,
      createdByName: user.name,
      ownedBy: [user.email],
      createdOn: new Date(),

    }
    try {
      const c= await collection.insertOne(card);
      res.json(c);

  } catch(err){
      res.send('Error '+ err);
  }
 }
 else res.send('No permission');
})
