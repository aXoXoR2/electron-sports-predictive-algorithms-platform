const {ipcRenderer} = require('electron');
var national_selections = []
var national_selections_lineups
var national_selections_players


function ToUpperString(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

function comunication()
{
    ipcRenderer.send('server');
}// stablish comunication with index.js

function goBack()// go back to modalities page
{
    ipcRenderer.send('charge-view-request' , "")
}

function showLineupEditor()
{
    var lineups_section = `<div class ="text-center mb-4">
        <h3> Select one Region to see Teams </h3>
    </div>
    <div class ="w-25 mx-auto">
        <div class ="d-flex selector">
            <form action = #>
                <label for ="region"> Regions</label>
                <select name="regions" id="region" size="5">`;
    for (let region in national_selections_lineups)
    {
        lineups_section += `<option id="${region}" value ="${region}"> ${region}</option>`
    }
    lineups_section+= `</select>
    <button class= "btn btn-outline-dark"> Select</button>
</form>
</div>
</div>`
    document.querySelector('.search_section').innerHTML = lineups_section
    const form =document.querySelector('form');
    
    form.addEventListener('submit', e => 
    {
        const selection = document.getElementById('region');
        try 
        {
            var value = selection.options[selection.selectedIndex].value;              
            e.preventDefault()
            if(national_selections_players[value].length == 0)
            {
                alert("Please scrap this region first")
            }
            else{
                showSelections(value)
            }
            
        }
        catch{
            e.preventDefault()
        alert('Please select a region')}
    });
}

function showSelections(region)
{

    var lineups_section = `<div class ="text-center mb-4">
        <h3> Select one Team to see lineup </h3>
        <h4>${region}</h4>
    </div>
    <div class ="w-25 mx-auto">
        <button class= "btn btn-secondary"> Back</button>
        <div class ="d-flex selector">
            <form action = #>
                <label for ="team"> Teams</label>
                <select name="teams" id="team" size="5">`;

    selections =Object.keys(national_selections_lineups[region]).sort()
    for (let i in selections)
    {
        lineups_section += `<option id="${selections[i]}" value ="${selections[i]}"> ${ToUpperString(selections[i])}</option>`
    }
    lineups_section+= `</select>
    <button class= "btn btn-outline-dark"> Select</button>
</form>
</div>`
if(region != "world_cup_qatar_2022")
    {
        lineups_section += `<div class="w-0 mx-auto">
            <input type="button" value ="Get This Team Last Lineup" data-nombre="lineup" class="btn btn-primary">
        </div>`
    }   
lineups_section+= `</div>`     
    document.querySelector('.search_section').innerHTML = lineups_section
    const form =document.querySelector('form');

    const secondary_btn = document.querySelector('.btn-secondary');
    let botones_primary = document.querySelectorAll(".btn-primary")

botones_primary.forEach((item)=>
{
    item.addEventListener("click",(e)=>
    {
        const name = e.target.dataset['nombre']
        if(name == "lineup")
    {
        const selection = document.getElementById('team');
        try{
        var value = selection.options[selection.selectedIndex].value;              
        e.preventDefault()
        let result = window.confirm("Are you sure you want to procede? Lineup will be changed.")
        if(result)
        {
        ipcRenderer.send('edit-data-request',["lineup", value])
        }
        }
        catch{
            e.preventDefault()
            alert('Please select a team')
        }
    }
    })
})

    secondary_btn.addEventListener('click', e=>
    {
        showLineupEditor()
    })

    form.addEventListener('submit', e => 
    {
        const selection = document.getElementById('team');
        try{
        var value = selection.options[selection.selectedIndex].value;              
        e.preventDefault()
        showLineups(region,value)
        }
        catch{
            e.preventDefault()
            alert('Please select a team')}
    });
}

function showLineups(region, team)
{
    var lineups_section = `<div class ="text-center mb-4">
        <h3> Select one Player in the Lineup and one in the convocatorie for switch</h3>
    </div>
    <div class ="w-25 mx-auto">
        <button class= "btn btn-secondary"> Back</button>
        <div class ="d-flex selector">
            <form action = #>
                <label for ="lineup"> Lineup</label>
                <select name="lineups" id="lineup" size="5">`;
                                
    for (let player in national_selections_lineups[region][team])
    {
        lineups_section += `<option id="${national_selections_lineups[region][team][player]["player"]}" value ="${national_selections_lineups[region][team][player]["player"]}"> ${ToUpperString(national_selections_lineups[region][team][player]["player"])+"--- ---position: "+national_selections_lineups[region][team][player]["position"]}</option>`
    }

    lineups_section+= `</select>    
             </form>
            </div>
              </div>
              <div class ="w-25 mx-auto">
                <div class ="d-flex selector">
                    <form action = #>
                        <label for ="bank"> Bank</label>
                        <select name="banks" id="bank" size="5">`

    for (let player in national_selections_players[region][team])
    {
        if (not_in(player,national_selections_lineups[region][team]))
            {
                if (! national_selections_players[region][team][player]["position"])
                {
                    pos = "unknown";
                }
                else
                {
                    pos =national_selections_players[region][team][player]["position"]
                }
                lineups_section += `<option id="${player}" value ="${player}"> ${ToUpperString(player)+"------position: "+ pos}</option>`
           }
        }

    lineups_section+= `</select>    
             </form>
            </div>
              </div>
              <div class="w-25 mx-auto">
              <button class= "btn btn-outline-dark"> Select</button>
              </div>`
              
    document.querySelector('.search_section').innerHTML = lineups_section
    const btn=document.querySelector('.btn-outline-dark');

    const secondary_btn = document.querySelector('.btn-secondary');

    secondary_btn.addEventListener('click', e=>
    {
        showSelections(region)
    })

    btn.addEventListener('click', e => 
    {
        try
        {
        const substituted = document.getElementById('lineup');
        var value_substituted = substituted.options[substituted.selectedIndex].value;
        const substitute = document.getElementById('bank');
        var value_substitute= substitute.options[substitute.selectedIndex].value;

        e.preventDefault()

        let pos_subtituted =""

        for (let player in national_selections_lineups[region][team])
        {
            if (national_selections_lineups[region][team][player]["player"] == value_substituted)
            {
                pos_subtituted = national_selections_lineups[region][team][player]["position"]
            }
        }

        if (pos_subtituted == "G" && !(national_selections_players[region][team][value_substitute]["position"]=="G" || national_selections_players[region][team][value_substitute]["position"]== "unknown"))
        {
            alert("Please choose a goalkeeper to switch")
        }

        else
        {
            if(pos_subtituted != "G" && national_selections_players[region][team][value_substitute]["position"]=="G")
            {
                alert("Goalkeeper only can play in portery")
            }
     
            else
            {
            let new_lineup = {"att": [] , "def":[] , "goalkeeper": "" , "mid":[]}
            for (let player in national_selections_lineups[region][team])
            {
                if(national_selections_lineups[region][team][player]["position"]!= "G")
                {
                    if (national_selections_lineups[region][team][player]["player"] == value_substituted)
                    {
                        new_lineup[convert(national_selections_lineups[region][team][player]["position"])].push(value_substitute)
                    }
                    else
                    {
                        new_lineup[convert(national_selections_lineups[region][team][player]["position"])].push(national_selections_lineups[region][team][player]["player"])
                    }    
                }
                else  
                {
                    if (national_selections_lineups[region][team][player]["player"] == value_substituted)
                    {
                        new_lineup["goalkeeper"]=value_substitute
                    }
                    else
                    {
                        new_lineup["goalkeeper"]= national_selections_lineups[region][team][player]["player"]
                    }
                }                
            }   

            ipcRenderer.send('edit-data-request', ["lineup", team, new_lineup]) 
        } 
    }
    }
        catch{
            e.preventDefault()
            alert("Make sure you choose a player in both sides")
        }
    });
}

function not_in(player, lineup)
{
    for (let player_alined in lineup)
    {
        if(lineup[player_alined]["player"] == player)
        {
            return false;
        }
    }
    return true;
}

function showScrapPlayer()
{
    var description_lis =''
    description_lis +=` <div class ="w-25 mx-auto">
    <div class = "searcher">
        <input type = "text" id="name" placeholder = "Search Player" required >
        <div class = "btn mybutton">
            <i class="bi bi-search"></i>
        </div>
    </div>  
</div> `
    
    document.querySelector('.search_section').innerHTML=description_lis;
    const inputPlayer = document.getElementById('name'); 
    let btn = document.querySelector(".mybutton")
    
    inputPlayer.addEventListener("keydown", function(event)
    {
        if(event.key == "Enter")
        {
            const namePlayer = document.querySelector("#name").value
            if(namePlayer =="")
            {
                alert("Please enter the player name")
            }
            else
            {
                ipcRenderer.send('search-data-request', [namePlayer])
            }                    
        }
    })
    btn.addEventListener("click", (e)=>
    {
        const namePlayer = document.querySelector("#name").value
        if(namePlayer =="")
        {
            alert("Please enter the player name")
        }
        else
        {
            ipcRenderer.send('search-data-request', [namePlayer])
        }  
    });
}

ipcRenderer.on('data-founded', (event,data)=>
{
    var description_lis =` <div class ="w-25 mx-auto">
    <div class = "searcher">
        <input type = "text" id="name" placeholder = "Search Player" required >
        <div class = "btn mybutton">
            <i class="bi bi-search"></i>
        </div>
    </div>  
    <br />
    <br />
    <br />
            </div> 
                <div class ="text-center mb-4">
                    <h3> Founded players </h3>
                    <p class = "text-muted"> Select the player you want to add</p>
                </div>
                <div class ="w-50 mx-auto">
                    <div id="contenedor">
                `
    
    for (var i=0; i<data.length; i++)
    {
        if (data[i]["type"]=="player" && data[i]["entity"]["team"]["disabled"]==false)
        {
            description_lis+=`<div class ="d-flex align-items-center player"
            <label for ="${data[i]["entity"]["name"]}">`+ 
                `<div class="d-flex search"> 
                    <div class=" d-flex align-items-center justify-content-end"> 
                        <img class ="rounded-pill me-3 avatar" src = "https://api.sofascore.app/api/v1/player/${data[i]["entity"]["id"]}/image" > 
                    </div> 
                    <div > 
                        <div class ="card"> 
                            <div class="card-body">`
                                 + data[i]["entity"]["name"]+`--------position: `+data[i]["entity"]["position"]+`--------nationality: `+ data[i]["entity"]["country"]["name"] + 
                            `</div> 
                        </div>
                    </div>
                </div>`
            +`</label> 
            <input type ="radio" name="players" value= "${data[i]["entity"]["id"]}" id ="${data[i]["entity"]["name"]}"><br>
            </div>`
        }
    }
    description_lis +=`</div>
    <button class="btn btn-outline-dark"> Add Player </button>
</div>`
document.querySelector('.search_section').innerHTML=description_lis;
const btn = document.querySelector(".btn-outline-dark")
let btnmy = document.querySelector(".mybutton")
const inputPlayer = document.getElementById('name'); 
    
inputPlayer.addEventListener("keydown", function(event)
{
    if(event.key == "Enter")
    {
        const namePlayer = document.querySelector("#name").value
        if(namePlayer =="")
        {
            alert("Please enter the player name")
        }
        else
        {
            ipcRenderer.send('search-data-request', [namePlayer])
        }                    
    }
})
btnmy.addEventListener("click", (e)=>
{
    const namePlayer = document.querySelector("#name").value
    if(namePlayer =="")
    {
        alert("Please enter the player name")
    }
    else
    {
        ipcRenderer.send('search-data-request', [namePlayer])
    }  
});


btn.addEventListener("click", (e)=>
{

    let player = document.querySelector('input[name="players"]:checked');
    if(player)
    {    
        for(var i =0; i< data.length; i++)
        {
            if(data[i]["entity"]["id"] == player.value)
            {
                let result =searchSelection(data[i]["entity"]["country"]["name"].toLowerCase())
                if(result)
                {
                    ipcRenderer.send('edit-data-request', ["player",data[i]["entity"]["id"],data[i]["entity"]["slug"]])
                }
                else
                {
                    alert("The nation of this player dosent exist in open database")
                }
            }
        }    
    }
    else{
        alert('Please select a player');
    }     
});  
})

function searchSelection(country)
{
    for(let region in national_selections_lineups)
    {
        for (let team in national_selections_lineups[region])
        {
            if(team == country && region != "world_cup_qatar_2022")
            {
                return true
            }
        }
    }
    return false
}

ipcRenderer.on('data-edited', (event, modalitie_data , old_data)=>
{
    let all_national_selections = []
    national_selections_players = modalitie_data["players"]
    national_selections_lineups = modalitie_data["lineups"]

    for (let region in national_selections_lineups)
    {
        for (let team in national_selections_lineups[region])
        {
            all_national_selections.push(team);
            let all_team = []
            for(let pos in national_selections_lineups[region][team])
            {
                if (pos != "goalkeeper")
                {
                    for (let player in national_selections_lineups[region][team][pos])
                    {
                        all_team.push({"player": national_selections_lineups[region][team][pos][player] , "position": convert(pos)})
                    }
                }
                else
                {
                    all_team.push({"player": national_selections_lineups[region][team][pos], "position": "G"})
                }
            }
            national_selections_lineups[region][team] = all_team
        }
    }

    const dataArr = new Set(all_national_selections)
    
    national_selections = [...dataArr].sort()

    if(old_data[0] == "lineup")
    {
        old_region = ""
        founded = false
        for (let region in national_selections_lineups)
        {
            for (let team in national_selections_lineups[region])
            {
                if(team == old_data[1])
                {
                    old_region = region
                    founded = true
                    break
                }
            }
            if (founded)
            {break}
        }
        showLineups(old_region , old_data[1])
    }

})// recieve the modalities and crate the section

ipcRenderer.on('modalities-data', (event,args, modalitie_data)=>
{
    let all_national_selections = []
    national_selections_players = modalitie_data["players"]
    national_selections_lineups = modalitie_data["lineups"]

    for (let region in national_selections_lineups)
    {
        for (let team in national_selections_lineups[region])
        {
            all_national_selections.push(team);
            let all_team = []
            for(let pos in national_selections_lineups[region][team])
            {
                if (pos != "goalkeeper")
                {
                    for (let player in national_selections_lineups[region][team][pos])
                    {
                        all_team.push({"player": national_selections_lineups[region][team][pos][player] , "position": convert(pos)})
                    }
                }
                else
                {
                    all_team.push({"player": national_selections_lineups[region][team][pos], "position": "G"})
                }
            }
            national_selections_lineups[region][team] = all_team
        }
    }
    
    const dataArr = new Set(all_national_selections)
    national_selections = [...dataArr].sort()
})// recieve the modalities and crate the section

function convert(pos)
{
if (pos == "att")
{
    return "F"
}
else{
    if(pos == "def")
    {
        return "D"
    }
    else{
        if(pos == "mid")
        {
            return "M"
        }
        else
        {
            if(pos == "F")
            {
                return "att"
            }
            else{
                if(pos == "M")
                {
                    return "mid"
                }
                else{
                    if(pos == "D")
                    {
                        return "def"
                    }
                    else{
                        if(pos == "G")
                        {
                            return "goalkeeper"
                        }
                        else{
                            return "unknown"
                        }
                    }
                }
            }                
        }
    }
}

}
