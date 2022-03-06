
import Link from 'next/link'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import utilStyles from '../../styles/utils.module.css'
import styles from '../../styles/Home.module.css'
import { useUser, withPageAuthRequired, getSession } from '@auth0/nextjs-auth0';
import Layout from '../../components/layout'
import AccessDenied from '../../components/access-denied'

// Import the dependency.
import clientPromise from '../../mongodb-client';
import { ObjectId } from 'bson'

async function fetchDecksFromDB(context) {

  const client = await clientPromise;
  const coldecks = await client.db().collection('decks');
  const colcards = await client.db().collection('cards');
  const card = await colcards.find({_id:ObjectId(context.query.id)}).toArray();
  const cardList = JSON.parse(JSON.stringify(card));
  let cardDecks = cardList[0] && cardList[0].decks ? cardList[0].decks : [];
  cardDecks.map ? cardDecks= cardDecks.map( x  => ObjectId(x)) : '';
  let mySort= {createdOn:-1, lastModified: -1, name: 1};
  const decks= await coldecks.find({_id : {$in : cardDecks}}).sort(mySort).toArray();
  const deckList = JSON.parse(JSON.stringify(decks));
  return deckList;
}

async function fetchOtherDecksFromDB(context) {

  const client = await clientPromise;
  const coldecks = await client.db().collection('decks');
  const colcards = await client.db().collection('cards');
  const card = await colcards.find({_id:ObjectId(context.query.id)}).toArray();
  const cardList = JSON.parse(JSON.stringify(card));
  let cardDecks = cardList[0] && cardList[0].decks ? cardList[0].decks : [];
  cardDecks ? cardDecks= cardDecks.map( x  => ObjectId(x)) : '';
  let mySort= {createdOn:-1, lastModified: -1, name: 1};
  const decks= await coldecks.find({_id : {$nin : cardDecks}}).sort(mySort).toArray();
  const deckList = JSON.parse(JSON.stringify(decks));
  return deckList;
}




export const getServerSideProps=withPageAuthRequired({
  async getServerSideProps(context) {
    // access the user session
    const session = getSession(context.req, context.res);
    const deckList = session ? await fetchDecksFromDB(context): '';  
    const otherDeckList = session ? await fetchOtherDecksFromDB(context): '';  
    return { props: {  
              deckList,
               otherDeckList, 
            } 
          };
  }
});

export default function Form({user,deckList,otherDeckList}) {
  const { error, isLoading } = useUser();

    const router = useRouter()
    const cardId = router.query.id
    const [decks, setDecks] = useState(deckList);
    const [otherDecks, setOtherDecks] = useState(otherDeckList);
    const [card, setCard] = useState('');


    const fetchDecks = async () => {
      let res = await fetch('/api/cards/'+cardId+'/decks')
      let data = await res.json()
      setDecks(data)
      res = await fetch('/api/cards/'+cardId+'/otherDecks')
      data = await res.json()
      setOtherDecks(data)
    }

    function cardDecks() {

     return( <>
     <h2> Card Decks  </h2>
     <div className={styles.grid}>

       {decks.map(({ _id, name, description, createdBy, createdByName }) => (
         <div className={styles.deck} key={_id}>
           {createdBy === user.email || isAdmin ?
             <a href={"/decks/deckEdit?id=" + _id}>
               {name} <br />
               {description}
             </a>
             :
             <div>
               {name} <br />
               {description}
             </div>}
           <br />
           {createdBy && <a href={"/decks/" + btoa(unescape(encodeURIComponent(createdBy))) + "?name=" + createdByName}>
             Created By: {createdByName}</a>}
           {createdBy && <br />}
           <button onClick={() => removeDeckFromCard(_id)}> Remove Deck from Card</button>
         </div>
       ))}

     </div></>)

    }

    function otherCardDecks(){
      return(<>
      <h2> Other Decks  </h2>
      <div className={styles.grid}>
      
        {otherDecks.map(({ _id, name, createdBy, createdByName,description }) => (
          <div className={styles.deck} key={_id} >
            { createdBy===user.email || isAdmin ?
            <a href={"/decks/deckEdit?id="+_id} >
              {name}<br /> 
              {description}
            </a>
            :
              <div>
              {name}<br /> 
              {description}
              </div>
            }
            <br /> 
            {createdBy && <a href={"/decks/"+btoa(unescape(encodeURIComponent(createdBy)))+"?name="+createdByName}>
            Created By: {createdByName}</a>}
              {createdBy &&  <br /> }
              <button onClick={() => addDeckToCard(_id)}> Add Deck to Card</button>
           </div>
          ))}
         
      </div> </>)



    }

    async function updateCardDecks(decks){

      await fetch(
        '/api/cards/' + cardId,
        {
          body: JSON.stringify({
            cardText: card.cardText,
            category: card.category,
            cardUsers: card.cardUsers,
            source: card.source,
            url: card.url,
            ownedBy: card.ownedBy,
            decks: decks,
          }),
          headers: {
            'Content-Type': 'application/json'
          },
          method: 'PATCH'
        }
      )
    }

    async function addDeckToCard(newDeckId) {
      let newDecks = [newDeckId]
      if (card.decks) {
        card.decks.push(newDeckId);
        newDecks = card.decks;
      }
      await updateCardDecks(newDecks)
      fetchDecks()
  
    } 

    async function removeDeckFromCard(deckId) {
      let newDecks = []
      if (card.decks) {
        const index = card.decks.indexOf(deckId);
        card.decks.splice(index,1);
        newDecks = card.decks;
      }
      await updateCardDecks(newDecks)
      fetchDecks()
  
    } 


    async function submitCard(event, ownedBy, decksIn = [ObjectId(router.query.deckId)]) {
    event.preventDefault()
    const res = cardId ? await fetch(
      '/api/cards/' + cardId,
      {
        body: JSON.stringify({
          cardText: event.target.cardText.value,
          category: event.target.category.value,
          cardUsers: event.target.cardUsers.value,
          source: event.target.source.value,
          url: event.target.uri.value,
          ownedBy: ownedBy,
          decks: decksIn,
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
          category: event.target.category.value,
          cardUsers: event.target.cardUsers.value,
          source: event.target.source.value,
          url: event.target.uri.value,
          decks: decksIn,
        }),
        headers: {
          'Content-Type': 'application/json'
        },
        method: 'POST'
      }
    )
    alert("Card Submitted")

  } 


    const fetchCard = async () => {
      const res = await fetch('/api/cards/'+cardId)
      const card = await res.json()
      setCard(card);
 //     setSelected(card.category);
    }

    useEffect( () => {
      cardId ? fetchCard() : ''
    }, [cardId])
  

/*    const [selected, setSelected] = useState(card.category);

    function handleChange(event) {  setSelected(event.target.value);  }

        <select name="category" id="category-select" value={selected} onChange={(event) => handleChange(event)}>
            <option value="">--Please choose an option--</option>
            <option value="Q">Quebra-Gelo</option>
            <option value="P">Profunda</option>
            <option value="D">Divertida</option>
        </select>
*/
  
if (isLoading) return <div>Loading...</div>;
if (error) return <div>{error.message}</div>;
// If no user exists, display access denied message
if (!user) { return  <Layout><AccessDenied/></Layout> }
const isAdmin = user ? user.email === process.env.NEXT_PUBLIC_EMAIL_ADMIN : null;

    return (
      <Layout>
      <div className={styles.container}>
        <Head>
          <title>CardX - {cardId ? 'Edit' : 'New Card'}</title>
          <meta name="description" content="The place to edit or create cards" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <form onSubmit={(event) => submitCard(event, card.ownedBy, card.decks)}>
        <label className={utilStyles.input_label} htmlFor="cardText">Card Text</label>
        <div className={utilStyles.input}>
          <textarea className={utilStyles.input_field} cols="30" rows="3" id="cardText" name="cardText" type="text" defaultValue={card.cardText} required />
        </div>
        <label className={utilStyles.input_label} htmlFor="uri">Card Image URL</label>
        <div className={utilStyles.input}>
          <input className={utilStyles.input_field} id="uri" name="uri" type="text" defaultValue={card.url} />
        </div>
        <label className={utilStyles.input_label} htmlFor="category">What is the card category?</label>
        <div className={utilStyles.input}>
          <input placeholder="Example: P, Q, D" className={utilStyles.input_field} id="category" name="url" type="text" defaultValue={card.category} />
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

      </form>
      <br />
      <Link href="/">
            <a>Back home!</a>
        </Link>

        {cardId && cardDecks()}
        {cardId && otherCardDecks()}

    </div>
    </Layout>
    )
  }
  