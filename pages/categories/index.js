import Link from 'next/link'
import Head from 'next/head'
import styles from '../../styles/Home.module.css'
import { useState } from 'react'
import Layout from '../../components/layout'
import { useUser, withPageAuthRequired, getSession } from '@auth0/nextjs-auth0';
import AccessDenied from '../../components/access-denied'


// Import the dependency.
import clientPromise from '../../mongodb-client';

async function fetchCategoriesFromDB(session) {

  const client = await clientPromise;
  const collection = await client.db().collection('categories');
  let mySort= {order:1, createdOn:-1, lastModified: -1, name: 1};
  const categories= await collection.find({ownedBy:{$ne: session.user.email}}).sort(mySort).toArray();
  const categoryList = JSON.parse(JSON.stringify(categories));
  return categoryList;
}

export const getServerSideProps=withPageAuthRequired({
  async getServerSideProps(context) {
    const session = getSession(context.req, context.res);
    const categoryList = session ? await fetchCategoriesFromDB(session): '';  

    return {
        props: {
          categoryList,
        }
      };
    }
})

export default function Home({user,categoryList}) {
  const { error, isLoading } = useUser();
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
  
if (isLoading) return <div>Loading...</div>;
if (error) return <div>{error.message}</div>;
// If no user exists, display access denied message
if (!user) { return  <Layout><AccessDenied/></Layout> }
const isAdmin = user ? user.email === process.env.NEXT_PUBLIC_EMAIL_ADMIN : null;


  return (
    <Layout activeMenu='Categories'>

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
        
          {categories.map(({ _id, name,url, createdOn, lastModified, createdBy, createdByName }) => (
            <div className={styles.card} key={_id} >
              { createdBy===user.email || isAdmin ?
              <>
              <a href={"/categories/categoryEdit?id="+_id} >
              
                {url && <img src={url} className={styles.category} /> }
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
              { isAdmin && 
                <button onClick={() => deleteCategory(_id)}> Delete Category</button>}
             </div>
            ))}
           
        </div>

      </Layout>
    
  )
}
