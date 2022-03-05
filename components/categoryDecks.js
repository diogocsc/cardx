
import styles from '../styles/Home.module.css'

    export default async function CategoryDecks({categoryName}){

    const deckList = await fetch("/api/categories/"+categoryName);

    return(
    <div className={styles.categoryLine}>
  
      {deckList.map(({ _id, name, description, url }) => (
        <div className={styles.card} key={_id} >
          <a href={"/decks/"+_id} >
            {url && <img src={url} class={styles.deck} /> }
            {name}<br /> 
            {description}
          </a>
         </div>
        ))}
       
    </div>)
  
  }