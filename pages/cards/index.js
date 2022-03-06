import Link from 'next/link'
import Head from 'next/head'
import styles from '../../styles/Home.module.css'
import { useState } from 'react'
import Layout from '../../components/layout'
import { useSession, getSession } from 'next-auth/client'
import AccessDenied from '../../components/access-denied'



// Import the dependency.
import clientPromise from '../../mongodb-client';

async function fetchCardsFromDB(session) {

  const client = await clientPromise;
  const collection = await client.db().collection('cards');
  let mySort= {createdOn:-1, lastModified: -1, cardText: 1};
  const cards= await collection.find({ownedBy:{$ne: session.user.email}}).sort(mySort).toArray();
  const cardList = JSON.parse(JSON.stringify(cards));
  return cardList;
}

export async function getServerSideProps(context) {
  const session = await getSession(context);
  const cardList = session ? await fetchCardsFromDB(session): '';  

return {
    props: {
      cardList,
    }
  }
}

export default function Home({cardList}) {
  const [ session, loading ] = useSession();
  const [cards, setCards] = useState(cardList);

  const fetchCards = async () => {
    const res = await fetch('/api/cards')
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
    fetchCards();
    }
  }

  const ownCard = async (cardId, email, ownedBy, cardText, category, cardUsers, source, url) => {
    if (ownedBy) {
     ownedBy.push(email);
    }
    else ownedBy=[email];

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
    fetchCards();
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


        <h1 className={styles.title}>
          Others Cards
        </h1>

        <p className={styles.description}>
        
          <Link href="/">
            <a>My Cards</a>
          </Link>
          { } | { }
          <Link href="/cards/cardEdit">
            <a>Create Card</a>
          </Link>
        </p>

        <div className={styles.grid}>
        
          {cards.map(({ _id, cardText, createdOn, lastModified, createdBy, createdByName, ownedBy,category, cardUsers, source,url }) => (
            <div className={styles.card} key={_id} >
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
                <button onClick={() => ownCard(_id,session.user.email, ownedBy,cardText, category, cardUsers, source, url)}> Own Card</button>
                <br />
              { session.user.email===process.env.NEXT_PUBLIC_EMAIL_ADMIN && 
                <button onClick={() => deleteCard(_id)}> Delete Card</button>}
             </div>
            ))}
           
        </div>

      </Layout>
    
  )
}
