const {ipcRenderer} = require('electron');
     
Object.defineProperty(String.prototype, 'ToUpperString', {
    value: function () {
        return this.charAt(0).toUpperCase() + this.slice(1);
    },
    writable: true,
    configurable: true 
});

let all_results
let abc = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"]

function comunication()
{
    ipcRenderer.send('result-comunication')
}

function showConfig()
{
    ipcRenderer.send('config-details')
}

ipcRenderer.on('show-config', (event,config)=>
{
    config_details =`<div class ="text-center mb-4">
        <h3>Simulation Details</h3>
        <h4>Algorithm : futbol-simulator-qatar-2022</h4>
        <br>
        <h4> Modalitie : ${config["modalitie"]}</h4>
        <br>`

    if (config["modalitie"] == "Match")
    {
        config_details += `<p class = "text-muted"> Was simulated the match between ${config["data"]["teams"][0]} and ${config["data"]["teams"][1]} 30 times</p> <br>
        <br>
    </div>`
    }

    if( config["modalitie"]== "League")
    {
        config_details += `<p class = "text-muted"> Was simulated 30 times a football League where the matchdays are like more famous european leagues. In every matchday all teams play against some other team, in the league every team face twice every other team.</p> <br>
        <h4> Teams involucrated in simulation are:</h4> <br>
        <br>`

        for (var i=0; i<config["data"]["teams"].length ;i++)
        {
            config_details += `<p class = "text-muted">${config["data"]["teams"][i]}</p> <br>`
        }
        config_details+= `</div>`
    }

    if (config["modalitie"] == "World_Cup_Qatar_2022")
    {
        config_details += `<p class = "text-muted">Was simulated 30 times the Qatar World Cup
            with original groups and tradicional system of elimination. In each group every team
             face the other teams where, finally, clasifie first and second team with more points.
              In a direct elimination round, the matching is as follows: the first from group A is
               paired with the second from group B, the first from group C is paired with the second
                from group D, the first from group E is paired with the second from F, and so on
                 following the pattern. In the other bracket, the inverse matchups are set, meaning,
                  the second from group A faces the first from group B, the second from C faces the first
                   from D, and this continues until all groups are exhausted</p> <br>
        <h4>World Cup groups are:</h4>
        <br>`

        config_details += `<h5>Group A:</h5>
            <p class = "text-muted">Qatar </p>
            <p class = "text-muted">Ecuador </p>
            <p class = "text-muted">Senegal </p>
            <p class = "text-muted">Netherlands </p>
            <br>
            <h5>Group B:</h5>
            <p class = "text-muted">England </p>
            <p class = "text-muted">Iran </p>
            <p class = "text-muted">United States </p>
            <p class = "text-muted">Wales </p>
            <br>
            <h5>Group C:</h5>
            <p class = "text-muted">Argentina </p>
            <p class = "text-muted">Saudi Arabia </p>
            <p class = "text-muted">Mexico </p>
            <p class = "text-muted">Poland </p>
            <br>
            <h5>Group D:</h5>
            <p class = "text-muted">France </p>
            <p class = "text-muted">Australia </p>
            <p class = "text-muted">Denmark </p>
            <p class = "text-muted">Tunisia </p>
            <br>
            <h5>Group E:</h5>
            <p class = "text-muted">Spain </p>
            <p class = "text-muted">Costa Rica </p>
            <p class = "text-muted">Germany </p>
            <p class = "text-muted">Japan </p>
            <br>
            <h5>Group F:</h5>
            <p class = "text-muted">Morroco </p>
            <p class = "text-muted">Croatia </p>
            <p class = "text-muted">Belgium </p>
            <p class = "text-muted">Canada </p>
            <br>
            <h5>Group G:</h5>
            <p class = "text-muted">Brazil </p>
            <p class = "text-muted">Serbia </p>
            <p class = "text-muted">Switzerland </p>
            <p class = "text-muted">Cameroon </p>
            <br>
            <h5>Group H:</h5>
            <p class = "text-muted">Portugal </p>
            <p class = "text-muted">Ghana </p>
            <p class = "text-muted">Uruguay </p>
            <p class = "text-muted">South Korea </p>
            <br>`
        config_details+= `</div>`
    }

    if(config["modalitie"]== "Tournament")
    {
         format =config["data"]["format"]
        config_details += `<p class = "text-muted"> Was simulated 30 times the Tournament
                 defined by user.<br> 
                 In Group Fase there are `
                 if(format[2]!=1)
                 {
                     if(format[3] != 0)
                     { 
                         config_details += `${format[0]} teams in ${format[1]} groups where clasifie ${format[2]} teams in each group and ${format[3]} best ${format[2]+1} position. Extra clasified play against random first clasified in diferent group on next round.`
                     }
                     else
                     {
                         config_details += `${format[0]} teams in ${format[1]} groups where clasifie ${format[2]} teams in each group. First clasified in certain group play against a second clasified in diferent group.`
                     }
 
                 }
                 else
                 {
                     if(format[3] != 0)
                     {
                         config_details += `${format[0]} teams in ${format[1]} groups where clasifie first team in each group and ${format[3]} best second position. Extra clasified play against random first clasified in diferent group on next round.`
                     }
                     else
                     {
                         config_details += `${format[0]} teams in ${format[1]} groups where clasifie first team in each group`
                     }               
                 }
             
             config_details+= `</p> <br>
             <h4>Tournaments groups are:</h4>
             <br>`
             for (let group in config["data"]["groups"])
             {
                 config_details += `<h5>Group ${group}</h5>`
                 for(let team in config["data"]["groups"][group])
                 {
                     config_details += `<p class = "text-muted"> ${config["data"]["groups"][group][team]} </p>`
                 }
                 config_details+=`<br>`
             }
             config_details+= `</div>`

    }

    document.querySelector('.results').innerHTML = config_details
})

function goBack()
{
    ipcRenderer.send('charge-view-request', "")
}

ipcRenderer.on('results-csv', (event,results,saved)=>// sera llamada luego de crear las imagenes producto de los resultados cargados
{
    all_results = results
    groups = false;
    data = results["probabilities"]
    teams = 0

    res_html = ``
    for (let team in data)
    {
        for(let keys in data[team])
        {
            if(keys=="1st Group" || keys=="1 in Group")
            {
                groups = true;
            }
        }
        teams +=1
    }

    if(groups)
    {
        teams/=4
        for(var i = 0; i < teams ; i++)
        {
            res_html+=`<div class ="text-center mb-4">
                <h3>Group ${abc[i]}</h3>
            </div>
            <img class ="avatar" src = "../../db/results/${abc[i]}`+`.jpg" > <br>`
        }
        res_html += `<div class ="text-center mb-4">
            <h3>Non group fase probabilities:</h3>
        </div>
        <img class ="avatar" src = "../../db/results/algorithm_results.jpg" > <br>`;
    }
    else
    {
        res_html += `<div class ="text-center mb-4">
            <h3>Placements Probabilites:</h3>
        </div>
        <img class ="avatar" src = "../../db/results/algorithm_results.jpg" > <br>`;
    }
    
    document.querySelector('.results').innerHTML = res_html
})

function showGeneralresults()
{    
    groups = false;
    data = all_results["probabilities"]
    teams = 0

    res_html = ``
    for (let team in data)
    {
        for(let keys in data[team])
        {
            if(keys=="1st Group" || keys=="1 in Group")
            {
                groups = true;
            }
        }
        teams +=1
    }

    if(groups)
    {
        teams/=4
        for(var i = 0; i < teams ; i++)
        {
            res_html+=`<div class ="text-center mb-4">
                <h3>Group ${abc[i]}</h3>
            </div>
            <img class ="avatar" src = "../../db/results/${abc[i]}`+`.jpg" > <br>`
        }
        res_html += `<div class ="text-center mb-4">
            <h3>Non group fase probabilities:</h3>
        </div>
        <img class ="avatar" src = "../../db/results/algorithm_results.jpg" > <br>`;
    }
    else
    {
        res_html += `<div class ="text-center mb-4">
            <h3>Placements Probabilites:</h3>
        </div>
        <img class ="avatar" src = "../../db/results/algorithm_results.jpg" > <br>`;
    }

    document.querySelector('.results').innerHTML = res_html
}

function showIterationResults()
{
    iteratins_html = `
    <div class ="text-center mb-4">
    <h3> Select iteration number to see results</h3>
</div>
<div class ="w-25 mx-auto">
    <div class ="d-flex selector">
        <form action = #>
            <label for ="iteration"> Iterations</label>
            <select name="iter" id="iteration" size="1">`
    
for (var i = 0; i <30 ; i++) 
{
    iteratins_html+=`<option id="${i}" value ="${i}">${i}</option>` 
}
    
iteratins_html +=`</select>    
</form>
</div>
 </div>
 <div class ="w-25 mx-auto">
    <input type="button" value ="Select" class="btn btn-outline-dark">
    </div>`

    document.querySelector('.results').innerHTML= iteratins_html;
    const btn = document.querySelector(".btn-outline-dark")

    btn.addEventListener("click", (e)=>
    {
    try
    {
        const iter = document.getElementById('iteration');
        var value_iter = iter.options[iter.selectedIndex].value;

        e.preventDefault()

        showIter(value_iter);
    }
    catch
    {
        e.preventDefault()
        alert("Select a number")
    }
})
}

function showIter(iteration)// terminar usando la funcion que se creara para cargar la configuracion guardada
{
data = all_results["matches"][iteration]

iterations_html = `
    <div class ="text-center mb-4">
    <h3> Select iteration number to see results</h3>
</div>
<div class ="w-25 mx-auto">
    <div class ="d-flex selector">
        <form action = #>
            <label for ="iteration"> Iterations</label>
            <select name="iter" id="iteration" size="1">`
    
for (var i = 0; i <30 ; i++) 
{
    if(i==iteration)
    {
        iterations_html+=`<option id="${i}" value ="${i}" selected>${i}</option>`
    }
    else
    {
        iterations_html+=`<option id="${i}" value ="${i}">${i}</option>` 
    }
}
    
iterations_html +=`</select>    
</form>
</div>
 </div>
 <div class ="w-25 mx-auto">
    <input type="button" value ="Select" class="btn btn-outline-dark">
    </div>`

modalitie = ""

for (let i in data)
{
    if(i == "Group Fase")
    {
        modalitie = "Tournament"
    }
    else{
        if(typeof(data[i]) == "object")
        {
            modalitie = "League"
        }
        else{
            if(typeof(data[i]) == "string")
            {
                modalitie = "Match"
            }             
        }
    }
    break
}

iterations_html+=`<div class ="text-center mb-4">
    <h3>Iteration ${iteration} Results:</h3>`

if (modalitie == "Tournament")
{       
    for (let i in data)
    {
        if(i =="Group Fase")
        {
            iterations_html +=`<h4>Group Fase:</h4>`
            for (let j in data[i])
            {
                iterations_html+= `<h5>Matches Results in Group ${j}:</h5>`
                for (let match in data[i][j])
                {
                    if(data[i][j][match][1]== data[i][j][match][3])
                    {
                        iterations_html+= `<p class = "text-muted">Draw: ${data[i][j][match][0].ToUpperString()} ${data[i][j][match][1]} vs ${data[i][j][match][2].ToUpperString()} ${data[i][j][match][3]}</p>`
                    }
                    else
                    {
                        iterations_html+= `<p class = "text-muted">Winner: ${data[i][j][match][0].ToUpperString()} ${data[i][j][match][1]} vs Defeated: ${data[i][j][match][2].ToUpperString()} ${data[i][j][match][3]}</p>`
                    }   
                }            
            }
        }
        else
        {
            iterations_html +=`<h4>${i}:</h4>`
            for (let match in data[i])
            {
                iterations_html+= `<p class = "text-muted">Winner: ${data[i][match][0].ToUpperString()} ${data[i][match][1]} vs Defeated: ${data[i][match][2].ToUpperString()} ${data[i][match][3]}</p>`
            }
            iterations_html +=`<br>`
        }
    } 
    iterations_html+=`<h4>Podium:</h4>
    <h5>3rd Place: ${data["3rd Place"][0][0].ToUpperString()}</h5>
    <h5>2nd Place: ${data["Final"][0][2].ToUpperString()}</h5>
    <h5>Champion: ${data["Final"][0][0].ToUpperString()}</h5>
</div>`
}

if(modalitie == "Match")
{
    iterations_html +=`<h4>Iteration Match:</h4>`
    iterations_html+=`<p class = "text-muted">Winner: ${data[0].ToUpperString()} ${data[1]} vs Defeated: ${data[2].ToUpperString()} ${data[3]}</p>`
    iterations_html+=`</div>`
}

if(modalitie == "League")
{
    count = 1
    for (let i in data )
    {
        iterations_html +=`<h4>Matchday ${count}:</h4>`
        count+=1
        for (let match in data[i])
        {
            iterations_html+= `<p class = "text-muted">Winner: ${data[i][match][0].ToUpperString()} ${data[i][match][1]} vs Defeated: ${data[i][match][2].ToUpperString()} ${data[i][match][3]}</p>`
        }
        iterations_html +=`<br>`
    }
}

document.querySelector('.results').innerHTML= iterations_html;
const btn = document.querySelector(".btn-outline-dark")

btn.addEventListener("click", (e)=>
    {
    try
    {
        const iter = document.getElementById('iteration');
        var value_iter = iter.options[iter.selectedIndex].value;

        e.preventDefault()

        showIter(value_iter);
    }
    catch
    {
        e.preventDefault()
        alert("Select a number")
    }
})

}
