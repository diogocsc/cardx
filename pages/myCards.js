import Link from 'next/link'
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { useState, useEffect } from 'react'
import Layout from '../components/layout'
import { useUser, withPageAuthRequired, getSession } from '@auth0/nextjs-auth0';
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

export const getServerSideProps=withPageAuthRequired({
  async getServerSideProps(context) {
    const session = getSession(context.req, context.res);
    const cardList = session ? await fetchCardsFromDB(context, session): '';
    return {
        props: {
          cardList,
        }
      };
    }
})


export default function Home({user, cardList}) {
  const { error, isLoading } = useUser();
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
 
if (isLoading) return <div>Loading...</div>;
if (error) return <div>{error.message}</div>;
// If no user exists, display access denied message
if (!user) { return  <Layout><AccessDenied/></Layout> }
const isAdmin = user ? user.email === process.env.NEXT_PUBLIC_EMAIL_ADMIN : null;

  return (
    <Layout activeMenu='myCards'>

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
        <Link href="/cards/cardEdit"><a>New Card</a></Link>

        <div className={styles.grid}>
        
          {cards.map(({ _id, cardText, createdBy, createdByName,lastModified, createdOn, category, cardUsers, source, ownedBy, url }) => (
            <div className={styles.card} key={_id}>
              { createdBy===user.email || isAdmin ?
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
               <button onClick={() => removeCard(_id,user.email, ownedBy,cardText, category, cardUsers, source, url)}> DisOwn Card</button>
               { isAdmin && 
                <button onClick={() => deleteCard(_id)}> Delete Card</button>}
             </div>
            ))}
        </div>
        
      </Layout>
    
  )
}
