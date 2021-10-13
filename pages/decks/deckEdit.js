
import Link from 'next/link'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import utilStyles from '../../styles/utils.module.css'
import styles from '../../styles/Home.module.css'


export default function Form() {

  
    const router = useRouter()
    const deckId = router.query.id
    async function submitDeck(event, ownedBy) {
    event.preventDefault()
    const res = deckId ? await fetch(
      '/api/decks/' + deckId,
      {
        body: JSON.stringify({
          name: event.target.name.value,
          description: event.target.description.value,
          url: event.target.url.value,
          ownedBy: ownedBy,
        }),
        headers: {
          'Content-Type': 'application/json'
        },
        method: 'PATCH'
      }
    ) : await fetch(
      '/api/decks/insertDeck',
      {
        body: JSON.stringify({
          name: event.target.name.value,
          description: event.target.description.value,
          url: event.target.url.value,
        }),
        headers: {
          'Content-Type': 'application/json'
        },
        method: 'POST'
      }
    )
    alert("Deck Submitted")

  } 

    const [deck, setDeck] = useState('');

    const fetchDeck = async () => {
      const res = await fetch('/api/decks/'+deckId)
      const deck = await res.json()
      setDeck(deck);
    }

    useEffect( () => {
      deckId ? fetchDeck() : ''
    }, [deckId])
  

    return (
      <div className={styles.container}>
        <Head>
          <title>deckX - {deckId ? 'Edit' : 'New deck'}</title>
          <meta name="description" content="The place to edit or create decks" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <form onSubmit={(event) => submitDeck(event, deck.ownedBy)}>
        <label className={utilStyles.input_label} htmlFor="name">Deck name</label>
        <div className={utilStyles.input}>
          <input className={utilStyles.input_field} id="name" name="name" type="text" defaultValue={deck.name} required />
        </div>
        <label className={utilStyles.input_label} htmlFor="description">What is this deck all about?</label>
        <div className={utilStyles.input}>
          <textarea className={utilStyles.input_field} cols="30" rows="3" id="description" name="description" type="text" defaultValue={deck.description} />
        </div>
        <label className={utilStyles.input_label} htmlFor="url">deck Image URL</label>
        <div className={utilStyles.input}>
          <input className={utilStyles.input_field} id="url" name="url" type="text" defaultValue={deck.url} />
        </div>
        <button className={utilStyles.card_button} type="submit">Submit</button>
        <br />
        <Link href="/">
            <a>Back home!</a>
        </Link>
      </form>
    </div>
    )
  }
  