import Header from './header'
import Footer from './footer'
import styles from './layout.module.css'


export default function Layout ({children, activeMenu}) {
  return (
    <>
      <Header activeMenu = {activeMenu}/>
      <div className={styles.container}>
      <main className={styles.main}>
        {children}
      </main>
      <Footer/>
      </div>
    </>
  )
}