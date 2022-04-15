
import Link from 'next/link'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import utilStyles from '../../styles/utils.module.css'
import styles from '../../styles/Home.module.css'
import { useUser } from '@auth0/nextjs-auth0';
import Layout from '../../components/layout'
import AccessDenied from '../../components/access-denied'

export default function Form() {

    const { user, error, isLoading } = useUser();

    const router = useRouter()
    const categoryId = router.query.id
    async function submitCategory(event) {
    event.preventDefault()
    const res = categoryId ? await fetch(
      '/api/categories/' + categoryId,
      {
        body: JSON.stringify({
          name: event.target.name.value,
          description: event.target.description.value,
          url: event.target.url.value,
          order: event.target.order.value,
        }),
        headers: {
          'Content-Type': 'application/json'
        },
        method: 'PATCH'
      }
    ) : await fetch(
      '/api/categories/insertCategory',
      {
        body: JSON.stringify({
          name: event.target.name.value,
          description: event.target.description.value,
          url: event.target.url.value,
          order: event.target.order.value,
        }),
        headers: {
          'Content-Type': 'application/json'
        },
        method: 'POST'
      }
    )
    alert("Category Submitted")

  } 

    const [category, setCategory] = useState('');

    const fetchCategory = async () => {
      const res = await fetch('/api/categories/'+categoryId)
      const category = await res.json()
      setCategory(category);
    }

    useEffect( () => {
      categoryId ? fetchCategory() : ''
    }, [categoryId])

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>{error.message}</div>;
    // If no user exists, display access denied message
    if (!user) { return  <Layout><AccessDenied/></Layout> }

    return (
      <Layout>
      <div className={styles.container}>
        <Head>
          <title>categoryX - {categoryId ? 'Edit' : 'New category'}</title>
          <meta name="description" content="The place to edit or create categories" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <form onSubmit={(event) => submitCategory(event, category.ownedBy)}>
        <label className={utilStyles.input_label} htmlFor="name">Category name</label>
        <div className={utilStyles.input}>
          <input className={utilStyles.input_field} id="name" name="name" type="text" defaultValue={category.name} required />
        </div>
        <label className={utilStyles.input_label} htmlFor="description">What is this category all about?</label>
        <div className={utilStyles.input}>
          <textarea className={utilStyles.input_field} cols="30" rows="3" id="description" name="description" type="text" defaultValue={category.description} />
        </div>
        <label className={utilStyles.input_label} htmlFor="url">category Image URL</label>
        <div className={utilStyles.input}>
          <input className={utilStyles.input_field} id="url" name="url" type="text" defaultValue={category.url} />
        </div>
        <label className={utilStyles.input_label} htmlFor="order">category Order</label>

        <div className={utilStyles.input}>
          <input className={utilStyles.input_field} id="order" name="order" type="number" defaultValue={category.order} />
        </div>
        <button className={utilStyles.card_button} type="submit">Submit</button>
        <br />
        <Link href="/">
            <a>Back home!</a>
        </Link>
      </form>
    </div>
    </Layout>
    )
  }
  