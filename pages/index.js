import Head from 'next/head'
import Link from 'next/link'
import styles from '../styles/Home.module.css'
import { useState } from 'react'
import Layout from '../components/layout'
import { useUser } from '@auth0/nextjs-auth0';
import AccessDenied from '../components/access-denied'
import React from "react";
import useSWR from 'swr'


"use strict";

// Import the dependency.
import clientPromise from '../mongodb-client';

/*import dynamic from 'next/dynamic'

const CategoryDecks = dynamic(() => import('../components/categoryDecks'))
*/
async function fetchCategoriesFromDB() {
  const client = await clientPromise;
  const collection = await client.db().collection('categories');
  let mySort= {order:1, name: 1};
  const categories= await collection.find().sort(mySort).toArray();
  const categoryList = JSON.parse(JSON.stringify(categories));
  return categoryList;
}


export async function getServerSideProps() {
const categoryList = await fetchCategoriesFromDB();

return {
    props: {
      categoryList,
    }
  }
}


const fetcher1 = (...args) => fetch(...args).then((res) => res.json())

function DeckCardsCount({deckId}) {
  const { data:countCards, error } = useSWR('/api/decks/'+deckId+'/countCards', fetcher1)

  if (error) return <div>Failed to load</div>
  if (!countCards) return <div>Loading...</div>

  return (
    <div className={styles.cardsCount}>
        {countCards+' Cards'} 
  </div>
  )
}



const fetcher = (...args) => fetch(...args).then((res) => res.json())

function CategoryDecks({categoryName}) {
  const { data, error } = useSWR('/api/categories/'+categoryName+'/decks', fetcher)

  if (error) return <div>Failed to load</div>
  if (!data) return <div>Loading...</div>

  function getFirstLastName(fullName){

    let name=fullName.split(" ");
    return name[0]+" "+name[name.length-1];

  }

  

  return (
    <div className={styles.categoryLine}>
  
    {data.map(({ _id, name, url, createdByName, description,cardsCount }) => (
      <div className={styles.card} key={name} >
        <a href={"/decks/"+_id} >
        {url && <img src={url} className={styles.deckImage} /> }     
          {name} 
          <DeckCardsCount deckId={_id} />       
        </a>
        <div className={styles.description}>{description}</div>
        <div className={styles.createdBy}><strong>Created by:</strong> <br/>{getFirstLastName(createdByName)}</div>
        <Link  href={"/game?deck="+name}>
          <a className={styles.button}>
            Play 
          </a>
        </Link>
       </div>
      ))}
     
  </div>
  )
}



export default function Home({categoryList}) {
  
  const { user, error, isLoading } = useUser();
  const [categories, setCategories] = useState(categoryList);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;
  if (!user) { return  <Layout><AccessDenied/></Layout> }


  return (
    <Layout activeMenu='Home'>

      <Head>
        <title>CardX</title>
        <meta name="description" content="A Card Repository" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div>   
        {categories.map(({_id, name, url }) => (
          <>
          <div className={styles.categoryHeader} key={name} >      
              {url && <img src={url} className={styles.category} /> }
              {name}
           </div>
          <CategoryDecks categoryName={name} />       
          </>
          ))}
         
      </div>
        
      </Layout>
    
  )
}
