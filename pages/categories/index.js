import Link from 'next/link'
import Head from 'next/head'
import styles from '../../styles/Home.module.css'
import { useState } from 'react'
import Layout from '../../components/layout'
import { useSession, getSession } from 'next-auth/client'
import AccessDenied from '../../components/access-denied'


// Import the dependency.
import clientPromise from '../../mongodb-client';

async function fetchCategoriesFromDB(session) {

  const client = await clientPromise;
  const collection = await client.db().collection('categories');
  let mySort= {createdOn:-1, lastModified: -1, name: 1};
  const categories= await collection.find({ownedBy:{$ne: session.user.email}}).sort(mySort).toArray();
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

export default function Home({categoryList}) {
  const [ session, loading ] = useSession();
  const [categories, setCategories] = useState(categoryList);

  const fetchCategories = async () => {
    const res = await fetch('/api/categories')
    const data = await res.json()
    if (!data) {
      return {
        notFound: true,
      }
    }
    setCategories(data)
  }

  const deleteCategory = async categoryId => {
    if (confirm("This will permanently delete the category for all users. Do you really want to delete this category? ")) {
    const res = await fetch('/api/categories/'+categoryId, {
      method: 'DELETE'
    })
    fetchCategories();
  }
  }

  const ownCategory = async (categoryId, email, ownedBy, name, description) => {
    if (ownedBy) {
     ownedBy.push(email);
    }
    else ownedBy=[email];

    const res = await fetch(
      '/api/categories/'+categoryId,
      {
        body: JSON.stringify({
          name: name,
          description: description,
          ownedBy: ownedBy,
        }),
        headers: {
          'Content-Type': 'application/json'
        },
        method: 'PATCH'
      }
    )
    fetchCategories();
  }

  
  // When rendering client side don't display anything until loading is complete
  if (typeof window !== 'undefined' && loading) return null

  // If no session exists, display access denied message
  if (!session) { return  <Layout><AccessDenied/></Layout> }

  // If session exists, display content

  const isAdmin = session.user.email === process.env.NEXT_PUBLIC_EMAIL_ADMIN;

  return (
    <Layout>

      <Head>
        <title>CardX - Categories</title>
        <meta name="description" content="List of Categories" />
        <link rel="icon" href="/favicon.ico" />
      </Head>


        <h1 className={styles.title}>
          Categories
        </h1>

        <p className={styles.description}>
        
          <Link href="/">
            <a>Home</a>
          </Link>
          { } | { }
          <Link href="/categories/categoryEdit">
            <a>Create Category</a>
          </Link>
        </p>

        <div className={styles.grid}>
        
          {categories.map(({ _id, name,url, createdOn, lastModified, createdBy, createdByName, ownedBy,description }) => (
            <div className={styles.card} key={_id} >
              { createdBy===session.user.email || isAdmin ?
              <>
              <a href={"/categories/categoryEdit?id="+_id} >
              
                {url && <img src={url} class={styles.category} /> }
                {name}
                <br />
                {createdOn ?  'Created On: ' + createdOn : ''}
                {createdOn ? <br /> : ''}
                {lastModified}
                {lastModified ? <br /> : ''}
              </a>
              </>
              :
                <div>
                {name}
                <br />
                {createdOn ?  'Created On: ' + createdOn : ''}
                {createdOn ? <br /> : ''}
                {lastModified}
                {lastModified ? <br /> : ''}
                </div>
              }
              Created By: {createdByName}
                {createdBy &&  <br /> }
              { session.user.email===process.env.NEXT_PUBLIC_EMAIL_ADMIN && 
                <button onClick={() => deleteCategory(_id)}> Delete Category</button>}
             </div>
            ))}
           
        </div>

      </Layout>
    
  )
}
