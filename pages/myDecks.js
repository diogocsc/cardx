import Link from 'next/link'
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { useState, useEffect } from 'react'
import Layout from '../components/layout'
import { useUser, withPageAuthRequired, getSession } from '@auth0/nextjs-auth0';
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

export const getServerSideProps=withPageAuthRequired({
  async getServerSideProps(context) {
    const session = getSession(context.req, context.res);
    const deckList = session ? await fetchDecksFromDB(session): '';
    return {
        props: {
          deckList,
        }
      };
    }
})


export default function Home({user, deckList,categoryList}) {
  const { error, isLoading } = useUser();
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

  const deleteDeck = async deckId => {
    if (confirm("This will permanently delete the deck for all users. Do you really want to delete this deck? ")) {
    const res = await fetch('/api/decks/'+deckId, {
      method: 'DELETE'
    })
    fetchDecks();
  }
  }
  
if (isLoading) return <div>Loading...</div>;
if (error) return <div>{error.message}</div>;
// If no user exists, display access denied message
if (!user) { return  <Layout><AccessDenied/></Layout> }
const isAdmin = user ? user.email === process.env.NEXT_PUBLIC_EMAIL_ADMIN : null;

  return (
    <Layout activeMenu='myDecks'>

      <Head>
        <title>CardX - My Decks</title>
        <meta name="description" content="A Card Repository" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <h1>
          My Decks
        </h1>
        <Link href="/decks/deckEdit"><a>New Deck</a></Link>

        <div className={styles.grid}>
        
          {decks.map(({ _id, name, description, createdBy, createdByName,lastModified, createdOn, ownedBy }) => (
            <div className={styles.card} key={_id}>
              { createdBy===user.email || isAdmin ?
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
               <button onClick={() => removeDeck(_id,user.email, ownedBy,name,description)}> DisOwn Deck</button>
               { isAdmin && 
                <button onClick={() => deleteDeck(_id)}> Delete Deck</button>}
             </div>
            ))}
        </div>

        
      </Layout>
    
  )
}
