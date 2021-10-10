import Link from 'next/link'
import Head from 'next/head'
import styles from '../../styles/Home.module.css'
import { useState } from 'react'
import Layout from '../../components/layout'
import { useSession } from 'next-auth/client'
import AccessDenied from '../../components/access-denied'



// Import the dependency.
import clientPromise from '../../mongodb-client';

async function fetchCardsFromDB(context) {

  const client = await clientPromise;
  const collection = await client.db().collection('cards');
  let mySort= {createdOn:-1, lastModified: -1, cardText: 1};
  const cards= await collection.find({createdBy:context.query.email}).sort(mySort).toArray();
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

  const fetchCards = async () => {
    const res = await fetch('/api/cards')
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

    fetchCards();
  }

  
  // When rendering client side don't display anything until loading is complete
  if (typeof window !== 'undefined' && loading) return null

  // If no session exists, display access denied message
  if (!session) { return  <Layout><AccessDenied/></Layout> }


  // If session exists, display content
  return (
    <Layout>

      <Head>
        <title>CardX - {name}</title>
        <meta name="description" content="A Card Repository" />
        <link rel="icon" href="/favicon.ico" />
      </Head>


        <h1>
          {name} Cards
        </h1>

        <p className={styles.description}>
          <Link href="/cards/cardEdit">
            <a>Create Card</a>
          </Link>
          { } | { }
          <Link href="/">
            <a>All Cards</a>
          </Link>
        </p>

        <div className={styles.grid}>
        
          {cards.map(({ _id, cardText, createdOn, lastModified, createdBy, createdByName }) => (
            <div className={styles.card} key={_id}
            >
              <a
              href={"/cards/cardEdit?id="+_id}
              >
                {cardText}
                <br />
                {createdBy && 'Created By: '+createdByName }
                {createdBy &&  <br /> }
                {createdOn ?  'Created On: ' + createdOn : ''}
                {createdOn ? <br /> : ''}
                {lastModified}
                {lastModified ? <br /> : ''}
              </a>
              { session.user.email===process.env.NEXT_PUBLIC_EMAIL_ADMIN && 
                <button onClick={() => deleteCard(_id)}> Delete Card</button>}
             </div>
            ))}
        </div>

      </Layout>
    
  )
}