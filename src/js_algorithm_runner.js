const {spawnSync} = require("child_process");
const {opneFile,createArchive} = require('./directories_and_archives_handler.js')

async function run(lenguage,configuration)
{  
    let result='';
    let error ='';
    // cambiar direcciones de los resultados y entrada de datos de ser ncesario. Pueden ser recibidos por el metodo las direcciones
    if(lenguage === 'python')
    {
    await createArchive("configuration","projects/",configuration)
    const pythonProcess = await spawnSync('python',['projects/algorithm_selector.py','run','projects/configuration.json','projects/results.json']); 
    

    result = pythonProcess.stdout?.toString()?.trim();
    error = pythonProcess.stderr?.toString()?.trim(); 
    }  
    const status = result === 'OK';
    
    if(status)
    {
        const result_parsed = opneFile("projects/results.json")
        return result_parsed;
    }
    else 
    {
        console.log(error);
        return "Server Error";
    }
}

module.exports = {"run":run}