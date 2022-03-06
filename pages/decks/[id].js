import Link from 'next/link'
import Head from 'next/head'
import styles from '../../styles/Decks.module.css'
import { useState } from 'react'
import Layout from '../../components/layout'
import { useUser, withPageAuthRequired, getSession } from '@auth0/nextjs-auth0';
import AccessDenied from '../../components/access-denied'
import { ObjectId } from "mongodb";
import { CSVLink } from "react-csv";

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

async function fetchCardsToDownloadFromDB(context) {
  const client = await clientPromise;
  const collection = await client.db().collection('cards');
  let mySort= {cardText: 1};
  const cards= await collection.find({decks:context.query.id},{projection: {cardText: 1, url:1, category:1, source:1,cardUsers:1, decks:1, _id:0}}).sort(mySort).toArray();
  const cardDownloadList = JSON.parse(JSON.stringify(cards));
  return cardDownloadList;
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

export const getServerSideProps=withPageAuthRequired({
  async getServerSideProps(context) {
    const session = getSession(context.req, context.res);
    const cardList = session ? await fetchCardsFromDB(context): '';
    const deckList = await fetchDeckFromDB(context);
    const cardDownloadList = session ? await fetchCardsToDownloadFromDB(context): '';
    return {
        props: {
          cardList,
          cardDownloadList,
          deckList
        }
      };
    }
})


export default function Home({user,cardList, cardDownloadList, deckList}) {
  const { error, isLoading } = useUser();
  const [cards, setCards] = useState(cardList);
  const [cardsToDownload] = useState(cardDownloadList);

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
    
if (isLoading) return <div>Loading...</div>;
if (error) return <div>{error.message}</div>;
// If no user exists, display access denied message
if (!user) { return  <Layout><AccessDenied/></Layout> }
const isAdmin = user ? user.email === process.env.NEXT_PUBLIC_EMAIL_ADMIN : null;

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

        <CSVLink data={cardsToDownload} separator={";"} filename={deck.name+".csv"}>
           Export to CSV
        </CSVLink>
        <Link href={"/game?deck="+deck.name}>
           Play
        </Link>

        <p className={styles.description}>
          <Link href={"/decks/deckEdit?id="+deck._id}>
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
        
          {cards.map(({ _id, cardText, createdBy, url }) => (
            <div className={styles.card} key={_id}>
              { createdBy===user.email || isAdmin ?
              <a href={"/cards/cardEdit?id="+_id} >
                {url ? 
                  <img src={url} className={styles.deck} /> 
                  :
                  cardText}                
              </a>
              :
                <div>
               {url ? 
                  <img src={url} className={styles.deck} /> 
                  :
                  cardText} 
                
                </div>
              }
              
             </div>
            ))}
        </div>

      </Layout>
    
  )
}
