const {ipcRenderer,ipcMain} = require('electron');

Object.defineProperty(String.prototype, 'ToUpperString', {
    value: function () {
        return this.charAt(0).toUpperCase() + this.slice(1);
    },
    writable: true,
    configurable: true 
});
    var national_selections = []
    var national_selections_lineups 
    var original_lineups
    var national_selections_players
    let abc = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z", "AA", "BB", "CC" ,"DD","EE", "FF", "GG" ,"HH","II", "JJ", "KK" ,"LL","MM", "NN", "OO" ,"PP","QQ", "RR", "SS" ,"TT","UU", "VV", "WW" ,"XX","YY", "ZZ"]


    ipcRenderer.on('wait-until-done', (event)=> // cambiar para que muestre el estado de la simulacion actual
    {
        config_details =`<div class ="text-center mb-4">
            <h3>Wait paciently for the results</h3`

        document.querySelector('.descriptions_section').innerHTML = config_details
    }) // load section

    function comunication()
    {
        ipcRenderer.send('server');
    }// stablish comunication with index.js

    ipcRenderer.on('modalities-data', (event,args, modalitie_data,source)=>
        {
            let all_national_selections = []
            national_selections_lineups = {}
            national_selections_players = modalitie_data["players"]
            original_lineups= modalitie_data["lineups"]

            for (let region in original_lineups)
            {
                national_selections_lineups[region] = {}
                for (let team in original_lineups[region])
                {
                    all_national_selections.push(team);
                    let all_team = []
                    for(let pos in original_lineups[region][team])
                    {
                        if (pos != "goalkeeper")
                        {
                            for (let player in original_lineups[region][team][pos])
                            {
                                all_team.push({"player": original_lineups[region][team][pos][player] , "position": convert(pos)})
                            }
                        }
                        else
                        {
                            all_team.push({"player": original_lineups[region][team][pos], "position": "G"})
                        }
                    }
                    national_selections_lineups[region][team] = all_team
                }
            }
            
            const dataArr = new Set(all_national_selections)
           

            national_selections = [...dataArr].sort()
            createModalities(args,source)
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

    function createModalities(modalities,source)
    {
        var modalities_lis =''
        modalities.forEach((c)=>
        {
            modalities_lis +=`
            <div>
                <input type="button" value ="${c}" data-nombre="${c}" class="btn btn-secondary">
            </div>`
        })
        if(source)
        {
    document.querySelector('.descriptions_section').innerHTML=`
    <div class="d-flex descriptions">
    <div class="card">
        <div class="card-body">
            Here are the different modes to simulate the selected project. When you select one of the modes in the left section, fill in all the required parameters properly before executing.
        </div>
    </div>
    </div>`
}
    document.querySelector('.modalities').innerHTML=modalities_lis;
    let botones = document.querySelectorAll(".btn-secondary")
    botones.forEach((item)=>
    {
        item.addEventListener('click',(e)=>
        {
            const name = e.target.dataset['nombre']
            changeModalitie(name);
        })
    })
    }// create modalities list on left side

    function goStart()
    {
        ipcRenderer.send('go-home');

    } // bottom home interaction. Back to home

    function changeModalitie(args)
    {
        var description_lis =``

        if(args == "Match")
        {
            description_lis += `
            <div class ="text-center mb-4">
            <h3> Select one team in each section to make the match</h3>
        </div>
        <div class ="w-25 mx-auto">
            <div class ="d-flex selector">
                <form action = #>
                    <label for ="1st_Team"> 1st Team</label>
                    <select name="1st" id="1st_Team" size="9">`
            
            for (let team in national_selections)
            {
                description_lis += `<option id="${national_selections[team]}" value ="${national_selections[team]}"> ${national_selections[team].ToUpperString()}</option>` 
            }
            
            description_lis+= `</select>    
                     </form>
                    </div>
                      </div>
                      <div class ="w-25 mx-auto">
                        <div class ="d-flex selector">
                            <form action = #>
                                <label for ="2nd_Team">2nd Team</label>
                                <select name="2nd" id="2nd_Team" size="9">`
            
            for (let team in national_selections)
            {
                description_lis += `<option id="${national_selections[team]}" value ="${national_selections[team]}"> ${national_selections[team].ToUpperString()}</option>` 
            }
            
            description_lis +=`</select>
        </form>
    </div>
</div>
<div class ="w-25 mx-auto">
<input type="button" value ="Submit" class="btn btn-outline-dark">
</div>`

            document.querySelector('.descriptions_section').innerHTML=description_lis;
            const btn = document.querySelector(".btn-outline-dark")

            btn.addEventListener("click", (e)=>
            {
            try
            {
                const first = document.getElementById('1st_Team');
                var value_first = first.options[first.selectedIndex].value;
                const second = document.getElementById('2nd_Team');
                var value_second= second.options[second.selectedIndex].value;

                e.preventDefault()

                if ( value_first == value_second)
                {
                    alert("Please choose two diferent teams")
                }
                else
                {
                    showConfigBeforeRun( args,[],[value_first, value_second],[]) 
                }
            }
            catch
            {
                e.preventDefault()
                alert("Make sure you choose a team in both sides")
            }
    });
        }  
         
        else
        {
            if(args == "League")
            {
                
            description_lis += `
            <div class ="text-center mb-4">
            <h3>Select a par number of teams for the simulation</h3>
        </div>
        <div class ="w-25 mx-auto">
            <div class ="d-flex selector">
                <form action = #>
                    <label for ="teams">Teams</label>
                    <select name="teams" id="teams" multiple size="20">`
            
            for (let team in national_selections)
            {
                description_lis += `<option id="${national_selections[team]}" value ="${national_selections[team]}"> ${national_selections[team].ToUpperString()}</option>` 
            }
            
            description_lis+= `</select>    
                     </form>
                    </div>
                      </div> 
                      <div class ="w-25 mx-auto">
                      <input type="button" value ="Submit" class="btn btn-outline-dark">
                      </div>`

            document.querySelector('.descriptions_section').innerHTML=description_lis;
            const btn = document.querySelector(".btn-outline-dark")

            btn.addEventListener("click", (e)=>
            {
            try
            {
                let teams = []
                let selections = document.getElementById('teams').selectedOptions;
                
                for (let i = 0; i < selections.length; i++)
                {
                    teams.push(selections[i].value);
                }
                e.preventDefault()

                if(teams.length > 2)
                {
                if(teams.length%2 == 0)
                {
                    showConfigBeforeRun(args,[],teams,[]) 
                }
                else{
                    alert('Please select a par number of teams. Delete or select one more.')
                }
            }
                else{
                    alert('Please select more that two teams.')
                }
            }
            catch
            {
                e.preventDefault()
                alert("Make sure you choose at least one team")
            }
    });
            
            }
           
            else
            {
                if(args == "World_Cup_Qatar_2022")
                {
                    description_lis += `
            <div class ="text-center mb-4">
            <h3> Will be simulated World Cup Qatar-2022</h3>
            <h5> The groups are:</h5>
            A : Qatar
                Ecuador
                Senegal
                Netherlands <br>

  B : England
        Iran
        Usa
        Wales <br>

    C : Argentina
        Saudi-arabia
        Mexico
        Poland <br>

    D : France
        Australia
        Denmark
        Tunisia  <br>
    

    E : Spain
        Costa-rica
        Germany
        Japan <br>


    F : Morocco
        Croatia
        Belgium
        Canada <br>
    
     G : Brazil
         Serbia
         Switzerland
         Cameroon  <br>
    
    
    H : Portugal
        Ghana
        Uruguay
        South Korea  <br>
    
            </div>
            <div class ="w-25 mx-auto">
                <input type="button" value ="Submit" class="btn btn-outline-dark">
                </div>

            `          
                    
                    document.querySelector('.descriptions_section').innerHTML=description_lis;
                    const btn = document.querySelector(".btn-outline-dark")

                    btn.addEventListener("click", (e)=>
                    {
                        showConfigBeforeRun(args,[],[],[])
                    });
                }
                else
                {
                    if(args == "Tournament")
                    {
                        
                    description_lis += `
                    <div class ="text-center mb-4">
                    <h3> Select 8 or more teams and </h3>   
                    </div>
                    <div class ="w-25 mx-auto">
                        <div class ="d-flex selector">
                            <form action = #>
                                <label for ="teams">Teams</label>
                                <select name="teams" id="teams" multiple size="20">
        
                    `       
                    for (let team in national_selections)
                    {
                        description_lis += `<option id="${national_selections[team]}" value ="${national_selections[team]}"> ${national_selections[team].ToUpperString()}</option>` 
                    }   
                    
                    description_lis+= `</select>    
                     </form>
                    </div>
                      </div> 
                      <div class ="w-25 mx-auto">
                      <input type="button" value ="Submit" class="btn btn-outline-dark">
                      </div>`
                    
                    document.querySelector('.descriptions_section').innerHTML=description_lis;
                    const btn = document.querySelector(".btn-outline-dark")
        
                    btn.addEventListener("click", (e)=>
                    {
                        try
                        {
                            let teams = []
                            let selections = document.getElementById('teams').selectedOptions;
                            
                            for (let i = 0; i < selections.length; i++)
                            {
                                teams.push(selections[i].value);
                            }
                            
                            e.preventDefault()
                            
                            if(teams.length >7)
                            {
                                good_status = false
                                if(teams.length%4 == 0)
                                {
                                    e.preventDefault()
                                    good_status = true;
                                    tournamentType(teams); 
                                }  
                                if(! good_status)
                                {  
                                    e.preventDefault()
                                alert('Please select a 4 divisible number of teams. In this moment you have selected '+ teams.length.toString()+" teams. Unselect "+ teams.length%4 +" teams or select "+ (4-teams.length%4).toString()+ " teams more." )      
                                }               
                            }
                            else{
                                alert("Make sure you choose at least 8 teams. In this moment you have selected "+ teams.length.toString()+" teams.")
                            }
                        }
                        catch
                        {
                            e.preventDefault()
                            alert("Make sure you choose at least 8 teams")
                        }
                    });
                    }
                }
            }
        }
    } // method to show the modalitie section.

    function tournamentType(teams)
    {
        let types = []
        let formats = []
        let numberOfTeams = 2
        let numberOfGroups = 0

        while( numberOfTeams < teams.length )
        {
            if(teams.length% numberOfTeams== 0)
            {
                numberOfGroups = teams.length/numberOfTeams
                types.push([numberOfTeams,numberOfGroups])
            }

            numberOfTeams +=2
        }

        var description_lis =`
        <div class ="text-center mb-4">
            <h3> Select tournament format and then select group for each team.</h3>   
            </div>
            <div class ="w-25 mx-auto">
                <input type="button" value ="Back" data-nombre="Back" class="btn btn-secondary">
                <div class ="d-flex selector">
                    <form action = #>
                        <label for ="teams">Formats</label>
                        <select name="formats" id="formats" size="1">`
        
        for (let type in types)
        {
            for(var i = 1; i < types[type][0]; i++)
            {              
                let power = 1
                let nearestPower = Math.pow(2,power)        
                let isPower = false
                let clasified = i*types[type][1];
                while(clasified >= nearestPower)
                {
                    if(nearestPower%clasified == 0)
                    {
                        isPower = true
                        break
                    }
                    power+=1
                    nearestPower = Math.pow(2,power) 
                }
                if(nearestPower  < types[type][1]* types[type][0]  && nearestPower- clasified < types[type][1])
                {
                if(isPower)
                {
                    if(i !=1)
                    {
                        description_lis += `<option id="${type}" value ="${[types[type][0],types[type][1],i,0]}"> ${types[type][0]} teams in ${types[type][1]} groups - firsts ${i} teams in each grouop clasifie</option>` 
                        formats.push([types[type][0],types[type][1],i,0])
                    }
                    else
                    {
                        description_lis += `<option id="${type}" value ="${[types[type][0],types[type][1],1,0]}"> ${types[type][0]} teams in ${types[type][1]} groups - first team in each group clasifie</option>` 
                        formats.push([types[type][0],types[type][1],1,0])
                    }      
                }
                else
                {
                    if( i+1 != types[type][0] && nearestPower-clasified != types[type][1])
                    {
                        if (i==1)
                        {
                            formats.push([types[type][0],types[type][1],1,nearestPower-clasified])
                            description_lis += `<option id="${type}" value ="${[types[type][0],types[type][1],1,nearestPower-clasified]}"> ${types[type][0]} teams in ${types[type][1]} groups - first team in each group and ${nearestPower-clasified} best ${2} place clasifie</option>` 
                        }
                        else
                        {
                            formats.push([types[type][0],types[type][1],i,nearestPower-clasified])
                            description_lis += `<option id="${type}" value ="${[types[type][0],types[type][1],i,nearestPower-clasified]}"> ${types[type][0]} teams in ${types[type][1]} groups - firsts ${i} teams in each group and ${nearestPower-clasified} best ${i+1} place clasifie</option>` 
                        }                
                    }            
                }
                }
            }
            
        }   
                                    
        description_lis+= `</select>    
                             </form>
                             </div>
                          </div> 
                         <div class ="w-25 mx-auto">
                         <input type="button" value ="Select" class="btn btn-outline-dark">
                        </div>`
                                    
        
        document.querySelector('.descriptions_section').innerHTML=description_lis;
        const btn = document.querySelector(".btn-outline-dark")
                  
        let botones = document.querySelectorAll(".btn-secondary")

        botones.forEach((item)=>
        {
        item.addEventListener('click',(e)=>
        {
            const name = e.target.dataset['nombre']
            if(name == "Back")
            {
                changeModalitie("Tournament");
            }
        })
     })

        btn.addEventListener('click',(e)=>
        {
            try
            {
                let selection= document.getElementById('formats');    
                var value= selection.options[selection.selectedIndex].value;           
                e.preventDefault()
                showGroupsAsignament(teams, value ,formats)
            }
            catch
            {
                e.preventDefault()
                alert("Make sure you choose an option.")
            }
        });
    }

    function showGroupsAsignament(teams, actualFormat ,types)
    {
        let format = []
        let auxiliar =""
        for (var i=0; i<actualFormat.length; i++)
        {
            if (actualFormat[i] == ",")
            {
                format.push(parseInt(auxiliar))
                auxiliar = ""
            }
            else
            {
                auxiliar += actualFormat[i]
            }
        }
        format.push(parseInt(auxiliar))
        var description_lis =`
        <div class ="text-center mb-4">
            <h3> Select tournament format and then select group for each team.</h3>   
            </div>
            <div class ="w-25 mx-auto">
                <input type="button" value ="Back" data-nombre="Back" class="btn btn-secondary">
                <div class ="d-flex selector">
                    <form action = #>
                        <label for ="teams">Formats</label>
                        <select name="formats" id="formats" size="1">`
        
        for (let type in types)
        {
            if(types[type][0]==format[0] && types[type][1]==format[1] && types[type][2]==format[2] && types[type][3]==format[3])
            {
                format = [types[type][0], types[type][1], types[type][2], types[type][3]]
                if(types[type][2] == 1 && types[type][3] == 0)
                {
                    
                    description_lis += `<option id="${type}" value ="${types[type]}" selected> ${types[type][0]} teams in ${types[type][1]} groups - first team in each group clasifie</option>`
                }
                else
                {
                    if(types[type][2] == 1 && types[type][3] != 0)
                    {
                        description_lis += `<option id="${type}" value ="${types[type]}" selected> ${types[type][0]} teams in ${types[type][1]} groups - first team in each group and ${types[type][3]} best ${2} place clasifie</option>`
                    }
                    else
                    {
                        if(types[type][2] != 1 && types[type][3] == 0)
                        {
                            description_lis += `<option id="${type}" value ="${types[type]}" selected> ${types[type][0]} teams in ${types[type][1]} groups - firsts ${types[type][2]} teams in each group clasifie</option>`
                        }
                        else
                        {
                            if(types[type][2] != 1 && types[type][3] != 0)
                            {
                                description_lis += `<option id="${type}" value ="${types[type]}" selected> ${types[type][0]} teams in ${types[type][1]} groups - firsts ${types[type][2]} teams in each group and ${types[type][3]} best ${types[type][2]+1} place clasifie</option>`
                            }
                        }
                    }
                }
            }    
            else
            {
                if(types[type][2] == 1 && types[type][3] == 0)
                {
                    description_lis += `<option id="${type}" value ="${types[type]}"> ${types[type][0]} teams in ${types[type][1]} groups - first team in each group clasifie</option>`
                }
                else
                {
                    if(types[type][2] == 1 && types[type][3] != 0)
                    {
                        description_lis += `<option id="${type}" value ="${types[type]}" > ${types[type][0]} teams in ${types[type][1]} groups - first team in each group and ${types[type][3]} best ${2} clasifie</option>`
                    }
                    else
                    {
                        if(types[type][2] != 1 && types[type][3] == 0)
                        {
                            description_lis += `<option id="${type}" value ="${types[type]}" > ${types[type][0]} teams in ${types[type][1]} groups - firsts ${types[type][2]} teams in each group clasifie</option>`
                        }
                        else
                        {
                            if(types[type][2] != 1 && types[type][3] != 0)
                            {
                                description_lis += `<option id="${type}" value ="${types[type]}" > ${types[type][0]} teams in ${types[type][1]} groups - firsts ${types[type][2]} teams in each group and ${types[type][3]} best ${types[type][2]+1} clasifie</option>`
                            }
                        }
                    }
                }   
            }
        }   
                                    
        description_lis+= `</select>    
                             </form>
                             </div>
                          </div> 
                         <div class ="w-25 mx-auto">
                            <input type="button" value ="select" data-nombre="Select" class="btn btn-outline-dark">
                        </div>`
        
        description_lis +=`
                        <div class ="text-center mb-4">
                            <h3>Asign a team to a group. Always remember asign the choosen team numbers to each group.</h3>
                            <p class = "text-muted">Select a group name in the right of each team.</p>
                        </div>
                        <div class ="w-25 mx-auto">                 
                            <div id="contenedor">                          
                                <div class="selector">`

            count = 0
            subcount =0
            for (let team in teams)
            {
                description_lis+=`
                <div class ="d-flex align-items-center team"
                    <label for ="${teams[team]}"> 
                        <div class ="card"> 
                            <div class="card-body">`
                                 + teams[team].ToUpperString() + 
                            `</div> 
                        </div>
                    </label> 
                    <form action = #>
                        <label for ="${teams[team]}"></label>
                        <select name="${teams[team]}" id="${teams[team]}" size="1">`

                for (var i = 0 ; i < format[1]; i++)
                {
                    if(i==subcount)
                    {
                        description_lis += `<option id="${abc[i]}" value ="${abc[i]}" selected>${abc[i]}</option>`
                        count+=1
                    }
                    else
                    {
                        description_lis += `<option id="${abc[i]}" value ="${abc[i]}">${abc[i]}</option>` 
                    }
                }
                if( count == format[0])
                {
                    count = 0
                    subcount+=1
                }

                description_lis+= `</select>    
                     </form>
                    </div>`
            }

            description_lis +=`</div>
        </div>
        <input type="button" value ="Submit" data-nombre="Submit" class="btn btn-primary">
        </div>`

        document.querySelector('.descriptions_section').innerHTML=description_lis;
        const btn = document.querySelector(".btn-outline-dark")
        let botones_primary = document.querySelectorAll(".btn-primary")
        let botones = document.querySelectorAll(".btn-secondary")

        botones_primary.forEach((item)=>
        {
            item.addEventListener("click",(e)=>
            {
                const name = e.target.dataset['nombre']
                if(name == "Submit")
            {
            selectors = []
            group_dictionary_count= {}
            groups = {}
            selectors_value =[]
            count= 0

            for(let team in teams)
            {
                selectors.push(document.getElementById(teams[team]))
                selectors_value.push(selectors[count].options[selectors[count].selectedIndex].value)
                if(! group_dictionary_count[selectors_value[count]])
                {
                    groups[selectors_value[count]] = []
                    group_dictionary_count[selectors_value[count]] = 0
                }
                groups[selectors_value[count]].push(teams[team])
                group_dictionary_count[selectors_value[count]] += 1
                count+=1
            }
            good_status = true
            let wrong_group 
            for(group in group_dictionary_count)
            {
                if(group_dictionary_count[group]!=actualFormat[0])
                {
                    wrong_group = group
                    good_status = false
                    break
                }
            }
            if(good_status)
            {
                e.preventDefault()
                showConfigBeforeRun("Tournament",groups,teams,actualFormat)
            }
            else{
                e.preventDefault()
                window.alert("Please make sure every group have the exactly team number in each group. In this state group "+wrong_group+" have "+group_dictionary_count[wrong_group]+" teams and shoul have "+numberOfTeams+".")                                     
            }
        }
    })
        })
  
        botones.forEach((item)=>
        {
        item.addEventListener('click',(e)=>
        {
            const name = e.target.dataset['nombre']
            if(name == "Back")
            {
                changeModalitie("Tournament");
            }
        })
     })

        btn.addEventListener("click", (e)=>
        {
            try
            {
                let selection= document.getElementById('formats');    
                var value= selection.options[selection.selectedIndex].value;            
                    e.preventDefault()
                    showGroupsAsignament(teams, value,types)
            }
                catch
                {
                    e.preventDefault()
                    alert("Make sure you choose an option.")
                }
        });

    }

    function showConfigBeforeRun(modalitie,groups,teams,actualFormat)
    {
        let format = actualFormat
        config_details =`<div class ="text-center mb-4">
            <h3>Simulation Details</h3>
            <div class="w-0 mx-auto">
                <input type="button" value ="Change Parameters" data-nombre="change_parameters" class="btn btn-secondary">
                <input type="button" value ="Save Configuration" data-nombre="save_config" class="btn btn-primary">
                <button class="btn btn-outline-dark"> Execute </button>
            </div>
            <h4>Algorithm : futbol-simulator-qatar-2022</h4>
            <br>
            <h4> Modalitie : ${modalitie}</h4>
            <br>`

        if (modalitie == "Match")
        {
            config_details += `<p class = "text-muted"> Was simulated the match between ${teams[0].ToUpperString()} and ${teams[1].ToUpperString()} 30 times</p> <br>
            <br>
        </div>`
        }

        if( modalitie== "League")
        {
            config_details += `<p class = "text-muted"> Was simulated 30 times a football League where the matchdays are like more famous european leagues. In every matchday all teams play against some other team, in the league every team face twice every other team.</p> <br>
            <h4> Teams involucrated in simulation are:</h4> <br>
            <br>`

            for (var i=0; i<teams.length ;i++)
            {
                config_details += `<p class = "text-muted">${teams[i].ToUpperString()}</p> <br>`
            }
            config_details+= `</div>`
        }

        if (modalitie == "World_Cup_Qatar_2022")
        {
            config_details += `<p class = "text-muted"> Was simulated 30 times the Qatar World Cup
                 with original groups and tradicional system of elimination. In each group every team
                  face the other teams where, finally, clasifie first and second team with more points.
                   In a direct elimination round, the matching is as follows: the first from group A is
                    paired with the second from group B, the first from group C is paired with the second
                     from group D, the first from group E is paired with the second from F, and so on
                      following the pattern. In the other bracket, the inverse matchups are set, meaning,
                       the second from group A faces the first from group B, the second from C faces the first
                        from D, and this continues until all groups are exhausted.</p> <br>
                        <p class = "text-muted">Lo anterior se puede observar mejor en la imagen a continuación</p> <br>
                        <img class ="brackets" src = "world.png" > <br`

        
            config_details+= `</div>`
        }

        if(modalitie== "Tournament")
        {
            format = []
            let auxiliar =""
           for (var i=0; i<actualFormat.length; i++)
        {
            if (actualFormat[i] == ",")
            {
                format.push(parseInt(auxiliar))
                auxiliar = ""
            }
            else
            {
                auxiliar += actualFormat[i]
            }
        }
        format.push(parseInt(auxiliar))
            config_details += `<p class = "text-muted"> Was simulated 30 times the Tournament
                 defined previously.<br> 
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
            for (let group in groups)
            {
                config_details += `<h5>Group ${group}</h5>`
                for(let team in groups[group])
                {
                    config_details += `<p class = "text-muted"> ${groups[group][team].ToUpperString()} </p>`
                }
                config_details+=`<br>`
            }
            config_details+= `</div>`
        }

        document.querySelector('.descriptions_section').innerHTML = config_details
        
        const btn = document.querySelector(".btn-outline-dark")
        let botones = document.querySelectorAll(".btn-secondary")
        let botones_primary = document.querySelectorAll(".btn-primary")
        
        botones_primary.forEach((item)=>
        {
            item.addEventListener("click",(e)=>
            {
                const name = e.target.dataset['nombre']
                if(name == "save_config")
            {
                ipcRenderer.send('save-config',modalitie,{"teams":teams,"groups":groups})
            }
            })
        })

        botones.forEach((item)=>
        {
        item.addEventListener('click',(e)=>
        {
            const name = e.target.dataset['nombre']
            if(name == "change_parameters")
            {
                e.preventDefault()
                showPreviousView(modalitie,groups,teams,format)
            }
        })
        })

        btn.addEventListener('click',(e)=>
        {
            executeRequest(modalitie,groups,teams,format)
        })

    }

    ipcRenderer.on('preview-view', (event,data)=>
    {
        showConfigBeforeRun(data["modalitie"],data["data"]["groups"],data["data"]["teams"],data["data"]["format"])
    })

    function executeRequest(args,groups,teams,format)
    {   
        let result =window.confirm("Are you sure about that desicion? The simulation may take a time depends the type of it.")
        if(result)
        {
            let players = {}
            let lineups = {}
            if(args == "World_Cup_Qatar_2022")
            {
                players = national_selections_players["world_cup_qatar_2022"]
                lineups = original_lineups["world_cup_qatar_2022"]
                
            }
            else
            {
                for(let team in teams)
                {
                    let result = searchSelection(teams[team])
                    players[teams[team]] = result[1]
                    lineups[teams[team]] = result[0]
                }
            }
            ipcRenderer.send('execute-algorithm-request',args,{"teams":teams,"groups":groups,"format":format ,"players":players,"lineups":lineups})
        }
    }// execution algorithm request

    function searchSelection(country)
        {
            let its_on_worlds = false
            for(let region in national_selections_lineups)
            {
                for (let team in national_selections_lineups[region])
                {
                    if(team == country && region != "world_cup_qatar_2022")
                    {
                        return [original_lineups[region][team],national_selections_players[region][country]]
                    }
                    else
                    {
                        if(team == country)
                        {
                            its_on_worlds = true
                        }
                    }
                }
            }
            if(its_on_worlds)
            {
                return [original_lineups["world_cup_qatar_2022"][country],national_selections_players["world_cup_qatar_2022"][country]]
            }
        }

    function showPreviousView(modalitie,groups,teams,format)
    {
        var description_lis =``
        teams = teams.sort()

        if(modalitie == "Match")
        {
            description_lis += `
            <div class ="text-center mb-4">
            <h3> Select one team in each section to make the match</h3>
        </div>
        <div class ="w-25 mx-auto">
            <div class ="d-flex selector">
                <form action = #>
                    <label for ="1st_Team"> 1st Team</label>
                    <select name="1st" id="1st_Team" size="9">`
            
            for (let team in national_selections)
            {
                if(national_selections[team] == teams[0])
                {
                    description_lis += `<option id="${national_selections[team]}" value ="${national_selections[team]}" selected> ${national_selections[team].ToUpperString()}</option>` 
                }
                else
                {
                    description_lis += `<option id="${national_selections[team]}" value ="${national_selections[team]}"> ${national_selections[team].ToUpperString()}</option>` 
                }
            }
            
            description_lis+= `</select>    
                     </form>
                    </div>
                      </div>
                      <div class ="w-25 mx-auto">
                        <div class ="d-flex selector">
                            <form action = #>
                                <label for ="2nd_Team">2nd Team</label>
                                <select name="2nd" id="2nd_Team" size="9">`
            
            for (let team in national_selections)
            {
                if(national_selections[team] == teams[1])
                {
                    description_lis += `<option id="${national_selections[team]}" value ="${national_selections[team]}" selected> ${national_selections[team].ToUpperString()}</option>` 
                }
                else
                {
                    description_lis += `<option id="${national_selections[team]}" value ="${national_selections[team]}"> ${national_selections[team].ToUpperString()}</option>` 
                } 
            }
            
            description_lis +=`</select>
        </form>
    </div>
</div>
<div class ="w-25 mx-auto">
<input type="button" value ="Submit" class="btn btn-outline-dark">
</div>`

            document.querySelector('.descriptions_section').innerHTML=description_lis;
            const btn = document.querySelector(".btn-outline-dark")

            btn.addEventListener("click", (e)=>
            {
            try
            {
                const first = document.getElementById('1st_Team');
                var value_first = first.options[first.selectedIndex].value;
                const second = document.getElementById('2nd_Team');
                var value_second= second.options[second.selectedIndex].value;

                e.preventDefault()

                if ( value_first == value_second)
                {
                    alert("Please choose two diferent teams")
                }
                else
                {
                    showConfigBeforeRun( modalitie,[],[value_first, value_second],format) 
                }
            }
            catch
            {
                e.preventDefault()
                alert("Make sure you choose a team in both sides")
            }
    });
        }  
         
        else
        {
            if(modalitie == "League")
            {
                
            description_lis += `
            <div class ="text-center mb-4">
            <h3>Select a par number of teams for the simulation</h3>
        </div>
        <div class ="w-25 mx-auto">
            <div class ="d-flex selector">
                <form action = #>
                    <label for ="teams">Teams</label>
                    <select name="teams" id="teams" multiple size="20">`
            count =0
            for (let team in national_selections)
            {
                if(national_selections[team] == teams[count])
                {
                    description_lis += `<option id="${national_selections[team]}" value ="${national_selections[team]}" selected> ${national_selections[team]}</option>` 
                    count+=1
                }
                else
                {
                    description_lis += `<option id="${national_selections[team]}" value ="${national_selections[team]}"> ${national_selections[team]}</option>` 
                } 
            }
            
            description_lis+= `</select>    
                     </form>
                    </div>
                      </div> 
                      <div class ="w-25 mx-auto">
                      <input type="button" value ="Submit" class="btn btn-outline-dark">
                      </div>`

            document.querySelector('.descriptions_section').innerHTML=description_lis;
            const btn = document.querySelector(".btn-outline-dark")

            btn.addEventListener("click", (e)=>
            {
            try
            {
                let teams = []
                let selections = document.getElementById('teams').selectedOptions;
                
                for (let i = 0; i < selections.length; i++)
                {
                    teams.push(selections[i].value);
                }
                e.preventDefault()

                if(teams.length%2 == 0)
                {
                    showConfigBeforeRun(modalitie,[],teams,format) 
                }
                else{
                    alert('Please select a par number of teams. Delete or select one more.')
                }
            }
            catch
            {
                e.preventDefault()
                alert("Make sure you choose at least one team")
            }
    });
            
            }
           
            else
            {
                if(modalitie == "World_Cup_Qatar_2022")
                {
                    description_lis += `
            <div class ="text-center mb-4">
            <h3> Will be simulated World Cup Qatar-2022</h3>
            <h5> The groups are:</h5>
            A : Qatar
                Ecuador
                Senegal
                Netherlands <br>

  B : England
        Iran
        Usa
        Wales <br>

    C : Argentina
        Saudi-arabia
        Mexico
        Poland <br>

    D : France
        Australia
        Denmark
        Tunisia  <br>
    

    E : Spain
        Costa-rica
        Germany
        Japan <br>


    F : Morocco
        Croatia
        Belgium
        Canada <br>
    
     G : Brazil
         Serbia
         Switzerland
         Cameroon  <br>
    
    
    H : Portugal
        Ghana
        Uruguay
        South Korea  <br>
    
            </div>
            <div class ="w-25 mx-auto">
                <input type="button" value ="Submit" class="btn btn-outline-dark">
                </div>

            `          
                    
                    document.querySelector('.descriptions_section').innerHTML=description_lis;
                    const btn = document.querySelector(".btn-outline-dark")

                    btn.addEventListener("click", (e)=>
                    {
                        showConfigBeforeRun(modalitie,[],[],format)
                    });
                }
                else
                {
                    if(modalitie == "Tournament")
                    {
                        let actualFormat = format

                        let types = []
                        let formats = []
                        let numberOfTeams = 2
                        let numberOfGroups = 0

                        while( numberOfTeams < teams.length )
                  {
                    if(teams.length% numberOfTeams== 0)
                       {
                       numberOfGroups = teams.length/numberOfTeams
                      types.push([numberOfTeams,numberOfGroups])
                      }
                       numberOfTeams +=2
                   }

                        description_lis +=`
                     <div class ="text-center mb-4">
            <h3> Select tournament format and then select group for each team.</h3>   
            </div>
            <div class ="w-25 mx-auto">
                <input type="button" value ="Back" data-nombre="Back" class="btn btn-secondary">
                <div class ="d-flex selector">
                    <form action = #>
                        <label for ="teams">Formats</label>
                        <select name="formats" id="formats" size="1">
                `
                for (let type in types)
                {
                    for(var i = 1; i < types[type][0]; i++)
                    {              
                        let power = 1
                        let nearestPower = Math.pow(2,power)        
                        let isPower = false
                        let clasified = i*types[type][1];
                        while(clasified >= nearestPower)
                        {
                            if(nearestPower%clasified == 0)
                            {
                                isPower = true
                                break
                            }
                            power+=1
                            nearestPower = Math.pow(2,power) 
                        }
                        if(nearestPower  < types[type][1]* types[type][0]  && nearestPower- clasified < types[type][1])
                        {
                        if(isPower)
                        {
                            if(i !=1)
                            {
                                if(actualFormat[0] == types[type][0] && actualFormat[1] == types[type][1] && actualFormat[2] == i && actualFormat[3] ==0 )
                                {
                                    description_lis += `<option id="${type}" value ="${[types[type][0],types[type][1],i,0]}" selected> ${types[type][0]} teams in ${types[type][1]} groups - firsts ${i} teams in each grouop clasifie</option>` 
                                }
                                else
                                {
                                    description_lis += `<option id="${type}" value ="${[types[type][0],types[type][1],i,0]}"> ${types[type][0]} teams in ${types[type][1]} groups - firsts ${i} teams in each grouop clasifie</option>` 
                                }
                                formats.push([types[type][0],types[type][1],i,0])
                            }
                            else
                            {
                                if(actualFormat[0] == types[type][0] && actualFormat[1] == types[type][1] && actualFormat[2] == 1 && actualFormat[3] ==0 )
                                {
                                    description_lis += `<option id="${type}" value ="${[types[type][0],types[type][1],1,0]}" selected> ${types[type][0]} teams in ${types[type][1]} groups - first team in each group clasifie</option>` 
                                }
                                else
                                {
                                    description_lis += `<option id="${type}" value ="${[types[type][0],types[type][1],1,0]}"> ${types[type][0]} teams in ${types[type][1]} groups - first team in each group clasifie</option>` 
                                }
                                formats.push([types[type][0],types[type][1],1,0])
                            }      
                        }
                        else
                        {
                            if( i+1 != types[type][0] && nearestPower-clasified != types[type][1])
                            {
                                if (i==1)
                                {
                                if(actualFormat[0] == types[type][0] && actualFormat[1] == types[type][1] && actualFormat[2] == 1 && actualFormat[3] == nearestPower-clasified)
                                {
                                    description_lis += `<option id="${type}" value ="${[types[type][0],types[type][1],1,nearestPower-clasified]}" selected> ${types[type][0]} teams in ${types[type][1]} groups - first team in each group and ${nearestPower-clasified} best ${i+1} place clasifie</option>` 
                                }
                                else
                                {
                                    description_lis += `<option id="${type}" value ="${[types[type][0],types[type][1],1,nearestPower-clasified]}"> ${types[type][0]} teams in ${types[type][1]} groups - first team in each group and ${nearestPower-clasified} best ${i+1} place clasifie</option>` 
                                }
                                formats.push([types[type][0],types[type][1],1,nearestPower-clasified])
                                    
                                }
                                else
                                {
                                    if(actualFormat[0] == types[type][0] && actualFormat[1] == types[type][1] && actualFormat[2] == i && actualFormat[3] == nearestPower-clasified)
                                {
                                    description_lis += `<option id="${type}" value ="${[types[type][0],types[type][1],i,nearestPower-clasified]}" selected> ${types[type][0]} teams in ${types[type][1]} groups - firsts ${i} teams in each group and ${nearestPower-clasified} best ${i+1} place clasifie</option>` 
                                }
                                else
                                {
                                    description_lis += `<option id="${type}" value ="${[types[type][0],types[type][1],i,nearestPower-clasified]}"> ${types[type][0]} teams in ${types[type][1]} groups - firsts ${i} teams in each group and ${nearestPower-clasified} best ${i+1} place clasifie</option>` 
                                }
                                    formats.push([types[type][0],types[type][1],i,nearestPower-clasified])
                                    
                                }                
                            }            
                        }
                    }
                }
                    
                }   
                 
           
                                    
                        description_lis+= `</select>    
                             </form>
                             </div>
                          </div> 
                         <div class ="w-25 mx-auto">
                            <input type="button" value ="select" data-nombre="Select" class="btn btn-outline-dark">
                        </div>`
        
                        description_lis +=`
                        <div class ="text-center mb-4">
                            <h3>Asign a team to a group. Always remember asign the choosen team numbers to each group.</h3>
                            <p class = "text-muted">Select a group name in the right of each team.</p>
                        </div>
                        <div class ="w-25 mx-auto">                 
                            <div id="contenedor">
                                <div class="selector">`
            for (let team in teams)
            {
                description_lis+=`
                <div class ="d-flex align-items-center team"
                    <label for ="${teams[team]}"> 
                        <div class ="card"> 
                            <div class="card-body">`
                                 + teams[team] + 
                            `</div> 
                        </div>
                    </label> 
                    <form action = #>
                        <label for ="${teams[team]}"></label>
                        <select name="${teams[team]}" id="${teams[team]}" size="1">`

                group = ""
                founded = false
                for ( let i in groups)
                {
                    for (let j in groups[i])
                    {
                        if(groups[i][j] == teams[team])
                        {
                            group = i;
                            founded =true;
                            break
                        }
                    }
                    if(founded)
                    {
                        break
                    }
                }
                for (var i = 0 ; i < actualFormat[1]; i++)
                {
                    if(group == abc[i])
                    {
                        description_lis += `<option id="${abc[i]}" value ="${abc[i]}" selected>${abc[i]}</option>` 
                    }
                    else
                    {
                        description_lis += `<option id="${abc[i]}" value ="${abc[i]}">${abc[i]}</option>`
                    }
                }

                description_lis+= `</select>    
                     </form>
                    </div>`
            }

            description_lis +=`</div>
        </div>
        <input type="button" value ="Submit" data-nombre="Submit" class="btn btn-primary">
        </div>`

        document.querySelector('.descriptions_section').innerHTML=description_lis;
        const btn = document.querySelector(".btn-outline-dark")
        let botones_primary = document.querySelectorAll(".btn-primary")
        let botones = document.querySelectorAll(".btn-secondary")

        botones_primary.forEach((item)=>
        {
            item.addEventListener("click",(e)=>
            {
                const name = e.target.dataset['nombre']
                if(name == "Submit")
            {
            selectors = []
            group_dictionary_count= {}
            groups = {}
            selectors_value =[]
            count= 0

            for(let team in teams)
            {
                selectors.push(document.getElementById(teams[team]))
                selectors_value.push(selectors[count].options[selectors[count].selectedIndex].value)
                if(! group_dictionary_count[selectors_value[count]])
                {
                    groups[selectors_value[count]] = []
                    group_dictionary_count[selectors_value[count]] = 0
                }
                groups[selectors_value[count]].push(teams[team])
                group_dictionary_count[selectors_value[count]] += 1
                count+=1
            }
            good_status = true
            let wrong_group 
            for(group in group_dictionary_count)
            {
                if(group_dictionary_count[group]!=actualFormat[0])
                {
                    wrong_group = group
                    good_status = false
                    break
                }
            }
            if(good_status)
            {
                e.preventDefault()
                showConfigBeforeRun("Tournament",groups,teams,actualFormat)
            }
            else{
                e.preventDefault()
                window.alert("Please make sure every group have the exactly team number in each group. In this state group "+wrong_group+" have "+group_dictionary_count[wrong_group]+" teams and shoul have "+numberOfTeams+".")                                     
            }
        }
    })
        })
  
        botones.forEach((item)=>
        {
        item.addEventListener('click',(e)=>
        {
            const name = e.target.dataset['nombre']
            if(name == "Back")
            {
                changeModalitie("Tournament");
            }
        })
     })

        btn.addEventListener("click", (e)=>
        {
            try
            {
                let selection= document.getElementById('formats');    
                var value= selection.options[selection.selectedIndex].value;            
                e.preventDefault()
                showGroupsAsignament(teams, value ,formats)
            }
                catch
                {
                    e.preventDefault()
                    alert("Make sure you choose an option.")
                }
        });
    
                    }
                }
            }
        }
    }

    function showEditor()
    {  
        ipcRenderer.send('charge-view-request', "_editor");
    }

    function showScrapper()
    {   
        ipcRenderer.send('charge-view-request', "_actualize");
    }

