const {ipcRenderer} = require('electron');
var national_selections = []
var national_selections_lineups 
var national_selections_players
Object.defineProperty(String.prototype, 'ToUpperString', {
    value: function () {
        return this.charAt(0).toUpperCase() + this.slice(1);
    },
    writable: true,
    configurable: true 
});

function comunication()
{
    ipcRenderer.send('server');
}// stablish comunication with index.js

function goBack()// go back to modalities page
{
    ipcRenderer.send('charge-view-request' , "")
}

function showScrapTeam()
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
        try{
        const selection = document.getElementById('region');
        var value = selection.options[selection.selectedIndex].value;              
        e.preventDefault()
        if(national_selections_lineups[value].length == 0)
        {
            alert("Please scrap this region first")
        }
        else
        {
            showSelections(value)
        }
        
        }
        catch
        {
            alert('Please select a region to procede')
        }
    });
}

function showSelections(region)
{

    var lineups_section = `<div class ="text-center mb-4">
        <h3> Select one Team to see lineup </h3>
        <div class="w-0 mx-auto container">
            <h4> Reboot</h4>
            <label class="switch">
            <input type="checkbox" checked name="reboot">
            <span class="slider"> </span>
            </label>
        </div>
    </div>
    <div class ="w-25 mx-auto">
        <button class= "btn btn-secondary"> Back</button>
        <div class ="d-flex selector">
            <form action = #>
                <label for ="team"> Teams</label>
                <select name="teams" id="team" size="5">`;
    for (let selection in national_selections_lineups[region])
    {
        lineups_section += `<option id="${selection}" value ="${selection}"> ${selection.ToUpperString()}</option>`
    }
    lineups_section+= `</select>
    <button class= "btn btn-outline-dark"> Select</button>
</form>
</div>
</div>`   

    document.querySelector('.search_section').innerHTML = lineups_section

    const form =document.querySelector('form');

    const secondary_btn = document.querySelector('.btn-secondary');

    secondary_btn.addEventListener('click', e=>
    {
        showScrapTeam()
    })

    form.addEventListener('submit', e => 
    {
        let reboot = document.querySelector('input[name="reboot"]:checked');
        try 
        {
            const selection = document.getElementById('team');
            var value = selection.options[selection.selectedIndex].value;              
            e.preventDefault()
            try 
            {   
                reboot.value
                let result =window.confirm('Are you sure you want to scrap this team? It will be rebooted and may take a few minutes.')                 
                if(result)
                {
                    ipcRenderer.send('edit-data-request', ["scrap_team",value,'reboot'])
                }  
            }
            catch
            {
                let result =window.confirm('Are you sure you want to scrap this team? Players valorations will be actualized with their actual stats and may take a few minutes')             
                
                if(result)
                {
                    ipcRenderer.send('edit-data-request', ["scrap_team",value,''])
                }
            }  
        }                   
        catch
        {
            e.preventDefault()
            alert('Please select a selection for scrap')
        }
    });
}

function showScrapRegion()
{
    var lineups_section = `<div class ="text-center mb-4">
        <h3> Select one Region to scrap </h3>
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
        try{
        const selection = document.getElementById('region');
        var value = selection.options[selection.selectedIndex].value;              
        e.preventDefault()
        let result = window.confirm("Are you sure you want procede. This may take a few minuts")
        if(result)
        {
            ipcRenderer.send('edit-data-request', ["scrap_region",value])
        }        
        }
        catch
        {
            alert('Please select a region to procede')
        }
    });
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
    
    national_selections = [...dataArr]

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
   

    national_selections = [...dataArr]
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

