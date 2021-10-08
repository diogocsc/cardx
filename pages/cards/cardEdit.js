
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
        <label className={utilStyles.input_label} htmlFor="cardText">Card Text</label>

        <div className={utilStyles.input}>

          <textarea className={utilStyles.input_field} cols="30" rows="3" id="cardText" name="cardText" type="text" defaultValue={card.cardText} required />
         </div>
         <label className={utilStyles.input_label} htmlFor="cardUsers">To whom is this card designed for?</label>

         <div className={utilStyles.input}>

          <textarea className={utilStyles.input_field} cols="30" rows="3" id="cardUsers" name="cardUsers" type="text" defaultValue={card.cardUsers} />

          </div>
          <label className={utilStyles.input_label} htmlFor="source">Where have you found inspiration to create this card?</label>

          <div className={utilStyles.input}>

           <textarea className={utilStyles.input_field} cols="30" rows="3" id="source" name="source" type="text" defaultValue={card.source} />
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
  