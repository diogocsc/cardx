import Link from 'next/link'
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { useState, useEffect } from 'react'
import Layout from '../components/layout'
import { useSession, getSession } from 'next-auth/client'
import AccessDenied from '../components/access-denied'
import CsvReader from '../components/csvreader'
import React from "react";


"use strict";

// Import the dependency.
import clientPromise from '../mongodb-client';




async function fetchDecksFromDB(session) {

  const client = await clientPromise;
  const collection = await client.db().collection('decks');
  let mySort= {createdOn:-1, lastModified: -1, name: 1};
  const decks= await collection.find({ownedBy: session.user.email}).sort(mySort).toArray();
  const deckList = JSON.parse(JSON.stringify(decks));
  return deckList;
}

export async function getServerSideProps(context) {
const session = await getSession(context);
const deckList = session ? await fetchDecksFromDB(session): '';

return {
    props: {
      deckList,
    }
  }
}


export default function Home({cardList, deckList,categoryList}) {
  const [ session, loading ] = useSession();
  const [categories, setCategories] = useState(categoryList);

  const [decks, setDecks] = useState(deckList);

  
  const fetchDecks = async (uri) => {
    const res = await fetch(uri)
    console.log(res);
    const data = await res.json()
    if (!data) {
      return {
        notFound: true,
      }
    }
    setDecks(data)
  }

  const removeDeck = async (deckId, email, ownedBy, name, description) => {
    const index = ownedBy.indexOf(email);
    ownedBy.splice(index,1);

    const res = await fetch(
      '/api/decks/'+deckId,
      {
        body: JSON.stringify({
          name: name,
          description: description,
          ownedBy: ownedBy,
        }),
        headers: {
          'Content-Type': 'application/json'
        },
        method: 'PATCH'
      }
    )

    fetchDecks('/api/decks/my');
  }

  
  // When rendering client side don't display anything until loading is complete
  if (typeof window !== 'undefined' && loading) return null

  // If no session exists, display access denied message
  if (!session) { return  <Layout><AccessDenied/></Layout> }

  // If session exists, display content
  const isAdmin = session.user.email === process.env.NEXT_PUBLIC_EMAIL_ADMIN;

  return (
    <Layout>

      <Head>
        <title>CardX - My Decks</title>
        <meta name="description" content="A Card Repository" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <h1>
          My Decks
        </h1>

        <div className={styles.grid}>
        
          {decks.map(({ _id, name, description, createdBy, createdByName,lastModified, createdOn, ownedBy }) => (
            <div className={styles.card} key={_id}>
              { createdBy===session.user.email || isAdmin ?
              <a href={"/decks/"+_id} >
                {name}
                <br />
                {createdOn ?  'Created On: ' + createdOn : ''}
                {createdOn ? <br /> : ''}
                {lastModified}
                {lastModified ? <br /> : ''}
              </a>
              :
                <div>
                {name}
                <br />
                {createdOn ?  'Created On: ' + createdOn : ''}
                {createdOn ? <br /> : ''}
                {lastModified}
                {lastModified ? <br /> : ''}
                </div>
              }
              {createdBy && <a href={"/cards/"+btoa(unescape(encodeURIComponent(createdBy)))+"?name="+createdByName}>
              Created By: {createdByName}</a>}
                {createdBy &&  <br /> }
               <button onClick={() => removeDeck(_id,session.user.email, ownedBy,name,description)}> DisOwn Deck</button>
             </div>
            ))}
        </div>

        
      </Layout>
    
  )
}
