import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';


"use strict";

// Import the dependency.
import clientPromise from '../../../mongodb-client';

export default withApiAuthRequired(async (req, res) => {
  const { user } = getSession(req, res);
  if (user) {

    const client = await clientPromise;
    const collection = await client.db().collection('categories');
    const category = {
      name: req.body.name,
      description: req.body.description,
      url: req.body.url,
      createdBy: user.email,
      createdByName: user.name,
      createdOn: new Date(),

    }
    try {
      const c= await collection.insertOne(category);
      res.json(c);

  } catch(err){
      res.send('Error '+ err);
  }
 }
 else res.send('No permission');
})
