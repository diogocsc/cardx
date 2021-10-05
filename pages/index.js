import Link from 'next/link'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { useState } from 'react'

// Import the dependency.
import clientPromise from '../mongodb-client';

async function fetchCardsFromDB() {

  const client = await clientPromise;
  const collection = await client.db().collection('cards');
  const cards= await collection.find({}).toArray();
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
/*    try {
      const data = await res.json()
      
  } catch(err){
      console.log('stringify: '+JSON.stringify(res))
      console.log('Error '+ err);
  } */
    fetchCards();
  }
  return (
    <div className={styles.container}>
      <Head>
        <title>CardX</title>
        <meta name="description" content="A Card Repository" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Cards
        </h1>

        <p className={styles.description}>
          Full List {' '}
          <Link href="/cards/cardEdit">
            <a>Create Card</a>
          </Link>
        </p>

        <div className={styles.grid}>
        
          {cards.map(({ _id, cardText, lastModified }) => (
            <div className={styles.card} key={_id}
            >
              <a
              href={"/cards/cardEdit?id="+_id}
              >
                {cardText}
                <br />
                {_id}
                <br />
                {lastModified}
                {lastModified ? <br /> : ''}
              </a>
              <button onClick={() => deleteCard(_id)}> Delete Card</button>
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
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  )
}
