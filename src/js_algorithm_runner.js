const {spawnSync} = require("child_process");
const fs = require('fs/promises');

async function run()
{  
    const pythonProcess = await spawnSync('python',['algorithm_selector.py','run','src/db/algorithm_selection.json','src/db/algorithm_results.json']); 
    

    const result = pythonProcess.stdout?.toString()?.trim();
    const error = pythonProcess.stderr?.toString()?.trim(); 
    
    const status = result === 'OK';
    
    if(status)
    {
        const buffer = await fs.readFile("src/json/algorithm_results.json");
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