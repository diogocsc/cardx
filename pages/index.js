import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { useState } from 'react'
import Layout from '../components/layout'
import { useSession, getSession } from 'next-auth/client'
import AccessDenied from '../components/access-denied'
import React from "react";
import useSWR from 'swr'


"use strict";

// Import the dependency.
import clientPromise from '../mongodb-client';

/*import dynamic from 'next/dynamic'

const CategoryDecks = dynamic(() => import('../components/categoryDecks'))
*/
async function fetchCategoriesFromDB(context, session) {
  const client = await clientPromise;
  const collection = await client.db().collection('categories');
  let mySort= {name: 1};
  const categories= await collection.find().sort(mySort).toArray();
  const categoryList = JSON.parse(JSON.stringify(categories));
  return categoryList;
}


export async function getServerSideProps(context) {
const session = await getSession(context);
const categoryList = session ? await fetchCategoriesFromDB(session): '';

return {
    props: {
      categoryList,
    }
  }
}


const fetcher = (...args) => fetch(...args).then((res) => res.json())

function CategoryDecks({categoryName}) {
  const { data, error } = useSWR('/api/categories/'+categoryName+'/decks', fetcher)

  if (error) return <div>Failed to load</div>
  if (!data) return <div>Loading...</div>

  return (
    <div className={styles.categoryLine}>
  
    {data.map(({ _id, name, url }) => (
      <div className={styles.card} key={name} >
        <a href={"/decks/"+_id} >
          {url && <img src={url} className={styles.deck} /> }
          {name} 
        </a>
       </div>
      ))}
     
  </div>
  )
}


export default function Home({cardList, deckList,categoryList}) {
  const [ session, loading ] = useSession();
  const [categories, setCategories] = useState(categoryList);

  // When rendering client side don't display anything until loading is complete
  if (typeof window !== 'undefined' && loading) return null

  // If no session exists, display access denied message
  if (!session) { return  <Layout><AccessDenied/></Layout> }

  // If session exists, display content
  const isAdmin = session.user.email === process.env.NEXT_PUBLIC_EMAIL_ADMIN;

  return (
    <Layout>

      <Head>
        <title>CardX</title>
        <meta name="description" content="A Card Repository" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1>
        Choose a Deck
      </h1>
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
