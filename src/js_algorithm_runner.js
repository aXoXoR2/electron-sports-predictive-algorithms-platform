const {spawnSync} = require("child_process");
const fs = require('fs/promises');

async function run(lenguage)
{  
    let result='';
    let error ='';
    // cambiar direcciones de los resultados y entrada de datos de ser ncesario. Pueden ser recibidos por el metodo las direcciones
    if(lenguage === 'python')
    {
    const pythonProcess = await spawnSync('python',['algorithm_selector.py','run','src/db/algorithm_selection.json','src/db/algorithm_results.json']); 
    

    result = pythonProcess.stdout?.toString()?.trim();
    error = pythonProcess.stderr?.toString()?.trim(); 
    }  
    const status = result === 'OK';
    
    if(status)
    {
        const buffer = await fs.readFile("src/db/algorithm_results.json");
        const result_parsed = JSON.parse(buffer);
        return result_parsed.toString();
    }
    else 
    {
        console.log(error);
        return "Server Error";
    }
}

module.exports = {"run":run}