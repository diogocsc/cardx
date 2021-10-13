import Link from 'next/link'
import Head from 'next/head'
import styles from '../../styles/Home.module.css'
import { useState } from 'react'
import Layout from '../../components/layout'
import { useSession, getSession } from 'next-auth/client'
import AccessDenied from '../../components/access-denied'



// Import the dependency.
import clientPromise from '../../mongodb-client';

async function fetchDecksFromDB(session) {

  const client = await clientPromise;
  const collection = await client.db().collection('decks');
  let mySort= {createdOn:-1, lastModified: -1, name: 1};
  const decks= await collection.find({ownedBy:{$ne: session.user.email}}).sort(mySort).toArray();
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

export default function Home({deckList}) {
  const [ session, loading ] = useSession();
  const [decks, setDecks] = useState(deckList);

  const fetchDecks = async () => {
    const res = await fetch('/api/decks')
    const data = await res.json()
    if (!data) {
      return {
        notFound: true,
      }
    }
    setDecks(data)
  }

  const deleteDeck = async deckId => {
    if (confirm("This will permanently delete the deck for all users. Do you really want to delete this deck? ")) {
    const res = await fetch('/api/decks/'+deckId, {
      method: 'DELETE'
    })
    fetchDecks();
  }
  }

  const ownDeck = async (deckId, email, ownedBy, name, description) => {
    if (ownedBy) {
     ownedBy.push(email);
    }
    else ownedBy=[email];

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
    fetchDecks();
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
        <title>CardX - Decks</title>
        <meta name="description" content="List of Decks" />
        <link rel="icon" href="/favicon.ico" />
      </Head>


        <h1 className={styles.title}>
          Others Decks
        </h1>

        <p className={styles.description}>
        
          <Link href="/">
            <a>Home</a>
          </Link>
          { } | { }
          <Link href="/decks/deckEdit">
            <a>Create Deck</a>
          </Link>
        </p>

        <div className={styles.grid}>
        
          {decks.map(({ _id, name, createdOn, lastModified, createdBy, createdByName, ownedBy,description }) => (
            <div className={styles.deck} key={_id} >
              { createdBy===session.user.email || isAdmin ?
              <a href={"/decks/deckEdit?id="+_id} >
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
              {createdBy && <a href={"/decks/"+btoa(unescape(encodeURIComponent(createdBy)))+"?name="+createdByName}>
              Created By: {createdByName}</a>}
                {createdBy &&  <br /> }
                <button onClick={() => ownDeck(_id,session.user.email, ownedBy,name, description)}> Own Deck</button>
              { session.user.email===process.env.NEXT_PUBLIC_EMAIL_ADMIN && 
                <button onClick={() => deleteDeck(_id)}> Delete Deck</button>}
             </div>
            ))}
           
        </div>

      </Layout>
    
  )
}
