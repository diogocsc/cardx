import Link from 'next/link'
import Head from 'next/head'
import styles from '../../styles/Home.module.css'
import { useState } from 'react'
import Layout from '../../components/layout'
import { useSession, getSession } from 'next-auth/client'
import AccessDenied from '../../components/access-denied'
import { ObjectId } from "mongodb";


"uee strict";

// Import the dependency.
import clientPromise from '../../mongodb-client';

async function fetchCardsFromDB(context) {
  const client = await clientPromise;
  const collection = await client.db().collection('cards');
  let mySort= {createdOn:-1, lastModified: -1, cardText: 1};
  const cards= await collection.find({decks:context.query.id}).sort(mySort).toArray();
  const cardList = JSON.parse(JSON.stringify(cards));
  return cardList;
}

async function fetchDeckFromDB(context) {
  const client = await clientPromise;
  const collection = await client.db().collection('decks');
  console.log("1 "+context.query.id);
  const deck= await collection.find({_id:ObjectId(context.query.id)}).toArray();
  console.log("2 "+deck);
  const deckList = JSON.parse(JSON.stringify(deck));
  return deckList;
}

export async function getServerSideProps(context) {
const session = await getSession(context);
const cardList = session ? await fetchCardsFromDB(context): '';
const deckList = await fetchDeckFromDB(context);

return {
    props: {
      cardList,
      deckList
    }
  }
}

export default function Home({cardList, deckList}) {
  const [ session, loading ] = useSession();
  const [cards, setCards] = useState(cardList);
  const deck= deckList.length >= 1 ? deckList[0] : [];

  const fetchCards = async (uri) => {
    const res = await fetch(uri)
    console.log(res);
    const data = await res.json()
    if (!data) {
      return {
        notFound: true,
      }
    }
    setCards(data)
  }


  const deleteCard = async cardId => {
    const res = await fetch('/api/cards/'+cardId, {
      method: 'DELETE'
    })

    fetchCards('/api/cards/');
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
        <title>CardX - {deck.name} </title>
        <meta name="description" content="Cards per Deck" />
        <link rel="icon" href="/favicon.ico" />
      </Head>


        <h1>
          Cards for {deck.name}
        </h1>

        <p className={styles.description}>
          <Link href={"/cards/deckEdit?id="+deck._id}>
            <a>Edit Deck</a>
          </Link> { } | { }
          <Link href={"/cards/cardEdit?deckId="+deck._id}>
            <a>Create Card for Deck</a>
          </Link>
          { } | { }
          <Link href="/">
            <a>Home</a>
          </Link>
        </p>

        <div className={styles.grid}>
        
          {cards.map(({ _id, cardText, createdBy, createdByName,lastModified, createdOn, category, cardUsers, source, ownedBy }) => (
            <div className={styles.card} key={_id}>
              { createdBy===session.user.email || isAdmin ?
              <a href={"/cards/cardEdit?id="+_id} >
                {cardText}
                <br />
                {createdOn ?  'Created on: ' + createdOn : ''}
                {createdOn ? <br /> : ''}
                {lastModified && 'Last Modified on: '+ lastModified}
                {lastModified ? <br /> : ''}
              </a>
              :
                <div>
                {cardText}
                <br />
                {createdOn ?  'Created on: ' + createdOn : ''}
                {createdOn ? <br /> : ''}
                {lastModified && 'Last Modified on: '+ lastModified}
                {lastModified ? <br /> : ''}
                </div>
              }
              {createdBy && <a href={"/cards/"+btoa(unescape(encodeURIComponent(createdBy)))+"?name="+createdByName}>
              Created By: {createdByName}</a>}
                {createdBy &&  <br /> }
             </div>
            ))}
        </div>

      </Layout>
    
  )
}
