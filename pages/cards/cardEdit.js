
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'


export default function Form() {
    const router = useRouter()
    const cardId = router.query.id
    const submitCard = async event => {
      event.preventDefault()
      const res = cardId ? await fetch(
        '/api/cards/'+cardId,
        {
          body: JSON.stringify({
            cardText: event.target.cardText.value
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
            cardText: event.target.cardText.value
          }),
          headers: {
            'Content-Type': 'application/json'
          },
          method: 'POST'
        }
      )
  /*    try {
        const result = await res.json()
        
    } catch(err){
        console.log(JSON.stringify(res))
        console.log('Error '+ err);
    } */
      // result.user => 'Ada Lovelace'
    } 

    const [cardText, setCardText] = useState('');

    const fetchCard = async () => {
      const res = await fetch('/api/cards/'+cardId)
      const card = await res.json()
      setCardText(card.cardText);
      
    }

    useEffect( () => {
      cardId ? fetchCard() : ''
    }, [cardId])
  
    return (
      <form onSubmit={submitCard}>
        <label htmlFor="cardText">Card Text</label>
        <br />
        <textarea id="cardText" name="cardText" type="text" defaultValue={cardText} required />
        <br />
        <button type="submit">Submit</button>
        <br />
        <Link href="/">
            <a>Back home!</a>
        </Link>
      </form>
    
    )
  }
  