async function caricaPartiCapitolo(file){

    let risposta =
        await fetch(file);


    let testo =
        await risposta.text();


    return testo
        .split("---")
        .map((parte,index)=>{

            return {
                id:index+1,
                testo:parte.trim()
            };

        });

}

async function preparaRomanzo(){

    for(let capitolo of romanzo){

        let parti =
            await caricaPartiCapitolo(capitolo.file);


        capitolo.parti =
            parti.map((parte,index)=>{

                return {
                    id:
                    capitolo.numero + "-" + (index+1)
                };

            });

    }

}