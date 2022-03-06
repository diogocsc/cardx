/* Note : Cards variable is declared in cards.js file, which should be loaded before app.js"*/
import Head from 'next/head'
import styles from '../styles/Game.module.css'
import { useState } from 'react'
import Layout from '../components/layout'
import { useSession, getSession } from 'next-auth/client'
import AccessDenied from '../components/access-denied'
import { useRouter } from 'next/router';

export default function Home() {
    const [ session, loading ] = useSession();
    const { query } = useRouter();


  // When rendering client side don't display anything until loading is complete
  if (typeof window !== 'undefined' && loading) return null

  // If no session exists, display access denied message
  if (!session) { return  <Layout><AccessDenied/></Layout> }

  // If session exists, display content
  const isAdmin = session.user.email === process.env.NEXT_PUBLIC_EMAIL_ADMIN;


    
var playCards;
var usedDeck = [];
var default_deck ="Demo Papo a Papo";
var deck = query.deck;
var fetchURL = '/api/public/decks/'+ (deck ? deck : default_deck);


async function getcards (deck){
		// console.log(cards);
		var cardsapi;
        var mycards;

		await fetch(fetchURL)
		  .then(response => response.json())
		  .then(data =>  cardsapi= data )
		  
		  mycards=cardsapi;

		  playCards = mycards;
		  startMeUp(deck);
}
  
  getcards(deck);




function startMeUp(deck) {
  if (document.readyState == 'complete' ) {
    deck && alert("Bem-vind@ ao "+deck+". Bom jogo!");

    loadcard();
  } else {
    document.onreadystatechange = function () {
        if (document.readyState === "complete") {
          loadcard();
        }
    }
  }
}


/* from https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Math/random*/
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

/* borrowed from https://www.htmlgoodies.com/beyond/javascript/article.php/3724571/Using-Multiple-JavaScript-Onload-Functions.htm*/

function loadcard() {

var ixcard;
if(playCards.length>1){ 
	ixcard = getRandomInt(0,playCards.length);
}
else {
	ixcard = getRandomInt(0,playCards.length-1);
}

var card;
let url="";
if (ixcard != undefined && ixcard != -1) {
	card = playCards[ixcard].cardText;
    url = playCards[ixcard].url;

      usedDeck.push(card);
      playCards.splice(ixcard,1);
}

      if(card == undefined) {
        card = "Chegou ao fim do baralho. Clique em Recomeçar para continuar"
		document.getElementById("main").innerHTML = ' <div class="card main"><div class="padTop"> '+ card + '</div></div>'
      }
      else if(url != undefined && url !="") {
		  document.getElementById("main").innerHTML = ' <div class='+styles.card+' '+styles.main+'> <img src="' + url + '" alt='+ card +' width="100%"></div>' 
	  } 
	  else document.getElementById("main").innerHTML = ' <div class='+styles.card+' '+styles.main+'><div class="padTop"> '+ card + '</div></div>'

  /*   document.getElementById("main").innerHTML +=  '<div class="next" title="Próxima Carta" onclick="loadcard();"> Seguinte</div>'
     +'<div class="restart" title="Recomeçar" onclick="restart();"> Recomeçar</div>'
    */  
}

function restart(){
  
  getcards();
  usedDeck = [];
//  loadcard();
  
}

    return(

        <Layout>

        <Head>
          <title>CardX</title>
          <meta name="description" content="A Card Repository" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
      
        <button onClick={() => restart()}> Recomeçar</button>

        <div id="main" className={styles.container}>
          ...
        </div>
        <button onClick={() => loadcard()}> Seguinte</button>
        
        </Layout>

    
    )
}