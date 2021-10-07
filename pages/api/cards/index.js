// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

"use strict";

// Import the dependency.
import clientPromise from '../../../mongodb-client';

export default async (req, res) => {
    const client = await clientPromise;
    const collection = await client.db().collection('cards');
    try {
      let mySort= {createdOn:-1};
      const cards= await collection.find().sort(mySort).toArray();
      res.json(cards);

  } catch(err){
      res.send('Error '+ err);
  }
 };
