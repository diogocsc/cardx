import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import utilStyles from '../styles/utils.module.css'

// Import the dependency.
import clientPromise from '../mongodb-client';

export async function getStaticProps() {
  const client = await clientPromise;
  const collection = await client.db().collection('cards');
  const cards = await collection.find({}).toArray();
  const allCards = JSON.parse(JSON.stringify(cards));
  return {
    props: {
      allCards
    }
  }
}



export default function Home({allCards}) {
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
          Full List
        </p>

        <div className={styles.grid}>
        
          {allCards.map(({ _id, cardText, lastModified }) => (
              <a
              href={"https://cardsapi.vercel.app/api/cards/"+_id}
              className={styles.card}
            >
                {cardText}
                <br />
                {_id}
                <br />
                {lastModified}
                </a>
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
