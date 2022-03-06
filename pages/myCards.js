import Link from 'next/link'
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { useState, useEffect } from 'react'
import Layout from '../components/layout'
import { useSession, getSession } from 'next-auth/client'
import AccessDenied from '../components/access-denied'
import CsvReader from '../components/csvreader'



"use strict";

// Import the dependency.
import clientPromise from '../mongodb-client';

async function fetchCardsFromDB(context, session) {
  const email=session.user.email;
  const client = await clientPromise;
  const collection = await client.db().collection('cards');
  let mySort= {createdOn:-1, lastModified: -1, cardText: 1};
  const cards= await collection.find({ownedBy:email}).sort(mySort).toArray();
  const cardList = JSON.parse(JSON.stringify(cards));
  return cardList;
}

export async function getServerSideProps(context) {
const session = await getSession(context);
const cardList = session ? await fetchCardsFromDB(context, session): '';



return {
    props: {
      cardList,
    }
  }
}


export default function Home({cardList, deckList,categoryList}) {
  const [ session, loading ] = useSession();
  
  const [cards, setCards] = useState(cardList);
 

  const fetchCards = async (uri) => {
    const res = await fetch(uri)
    const data = await res.json()
    if (!data) {
      return {
        notFound: true,
      }
    }
    setCards(data)
  }

  const deleteCard = async cardId => {
    if (confirm("This will permanently delete the card for all users. Do you really want to delete this card? ")) {
    const res = await fetch('/api/cards/'+cardId, {
      method: 'DELETE'
    })
    fetchCards('/api/cards/my');
    }
  }

 const removeCard = async (cardId, email, ownedBy, cardText, category, cardUsers, source, url) => {
    const index = ownedBy.indexOf(email);
    ownedBy.splice(index,1);

    const res = await fetch(
      '/api/cards/'+cardId,
      {
        body: JSON.stringify({
          cardText: cardText,
          category: category,
          cardUsers: cardUsers,
          source: source,
          ownedBy: ownedBy,
          url: url,
        }),
        headers: {
          'Content-Type': 'application/json'
        },
        method: 'PATCH'
      }
    )

    fetchCards('/api/cards/my');
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
        <title>CardX</title>
        <meta name="description" content="A Card Repository" />
        <link rel="icon" href="/favicon.ico" />
      </Head>


      {isAdmin ? <> 
                <h1>
                  Import Cards from csv
                </h1>
                <CsvReader />
                </> : null}

       
         

    
        <h1>
          My Cards
        </h1>

        <div className={styles.grid}>
        
          {cards.map(({ _id, cardText, createdBy, createdByName,lastModified, createdOn, category, cardUsers, source, ownedBy, url }) => (
            <div className={styles.card} key={_id}>
              { createdBy===session.user.email || isAdmin ?
              <a href={"/cards/cardEdit?id="+_id} >
                {cardText}
                <br />
                {createdOn ?  'Created On: ' + createdOn : ''}
                {createdOn ? <br /> : ''}
                {lastModified}
                {lastModified ? <br /> : ''}
              </a>
              :
                <div>
                {cardText}
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
               <button onClick={() => removeCard(_id,session.user.email, ownedBy,cardText, category, cardUsers, source, url)}> DisOwn Card</button>
               { session.user.email===process.env.NEXT_PUBLIC_EMAIL_ADMIN && 
                <button onClick={() => deleteCard(_id)}> Delete Card</button>}
             </div>
            ))}
        </div>
        
      </Layout>
    
  )
}
