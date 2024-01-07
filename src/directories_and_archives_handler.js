const fs = require('fs/promises');
const path = require('path');
const my_fs = require('fs')

async function createDir(name,direction)
{
    await fs.mkdir(path.join(direction,name),
    {
        recursive : true,
    });
} // directory creation on direction with specified name

async function createArchive(name,direction,data)
{
    const pathToFile = path.join(direction, name+".json");
    await fs.writeFile(pathToFile, JSON.stringify(data));
}// function to create json archives

async function chargeFiles(type)
{
    let directoryPath= ""
   
    if(type == "config")
    {
        directoryPath = path.join(__dirname,"../config_saved")
    }
    if(type == "results")
    {
        directoryPath = path.join(__dirname,"../results_saved")
    }
    try
    {
        var ls=my_fs.readdirSync(directoryPath);
        return ls
     }
     catch(e)
     {
        console.log("error "+ e)
     }
}// function to get result or config files

async function opneFile( rute)
{
    const dataJson = await fs.readFile(rute);
    const data = JSON.parse(dataJson);
    return data;
}// function to charhe a reusult or config archives

module.exports =
{
    "createDir": createDir,
    "createArchive": createArchive,
    "chargeFiles":chargeFiles,
    "opneFile":opneFile
}
