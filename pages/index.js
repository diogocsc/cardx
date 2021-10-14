import Link from 'next/link'
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { useState } from 'react'
import Layout from '../components/layout'
import { useSession, getSession } from 'next-auth/client'
import AccessDenied from '../components/access-denied'

"uee strict";

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
const cardList = session ? await fetchCardsFromDB(context, session): '';
const deckList = session ? await fetchDecksFromDB(session): '';


return {
    props: {
      cardList,
      deckList,
    }
  }
}

export default function Home({cardList, deckList}) {
  const [ session, loading ] = useSession();
  const [cards, setCards] = useState(cardList);
  const [decks, setDecks] = useState(deckList);


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



 const removeCard = async (cardId, email, ownedBy, cardText, category, cardUsers, source) => {
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
        }),
        headers: {
          'Content-Type': 'application/json'
        },
        method: 'PATCH'
      }
    )

    fetchCards('/api/cards/my');
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
        <title>CardX</title>
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

        <h1>
          My Cards
        </h1>

        <div className={styles.grid}>
        
          {cards.map(({ _id, cardText, createdBy, createdByName,lastModified, createdOn, category, cardUsers, source, ownedBy }) => (
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
               <button onClick={() => removeCard(_id,session.user.email, ownedBy,cardText, category, cardUsers, source)}> DisOwn Card</button>
             </div>
            ))}
        </div>

      </Layout>
    
  )
}
