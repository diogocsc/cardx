
import Link from 'next/link'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import utilStyles from '../../styles/utils.module.css'
import styles from '../../styles/Home.module.css'




export default function Form() {
    const router = useRouter()
    const cardId = router.query.id
    const submitCard = async event => {
      event.preventDefault()
      const res = cardId ? await fetch(
        '/api/cards/'+cardId,
        {
          body: JSON.stringify({
            cardText: event.target.cardText.value,
            cardUsers: event.target.cardUsers.value,
            source: event.target.source.value
          }),
          headers: {
            'Content-Type': 'application/json'
          },
          method: 'PATCH'
        }
      ) : await fetch(
        '/api/cards/insertCard',
        {
          body: JSON.stringify({
            cardText: event.target.cardText.value,
            cardUsers: event.target.cardUsers.value,
            source: event.target.source.value
          }),
          headers: {
            'Content-Type': 'application/json'
          },
          method: 'POST'
        }
      )

    } 

    const [card, setCard] = useState('');

    const fetchCard = async () => {
      const res = await fetch('/api/cards/'+cardId)
      const card = await res.json()
      setCard(card);
    }

    useEffect( () => {
      cardId ? fetchCard() : ''
    }, [cardId])
  
    return (
      <div className={styles.container}>
        <Head>
          <title>CardX - {cardId ? 'Edit' : 'New Card'}</title>
          <meta name="description" content="The place to edit or create cards" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <form onSubmit={submitCard}>
          <label htmlFor="cardText">Card Text</label>
          <br />
          <textarea cols="30" rows="5" id="cardText" name="cardText" type="text" defaultValue={card.cardText} required />
          <br />
          <label htmlFor="cardUsers">To whom is this card designed for?</label>
          <br />
          <textarea cols="30" rows="5" id="cardUsers" name="cardUsers" type="text" defaultValue={card.cardUsers} />
          <br />
          <label htmlFor="source">Where have you found inspiration for this card?</label>
          <br />
          <textarea cols="30" rows="5" id="source" name="source" type="text" defaultValue={card.source} />
          <br />
          <button type="submit">Submit</button>
          <br />
          <Link href="/">
              <a>Back home!</a>
          </Link>
        </form>
      </div>
    )
  }
  