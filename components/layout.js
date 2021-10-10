import Header from './header'
import Footer from './footer'
import styles from './layout.module.css'


export default function Layout ({children}) {
  return (
    <>
      <Header/>
      <div className={styles.container}>
      <main className={styles.main}>
        {children}
      </main>
      <Footer/>
      </div>
    </>
  )
}