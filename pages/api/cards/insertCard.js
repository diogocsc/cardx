// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

"use strict";

// Import the dependency.
import clientPromise from '../../../mongodb-client';

export default async (req, res) => {
    const client = await clientPromise;
    const collection = await client.db().collection('cards');
    const card = {
      cardText: req.body.cardText
    }
    try {
      const c= await collection.insertOne(card);
      res.json(c);

  } catch(err){
      res.send('Error '+ err);
  }
 };
