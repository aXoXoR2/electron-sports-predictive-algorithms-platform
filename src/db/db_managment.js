const fs = require('fs/promises');
const path = require('path');
const { stringify } = require('querystring');
const {spawnSync} = require("child_process");

let algorithms;
let descriptions;
let modalities

async function chargeModalities()
{
    const modalities = await readJson(path.join(__dirname,"./algorithms_modalities.json"));
    return modalities
} // function that charge algorithm modalitie

async function chargeData()
{
    algorithms= await readJson(path.join(__dirname,"./algorithms.json"));
    descriptions = await readJson(path.join(__dirname,"./descriptions.json"));
    modalities =await readJson(path.join(__dirname,"./algorithms_modalities.json"));
    return [algorithms,descriptions]
}
//function to charge data from database

async function readJson(rute)
{
    const dataJson = await fs.readFile(rute);
    const data = JSON.parse(dataJson);
    return data;
}// tool for read json

async function modalitieSelection(modalitie,data)
{
    const algorithmSelection = await readJson(path.join(__dirname,"./algorithm_selection.json"));
    algorithmSelection['modalitie'] = modalitie.toString();
    algorithmSelection["data"] = data
    await fs.writeFile(path.join(__dirname,"./algorithm_selection.json"),JSON.stringify(algorithmSelection));
    return 
}// change configuration parameters for algorithm execution

async function getId()
{
    const algorithmSelection = await readJson(path.join(__dirname,"./algorithm_selection.json"));
    return algorithmSelection["id"];
} // return actual algorithm id

async function chargeResults()
{
    let  data = await readJson(path.join(__dirname,"./algorithm_results.json"))
    return data
} // function that charge actual results

async function chargeConfig()
{
    let  data = await readJson(path.join(__dirname,"./algorithm_selection.json"))
    return data
} // function that charge actual configuration

async function algorithmSelectionJson(id)
{
    const algorithmSelection = await readJson(path.join(__dirname,"./algorithm_selection.json"));
    algorithmSelection['id'] = id.toString();
    await fs.writeFile(path.join(__dirname,"./algorithm_selection.json"),JSON.stringify(algorithmSelection));
    return 
}// here it's saved the algorithm selection

async function addAlgorithm(name,lenguage,brief_description,about,Inputs_and_Outputs)
{
    await chargeData()
    algorithms.push(
        {
            'id': algorithms.length.toString(),
            'name': name,
            'lenguage': lenguage,
            'brief_description': brief_description
            
        });
    descriptions.push(
        {
            'id': descriptions.length.toString(),
            'about' : about,
            'Inputs_and_Outputs': Inputs_and_Outputs
        }
    );
    await fs.writeFile(path.join(__dirname,"./algorithms.json"),JSON.stringify(algorithms));
    await fs.writeFile(path.join(__dirname,"./descriptions.json"),JSON.stringify(descriptions));
}// function to add algortihm to the database

async function removeAlgorithm(id)
{
    await chargeData()
    algorithms.splice(id,1);
    descriptions.splice(id,1);
    modalities.splice(id,1);
    for ( var i = id; i < algorithms.length; i++)
    {
        algorithms[i]["id"] = i.toString();
        descriptions[i]["id"] = i.toString();
    }
    await fs.writeFile(path.join(__dirname,"./algorithms.json"),JSON.stringify(algorithms));
    await fs.writeFile(path.join(__dirname,"./descriptions.json"),JSON.stringify(descriptions));
}// function to remove algorithm from database

async function editAlgorithm(id,name,lenguage,brief_description,about,Inputs_and_Outputs)
{
    await chargeData()

    algorithms[id]['id'] = id.toString(),
    algorithms[id]['name'] = name,
    algorithms[id]['lenguage']= lenguage,
    algorithms[id]['brief_description']= brief_description

    descriptions[id]['id']= id.toString(),
    descriptions[id]['about'] = about,
    descriptions[id]['Inputs_and_Outputs']= Inputs_and_Outputs

    await fs.writeFile(path.join(__dirname,"./algorithms.json"),JSON.stringify(algorithms));
    await fs.writeFile(path.join(__dirname,"./descriptions.json"),JSON.stringify(descriptions));
}// function to edit algorithms

async function checkDb()
{
    await chargeData()
    if(algorithms.length > descriptions.length)
    {
        algorithms.pop();
    }
    if(descriptions.length > algorithms.length)
    {
        descriptions.pop();
    }
}
async function convertData()
{
    const pythonProcess = await spawnSync('python',['src/db/data_converter.py','json_to_csv']); 
}// request for convert data to csv and after to imagees

async function chargeDataOfModalitie(id)
{
    data = {}
    algorithm_name = ""
    await chargeData()
    
    for(var i=0; i<algorithms.length; i)
    {
        if (algorithms[i].id == id)
        {
            algorithm_name = algorithms[i].name
            break 
        }
    }
    root_dir = ""
    splited_direction = __dirname.split('\\')
    
    for ( var i = 0; i < splited_direction.length; i++)
    {
        if (splited_direction[i] == "src")
        {
            break
        }
        root_dir = root_dir +splited_direction[i] +"/"
    }
    
    if(algorithm_name == "football-simulator-qatar-2022")
    {
        let lineups= {}
        let players = {}
        const tournaments = await readJson(path.join(root_dir,"src/db/scrapper/tournaments_urls_and_local_locations.json"));
        for (var i =0 ; i < tournaments.length ; i ++)
        {
            try {
            var region_lineups= await readJson(path.join(root_dir,"src/db/scrapper/"+tournaments[i].name+"_lineups.json"))
            var region_players = await readJson(path.join(root_dir,"src/db/scrapper/"+tournaments[i].name+"_players.json"))
            lineups[tournaments[i].name]=region_lineups
            players[tournaments[i].name]=region_players
            }
            catch{
                lineups[tournaments[i].name]=[]
                players[tournaments[i].name]=[]
            }
        }    
        data["players"]=players
        data["lineups"]=lineups
    }
    return data
}//Is a function that depends of algorithm type. Charge the necesary data for the algorithm modalities
// It send a request to the api of the algorithm

async function editData( id , data) 
{
    let pythonProcess
    name_algorithm = algorithms[id]["name"]

    if (name_algorithm == "football-simulator-qatar-2022")
    {
        if (data[0]== "lineup")
        {
            let edit = await readJson(path.join(__dirname,"./edit_parameters.json"));
            edit = {}
            edit["team_name"] = data[1]
            edit ["new_lineup"] = data[2]
            await fs.writeFile(path.join(__dirname,"./edit_parameters.json"),JSON.stringify(edit));

            pythonProcess = spawnSync('python',['src/db/scrapper/scrapper.py','edit_lineup','src/db/edit_parameters.json','src/db/edit_results.json']);   
            return await chargeDataOfModalitie(id) 
        }
        else
        {
            if(data[0] == "player")
            {
                let edit = await readJson(path.join(__dirname,"./edit_parameters.json"));
                edit = {}
                edit["player_id"] = data[1].toString()
                edit["player_name"] = data[2]
                await fs.writeFile(path.join(__dirname,"./edit_parameters.json"),JSON.stringify(edit));
                
                pythonProcess =  spawnSync('python',['src/db/scrapper/scrapper.py','add_player','src/db/edit_parameters.json','src/db/edit_results.json']);
                return await chargeDataOfModalitie(id) 
            }
            else
            {
                if (data[0]== "scrap_team")
                {
                    let edit = await readJson(path.join(__dirname,"./edit_parameters.json"));
                    edit = {}
                    edit["team_name"] = data[1]
                    edit["option"] =data[2]
                    await fs.writeFile(path.join(__dirname,"./edit_parameters.json"),JSON.stringify(edit));
                
                    pythonProcess =  spawnSync('python',['src/db/scrapper/scrapper.py','scrap_team','src/db/edit_parameters.json','src/db/edit_results.json']);
                    return await chargeDataOfModalitie(id) 
                }
                else
                {
                    if(data[0]=="scrap_region")
                    {
                    let edit = await readJson(path.join(__dirname,"./edit_parameters.json"));
                    edit = {}
                    edit["region_name"] = data[1]
                    await fs.writeFile(path.join(__dirname,"./edit_parameters.json"),JSON.stringify(edit));
                
                    pythonProcess =  spawnSync('python',['src/db/scrapper/scrapper.py','scrap_region','src/db/edit_parameters.json','src/db/edit_results.json']);
                    console.log("OUT")
                    return await chargeDataOfModalitie(id) 
                    }
                }
            }
        }
    }
    result = pythonProcess.stdout?.toString()?.trim();
    error = pythonProcess.stderr?.toString()?.trim(); 

    const status = result === 'OK';
        
    if(status)
    {
        new_data=  await chargeDataOfModalitie(id)
        return new_data
    }
    else 
    {
        console.log(error);
        return "Server Error";
    }
} // function that handle type of edit data request and send request to api for edit. Depends type of algorithm

async function searchData(id , data)
{
    name_algorithm = algorithms[id]["name"]
    if (name_algorithm == "football-simulator-qatar-2022")
    {
        let search = await readJson(path.join(__dirname,"./search_parameters.json"));
        search = {}
        search["player_name"] = data[0]
        await fs.writeFile(path.join(__dirname,"./search_parameters.json"),JSON.stringify(search));

        const pythonProcess =  spawnSync('python',['src/db/scrapper/scrapper.py','search_player','src/db/search_parameters.json','src/db/search_results.json']); 
        
        result = pythonProcess.stdout?.toString()?.trim();
        error = pythonProcess.stderr?.toString()?.trim();  
        
        const status = result === 'OK';
        
        if(status)
        {
            const buffer = await fs.readFile("src/db/search_results.json");
            const result_parsed = JSON.parse(buffer);
            return result_parsed;
        }
        else 
        {
            console.log(error);
            return "Server Error";
        }
    }
} // function for search data depends algorithm type

async function ovewriteFile(type,data)
{
    if(type =='config')
    {
        await fs.writeFile(path.join(__dirname,"./algorithm_selection.json"),JSON.stringify(data));
    }
    if(type == 'results')
    {
        await fs.writeFile(path.join(__dirname,"./algorithm_results.json"),JSON.stringify(data));
    }
} // function to charge in results or configuration the new file

module.exports =
{
    "chargeData": chargeData,
    "algorithmSelectionJson": algorithmSelectionJson,
    "addAlgorithm": addAlgorithm,
    "removeAlgorithm": removeAlgorithm,
    "editAlgorithm": editAlgorithm,
    "checkDB": checkDb,
    "chargeModalities": chargeModalities,
    "modalitieSelection": modalitieSelection,
    "getId": getId,
    "chargeDataOfModalitie":chargeDataOfModalitie,
    "editData": editData,
    "searchData": searchData,
    "chargeResults": chargeResults,
    "chargeConfig": chargeConfig,
    "ovewriteFile": ovewriteFile,
    "convertData":convertData
}
