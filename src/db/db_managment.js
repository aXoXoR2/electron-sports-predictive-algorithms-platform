const fs = require('fs/promises');
const path = require('path');
const { stringify } = require('querystring');
const {spawnSync} = require("child_process");
const { request } = require('http');

let algorithms;
let descriptions;
let modalities

async function chargeModalities()
{
    modalities = await readJson(path.join(__dirname,"./algorithms_modalities.json"));
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

async function modalitieSelection(modalitie,data,id)
{
    await chargeData()
    const algorithmSelection = await readJson(path.join(__dirname,"./algorithm_selection.json"));
    algorithmSelection['modalitie'] = modalitie.toString();
    algorithmSelection["data"] = data
    algorithmSelection['algorithm'] = algorithms[id]["name"]
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

async function addAlgorithm(name,lenguage,brief_description,about,Inputs_and_Outputs,Modalities) 
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
    let modalitie = Modalities.split(',')
    
    modalities.push(
        {
            'id':modalities.length.toString(),
            'modalities': modalitie
        }
    )
    await fs.writeFile(path.join(__dirname,"./algorithms.json"),JSON.stringify(algorithms));
    await fs.writeFile(path.join(__dirname,"./descriptions.json"),JSON.stringify(descriptions));
    await fs.writeFile(path.join(__dirname,"./algorithms_modalities.json"),JSON.stringify(modalities));
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
    await await fs.writeFile(path.join(__dirname,"./algorithms_modalities.json"),JSON.stringify(modalities));
}// function to remove algorithm from database

async function editAlgorithm(id,name,lenguage,brief_description,about,Inputs_and_Outputs,Modalities)
{
    await chargeData()

    algorithms[id]['id'] = id.toString(),
    algorithms[id]['name'] = name,
    algorithms[id]['lenguage']= lenguage,
    algorithms[id]['brief_description']= brief_description

    descriptions[id]['id']= id.toString(),
    descriptions[id]['about'] = about,
    descriptions[id]['Inputs_and_Outputs']= Inputs_and_Outputs

    let modalitie = Modalities.split(',')
    
    modalities[id]["modalities"] = modalitie

    await fs.writeFile(path.join(__dirname,"./algorithms.json"),JSON.stringify(algorithms));
    await fs.writeFile(path.join(__dirname,"./descriptions.json"),JSON.stringify(descriptions));
    await fs.writeFile(path.join(__dirname,"./algorithms_modalities.json"),JSON.stringify(modalities));
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
async function convertData(id)
{
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
    if(algorithm_name == "football-simulator-qatar-2022")
    {
        const conversion = await spawnSync('python',['src/db/data_converter.py','json_to_csv']);
        const images = await spawnSync('python',['src/db/data_converter.py','create_images']);
    } 
    
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
    if(algorithm_name == "football-simulator-qatar-2022")
    {
        edit = {}
        let lineups= {}
        let players = {}
        let buffer
        let result_parsed

        try 
        {
            edit["request"] = "get_data"
            edit["type"] = "lineups"
            await fs.writeFile(path.join(__dirname,"./edit_parameters.json"),JSON.stringify(edit));
            var pythonProcess= await spawnSync('python',['src/db/scrapper/handler_scrapper.py', "request_handler",'src/db/edit_parameters.json','src/db/edit_results.json']);
            
            result = pythonProcess.stdout?.toString()?.trim();
            error = pythonProcess.stderr?.toString()?.trim();  
        
            let status = result === 'OK';
            
            if(status)
            {
                buffer = await fs.readFile("src/db/edit_results.json");
                result_parsed = JSON.parse(buffer);
            }
            else 
            {
                console.log(error);
                return "Server Error";
            }
            
            lineups=result_parsed

            edit = {}
            edit["request"] = "get_data"
            edit["type"] = "players"
            await fs.writeFile(path.join(__dirname,"./edit_parameters.json"),JSON.stringify(edit));
            var pythonProcess = await spawnSync('python',['src/db/scrapper/handler_scrapper.py', "request_handler",'src/db/edit_parameters.json','src/db/edit_results.json']);
            
            result = pythonProcess.stdout?.toString()?.trim();
            error = pythonProcess.stderr?.toString()?.trim();  
        
            status = result === 'OK';
            
            if(status)
            {
                buffer = await fs.readFile("src/db/edit_results.json");
                result_parsed = JSON.parse(buffer);
            }
            else 
            {
                console.log(error);
                return "Server Error";
            }
            
            players=result_parsed       
        }
        catch
        {
            console.log("Error reading data from scrapper")
        }  
        data["players"]=players
        data["lineups"]=lineups
    }

    return data
}//Is a function that depends of algorithm type. Charge the necesary data for the algorithm modalities
// It send a request to the api of the algorithm

async function editData(id , data) 
{
    let pythonProcess
    name_algorithm = algorithms[id]["name"]

    if (name_algorithm == "football-simulator-qatar-2022")
    {
        let edit = await readJson(path.join(__dirname,"./edit_parameters.json"));
        edit = {}
        if (data[0]== "lineup")
        {
            if(!data[2])
            {
                edit["request"] = "last_lineup"
                edit["team_name"] = data[1]
            }
            else{
                edit["request"] = "edit_lineup"
            edit["team_name"] = data[1]
            edit ["new_lineup"] = data[2]
            }
        }
        else
        {
            if(data[0] == "player")
            {
                edit["request"] = "add_player"
                edit["player_id"] = data[1]
                edit["player_name"] = data[2]
            }
            else
            {
                if (data[0]== "scrap_team")
                {
                    edit["request"] = "scrap_team"
                    edit["team_name"] = data[1]
                    edit["option"] =data[2]
                }
                else
                {
                    if(data[0]=="scrap_region")
                    {
                    edit["request"] = "scrap_region"
                    edit["region_name"] = data[1]
                    }
                }
            }
        }

        await fs.writeFile(path.join(__dirname,"./edit_parameters.json"),JSON.stringify(edit));
        pythonProcess = spawnSync('python',['src/db/scrapper/handler_scrapper.py','request_handler','src/db/edit_parameters.json','src/db/edit_results.json']);   
        return await chargeDataOfModalitie(id) 
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
        let search = await readJson(path.join(__dirname,"./edit_parameters.json"));
        search = {}
        search["request"] = "search_player"
        search["player_name"] = data[0]
        await fs.writeFile(path.join(__dirname,"./edit_parameters.json"),JSON.stringify(search));

        const pythonProcess =  spawnSync('python',['src/db/scrapper/handler_scrapper.py','request_handler','src/db/edit_parameters.json','src/db/edit_results.json']); 
        
        result = pythonProcess.stdout?.toString()?.trim();
        error = pythonProcess.stderr?.toString()?.trim();  
        
        const status = result === 'OK';
        
        if(status)
        {
            const buffer = await fs.readFile("src/db/edit_results.json");
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
