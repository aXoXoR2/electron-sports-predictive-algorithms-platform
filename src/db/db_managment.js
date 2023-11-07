const fs = require('fs/promises');
const path = require('path');
const { stringify } = require('querystring');

let algorithms;
let descriptions;

async function chargeData()
{
    algorithms= await readJson(path.join(__dirname,"./algorithms.json"));
    descriptions = await readJson(path.join(__dirname,"./descriptions.json"));
    return [algorithms,descriptions]
}
//function to charge data from database

async function readJson(rute)
{
    const dataJson = await fs.readFile(rute);
    const data = JSON.parse(dataJson);
    return data;
}// tool for read json

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

module.exports =
{
    "chargeData": chargeData,
    "algorithmSelectionJson": algorithmSelectionJson,
    "addAlgorithm": addAlgorithm,
    "removeAlgorithm": removeAlgorithm,
    "editAlgorithm": editAlgorithm
}