import { useState } from 'react'

export default function CsvReader(){
    const [csvFile, setCsvFile] = useState();
    const [csvArray, setCsvArray] = useState([]);
    // [{name: "", age: 0, rank: ""},{name: "", age: 0, rank: ""}]

    async function insertCard(cardText, url, category, cardUsers, source, decks) {

        const res = await fetch(
          '/api/cards/insertCard',
          {
            body: JSON.stringify({
              cardText: cardText,
              category: category,
              url: url,
              cardUsers: cardUsers,
              source: source,
              decks: decks.split(","),
            }),
            headers: {
              'Content-Type': 'application/json'
            },
            method: 'POST'
          }
        )    
      } 

    const processCSV = (str, delim=';') => {
        // gets headers and rows without double quotes
        const headers = str.slice(0,str.indexOf('\n')).replace(/["]+/g, '').split(delim);
        const rows = str.slice(str.indexOf('\n')+1).replace(/["]+/g, '').split('\n');
        const newArray = rows.map( row => {
            const values = row.split(delim);
            const eachObject = headers.reduce((obj, header, i) => {
                obj[header] = values[i];
                return obj;
            }, {})
            return eachObject;
        })
        if (newArray.length>0){
            newArray.forEach(element => {    
                 insertCard(element.cardText, element.url, element.category, element.cardUsers, element.source, element.decks)
                } 
                 );
           
            

        }
        setCsvArray(newArray)

    }

    const submit = () => {
        const file = csvFile;
        const reader = new FileReader();

        reader.onload = function(e) {
            const text = e.target.result;
            console.log(text);
            processCSV(text); // plugged in here
            console.log(csvArray.toString());
        }

        reader.readAsText(file, 'ISO-8859-1');
    }

    return(
        <form id='csv-form'>
            <input
                type='file'
                accept='.csv'
                id='csvFile'
                onChange={(e) => {
                    setCsvFile(e.target.files[0])
                }}
            >
            </input>
            <br/>
            <button
                onClick={(e) => {
                    e.preventDefault()
                    if(csvFile)submit()
                }}>
                Submit
            </button>
            <br/>
            <br/>
            {csvArray.length>0 ? 
            <>
                <table>
                    <thead>
                        <tr>
                            <th>Card Text</th>
                            <th>URL</th>
                            <th>Category</th>
                            <th>Card Users</th>
                            <th>Source</th>
                            <th>Decks</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            csvArray.map((item, i) => (
                                <tr key={i}>
                                    <td>{item.cardText}</td>
                                    <td>{item.url}</td>
                                    <td>{item.category}</td>
                                    <td>{item.cardUsers}</td>
                                    <td>{item.source}</td>
                                    <td>{item.decks}</td>

                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </> : null}
        </form>
    );

}
