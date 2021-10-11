import Link from 'next/link'
import Head from 'next/head'
import styles from '../../styles/Home.module.css'
import { useState } from 'react'
import Layout from '../../components/layout'
import { useSession } from 'next-auth/client'
import AccessDenied from '../../components/access-denied'



// Import the dependency.
import clientPromise from '../../mongodb-client';

async function fetchCardsFromDB() {

  const client = await clientPromise;
  const collection = await client.db().collection('cards');
  let mySort= {createdOn:-1, lastModified: -1, cardText: 1};
  const cards= await collection.find().sort(mySort).toArray();
  const cardList = JSON.parse(JSON.stringify(cards));
  return cardList;
}

export async function getServerSideProps(context) {

const cardList = await fetchCardsFromDB();

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
        <title>CardX</title>
        <meta name="description" content="A Card Repository" />
        <link rel="icon" href="/favicon.ico" />
      </Head>


        <h1 className={styles.title}>
          Cards
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
        
          {cards.map(({ _id, cardText, createdOn, lastModified, createdBy, createdByName }) => (
            <div className={styles.card} key={_id}
            >
              <a
              href={"/cards/cardEdit?id="+_id}
              >
                {cardText}
                <br />
                {createdOn ?  'Created On: ' + createdOn : ''}
                {createdOn ? <br /> : ''}
                {lastModified}
                {lastModified ? <br /> : ''}
              </a>
              {createdBy && <a href={"/cards/"+btoa(unescape(encodeURIComponent(createdBy)))+"?name="+createdByName}>
              Created By: {createdByName}</a>}
                {createdBy &&  <br /> }
              { session.user.email===process.env.NEXT_PUBLIC_EMAIL_ADMIN && 
                <button onClick={() => deleteCard(_id)}> Delete Card</button>}
             </div>
            ))}
            <a href="https://nextjs.org/docs" className={styles.card}>
            <h2>Documentation &rarr;</h2>
            <p>Find in-depth information about Next.js features and API.</p>
          </a>

          <a href="https://nextjs.org/learn" className={styles.card}>
            <h2>Learn &rarr;</h2>
            <p>Learn about Next.js in an interactive course with quizzes!</p>
          </a>

          <a
            href="https://github.com/vercel/next.js/tree/master/examples"
            className={styles.card}
          >
            <h2>Examples &rarr;</h2>
            <p>Discover and deploy boilerplate example Next.js projects.</p>
          </a>

          <a
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            className={styles.card}
          >
            <h2>Deploy &rarr;</h2>
            <p>
              Instantly deploy your Next.js site to a public URL with Vercel.
            </p>
          </a>
        </div>

      </Layout>
    
  )
}
