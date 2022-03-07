import Head from 'next/head'
import Link from 'next/link'

import styles from '../styles/Home.module.css'
import Layout from '../components/layout'
import React from "react";




export default function Home() {
  


  return (
    <Layout>

      <Head>
        <title>CardX - Privacy Policy</title>
        <meta name="description" content="CardX Privacy Policy" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1>
        Privacy Policy
      </h1>
      <p>   
        We store your email and login information only to keep track of who logins to our application.
        We may send you emails ocasionally, and we won't share your information with anyone else.
        If you wish to delete your account, do send us an email. 
        You shall find our contact at 
        <Link  href="https://www.papoapapo.com">
          <a> www.papoapapo.com </a>
        </Link>
        We are based in Portugal and for any conflicts we shall refer to local conflict mediation services.
      </p>
        
      </Layout>
    
  )
}
