import Link from 'next/link'
import Head from 'next/head'
import styles from '../../styles/Home.module.css'
import { useState } from 'react'
import Layout from '../../components/layout'
import { useSession } from 'next-auth/client'
import AccessDenied from '../../components/access-denied'

"uee strict";

// Import the dependency.
import clientPromise from '../../mongodb-client';

async function fetchCardsFromDB(context) {
  const email=Buffer.from(context.query.email, 'base64').toString();
  const client = await clientPromise;
  const collection = await client.db().collection('cards');
  let mySort= {createdOn:-1, lastModified: -1, cardText: 1};
  const cards= await collection.find({createdBy:email}).sort(mySort).toArray();
  const cardList = JSON.parse(JSON.stringify(cards));
  return cardList;
}

export async function getServerSideProps(context) {
const cardList = await fetchCardsFromDB(context);
const email= context.query.email;
const name= context.query.name;

return {
    props: {
      cardList,
      email,
      name,
    }
  }
}

export default function Home({cardList, email,name}) {
  const [ session, loading ] = useSession();
  const [cards, setCards] = useState(cardList);

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

  const deleteCard = async (cardId,createdBy) => {
    const res = await fetch('/api/cards/'+cardId, {
      method: 'DELETE'
    })

    fetchCards('/api/cards/user/'+btoa(unescape(encodeURIComponent(createdBy))));
  }

  const ownCard = async (cardId, email, ownedBy, cardText, category, cardUsers, source, createdBy) => {
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
        }),
        headers: {
          'Content-Type': 'application/json'
        },
        method: 'PATCH'
      }
    )
    alert("Card Owned")
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
        <title>CardX - {name}</title>
        <meta name="description" content="A Card Repository" />
        <link rel="icon" href="/favicon.ico" />
      </Head>


        <h1>
         Cards created by {name} 
        </h1>

        <p className={styles.description}>
          <Link href="/cards/cardEdit">
            <a>Create Card</a>
          </Link>
          { } | { }
          <Link href="/">
            <a>My Cards</a>
          </Link>
        </p>

        <div className={styles.grid}>
        
          {cards.map(({ _id, cardText, createdOn, lastModified, createdBy, createdByName,ownedBy, category, cardUsers, source }) => (
            <div className={styles.card} key={_id}>
             { createdBy===session.user.email || isAdmin ?
              <a href={"/cards/cardEdit?id="+_id} >
                {cardText}
                <br />
                {createdBy && 'Created By: '+createdByName }
                {createdBy &&  <br /> }
                {createdOn ?  'Created On: ' + createdOn : ''}
                {createdOn ? <br /> : ''}
                {lastModified}
                {lastModified ? <br /> : ''}
              </a>
              :
                <div>
                {cardText}
                <br />
                {createdBy && 'Created By: '+createdByName }
                {createdBy &&  <br /> }
                {createdOn ?  'Created On: ' + createdOn : ''}
                {createdOn ? <br /> : ''}
                {lastModified}
                {lastModified ? <br /> : ''}
                </div>
              }
               <button onClick={() => ownCard(_id,session.user.email, ownedBy,cardText, category, cardUsers, source)}> Own Card</button>

              { session.user.email===process.env.NEXT_PUBLIC_EMAIL_ADMIN && 
                <button onClick={() => deleteCard(_id)}> Delete Card</button>}
             </div>
            ))}
        </div>

      </Layout>
    
  )
}
