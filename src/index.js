//#region imports
const {app, BrowserWindow,ipcMain, Menu,screen} =require('electron');
const path = require('path');
const {spawnSync} = require("child_process");
const { run} = require ('./js_algorithm_runner.js');
const { exit, config } = require('process');
const {convertData,ovewriteFile,chargeConfig,chargeResults, editData,chargeDataOfModalitie,getId,modalitieSelection,chargeModalities,algorithmSelectionJson,chargeData,removeAlgorithm,editAlgorithm,addAlgorithm, checkDB, searchData} = require ('./db/db_managment.js');
const {opneFile,chargeFiles,createArchive} = require('./directories_and_archives_handler.js')
//#endregion

//#region global variables
let primaryWindow = []
let addWindow
let editWindow
let removeWindow
let algorithms_and_descriptions
let modalities
//#endregion

function createPrimaryWindow()
{
    const {width, height} = screen.getPrimaryDisplay().workAreaSize
    primaryWindow.push( new BrowserWindow(
    {
        width,
        height,
        webPreferences :
        {
            nodeIntegration:true,
            contextIsolation:false
        }
    }))
    primaryWindow[0].loadFile(path.join(__dirname, "views/index.html"));
    const primaryMenu = Menu.buildFromTemplate(primaryMenuTemplate);
    const menuResult = Menu.buildFromTemplate(MenuResult);
    Menu.setApplicationMenu(primaryMenu);

    primaryWindow[0].on('closed', ()=>
    {
        app.quit();
    })// if primary window it's closed, all app will be shut down
    
    primaryWindow[0].webContents.on('did-finish-load', async()=>
    {
        algorithms_and_descriptions = await chargeData();
        primaryWindow[0].webContents.send('data-algorithms-from-database', algorithms_and_descriptions[0]);
    })// if primary window its charged, database it's readed and send it to the index.html file
    
    ipcMain.on('description-request', (event,id)=>
    {
        primaryWindow[0].webContents.send('create-description-section',[algorithms_and_descriptions[1][id]]);
    })// handle algorithm description request

    ipcMain.on('execute-algorithm-request', async(event,name_modalitie,data)=>
    {
        const id = await getId();
        primaryWindow[0].webContents.send('wait-until-done');
        await modalitieSelection(name_modalitie,data);
        await run(algorithms_and_descriptions[0][id]["lenguage"]);
        const direction = 'views/'+algorithms_and_descriptions[0][id]["name"]+ '/'+algorithms_and_descriptions[0][id]["name"]+'_results.html'
        Menu.setApplicationMenu(menuResult)
        primaryWindow[0].loadFile(path.join(__dirname, direction));
        ipcMain.on('result-comunication', async()=>
        {
            await convertData()
            let results = await chargeResults()
            primaryWindow[0].webContents.send('results-csv',results);
        })
        //enviar los resultados de la ejecución
    })//handle algorithm execution request

    ipcMain.on('charge-view-request', async(event,type)=>
    { 
        Menu.setApplicationMenu(null)
        const id = await getId();
        const direction = 'views/'+algorithms_and_descriptions[0][id]["name"]+ '/'+algorithms_and_descriptions[0][id]["name"]+type+'.html';
        primaryWindow[0].loadFile(path.join(__dirname, direction));
        ipcMain.on('server', async function charge()
        {
            let modalities = await chargeModalities()
            let data_to_show = await chargeDataOfModalitie(id)
            primaryWindow[0].webContents.send('modalities-data',modalities[id]['modalities'],data_to_show);
            ipcMain.removeListener('server',charge)
    })})// charge specifics views form a project

    ipcMain.on('config-details', async()=>
    {
        const config = await chargeConfig()
        primaryWindow[0].webContents.send('show-config',config)
    }) //function that handle simulation configuration request

    ipcMain.on('edit-data-request', async(event,data)=>
    {
        let id = await getId();
        let new_data= await editData(id,data)
        primaryWindow[0].webContents.send('data-edited',new_data , data)
    }) // function that handel request for edit that

    ipcMain.on('search-data-request', async(event,data)=>
    {
        let id = await getId();
        let new_data= await searchData(id,data)
        primaryWindow[0].webContents.send('data-founded',new_data)
    })// function that handle request for search data

    ipcMain.on('save-config' , async(event,modalitie,data)=>
    {
        configuration = {"algorithm": algorithm_name , "modalitie": modalitie, "data":data}
        createSaveFileWindow("config",configuration)
    }) //function for save configuration botton

    ipcMain.on('send-index', async(event,index,files,type)=>
    {
        primaryWindow[1].close()
        if(type == 'results')
        {
            var rute = path.join(__dirname, '../results_saved/'+files[index]);
        }
        if(type == 'config')
        {
            var rute = path.join(__dirname, '../config_saved/'+files[index]);
        }
        var data = await opneFile(rute)
        var algorithm_name = data["algorithm"]
        delete data.algorithm
        
        if(type == 'results')
        {
            await ovewriteFile(type,data["results"])
            let new_configuration = data["configuration"]
            let id 
            for (var i=0; i<algorithms_and_descriptions[0].length;i++)
            {
                if(algorithms_and_descriptions[0][i]["name"]==algorithm_name)
                {
                    id = i
                    new_configuration["id"] = i.toString()
                    break
                }
            }
            await ovewriteFile("config",new_configuration)
            primaryWindow[0].setMenu(menuResult)
            primaryWindow[0].loadFile(path.join(__dirname,'views/'+algorithm_name+'/'+algorithm_name+'_results.html'))
            ipcMain.on('result-comunication', async()=>
            {
                await convertData(); 
                let results = await chargeResults()
                primaryWindow[0].webContents.send('results-csv',results);
            })
        }
        if(type == 'config')
        {
            let id 
            for (var i=0; i<algorithms_and_descriptions[0].length;i++)
            {
                if(algorithms_and_descriptions[0][i]["name"]==algorithm_name)
                {
                    id = i
                    data["id"] = i.toString()
                    break
                }
            }
            await ovewriteFile(type,data)
            primaryWindow[0].loadFile(path.join(__dirname,'views/'+algorithm_name+'/'+algorithm_name+'.html'))
            ipcMain.on('server', async function charge()
            {
                modalities = await chargeModalities()
                let data_to_show = await chargeDataOfModalitie(id)
                await primaryWindow[0].webContents.send('modalities-data',modalities[id]['modalities'],data_to_show,false);
                await primaryWindow[0].webContents.send('preview-view',data);
                ipcMain.removeListener('server', charge)
            })
        }     
    }) // function that reciveves file index to be charged and execute operations to be cahrged

    ipcMain.on('saved-charge',async(event,type)=>
    {
        if(!primaryWindow[1])
        {
        primaryWindow.push(new BrowserWindow(
            {
                width:400,
                height:400,
                webPreferences :
                {
                    nodeIntegration:true,
                    contextIsolation:false
                }
            }))}
        else{
        primaryWindow[1] = new BrowserWindow(
            {
                width:400,
                height:400,
                webPreferences :
                {
                    nodeIntegration:true,
                    contextIsolation:false
                }
            })
        }
        Menu.setApplicationMenu(null)
        primaryWindow[0].setMenu(primaryMenu)
        var files_list
        if(type == 'results')
        {
            files_list = await chargeFiles("results")
        }
        if(type == 'config')
        {
            files_list = await chargeFiles("config")
        }
        
        primaryWindow[1].loadFile(path.join(__dirname, 'views/chargeFile.html'));
        ipcMain.on('charger-ready',function createInterface()
        {
            primaryWindow[1].webContents.send('create-interface',files_list,type)
            ipcMain.removeListener('charger-ready',createInterface)
        })
    }) //function that create a secondary window for charge files

    ipcMain.on('algorithm-request', async(event,id)=>
    {
        await algorithmSelectionJson(id)
        Menu.setApplicationMenu(null)
        const direction = 'views/'+algorithms_and_descriptions[0][id]["name"]+ '/'+algorithms_and_descriptions[0][id]["name"]+'.html';
        primaryWindow[0].loadFile(path.join(__dirname, direction));
        ipcMain.on('server', async function charge()
        {      
            modalities = await chargeModalities()
            let data_to_show = await chargeDataOfModalitie(id)
            await primaryWindow[0].webContents.send('modalities-data',modalities[id]['modalities'],data_to_show,true);
            ipcMain.removeListener('server', charge)
        })
    })// handle modalities request, charge the new html and active comunication with it.  

    ipcMain.on('go-home',async()=>
    {
        primaryWindow[0].setMenu(primaryMenu)
        primaryWindow[0].loadFile(path.join(__dirname, "views/index.html"));
        algorithms_and_descriptions = await chargeData();
        primaryWindow[0].webContents.send('data-algorithms-from-database', algorithms_and_descriptions[0]);
    });// to go home page

}// app primary window

function createAddWindow()
{
    addWindow = new BrowserWindow(
        {
            width: 600,
            height: 600,
            webPreferences :
            {
                nodeIntegration:true,
                contextIsolation:false
            },

        })
    addWindow.setMenu(null);
    addWindow.loadFile(path.join(__dirname, 'views/addAlgorithm.html'));
    addWindow.on('closed',()=>
    {
        addWindow=null;
    })

    ipcMain.on('new-algorithm', async(event,name,lenguage,brief_description,about,Inputs_and_Outputs)=>
{
    await addAlgorithm(name,lenguage,brief_description,about,Inputs_and_Outputs);
    await checkDB();
    algorithms_and_descriptions = await chargeData();
    primaryWindow[0].webContents.send('new-data-from-database-added',algorithms_and_descriptions[0]);
    addWindow.close();

})// it's added the new algorithm and description

}// window that serve to add an algorithm

function createEditWindow()
{
    editWindow = new BrowserWindow(
        {
            width: 600,
            height: 600,
           webPreferences :
            {
                nodeIntegration:true,
                contextIsolation:false
            },
        })
    editWindow.setMenu(null);
    editWindow.loadFile(path.join(__dirname, 'views/editAlgorithm.html'));
    editWindow.on('closed',()=>
    {
        editWindow=null;
    })

    editWindow.webContents.on('did-finish-load',()=>
    {
        editWindow.webContents.send('create-algorithm-list',algorithms_and_descriptions[0]);
    });

    ipcMain.on('information-request',(event,id)=>
    {
        editWindow.webContents.send('all-algorithm-information',algorithms_and_descriptions[0][id],algorithms_and_descriptions[1][id]);
    })

    ipcMain.on('edited-algorithm', async(event,id,name,lenguage,brief_description,about,Inputs_and_Outputs)=>
    {
        await editAlgorithm(id,name,lenguage,brief_description,about,Inputs_and_Outputs)
        algorithms_and_descriptions = await chargeData()
        primaryWindow.webContents.send('new-data-from-database',algorithms_and_descriptions[0]);
        editWindow.close();
    })// it's edited the designed algorithm

}// window that serve to edit an algorithm

function createRemoveWindow()
{
    removeWindow = new BrowserWindow(
        {
            width: 600,
            height: 600,
            webPreferences :
            {
                nodeIntegration:true,
                contextIsolation:false
            },
        })
    removeWindow.setMenu(null);
    removeWindow.loadFile(path.join(__dirname, 'views/removeAlgorithm.html'));
    removeWindow.on('closed',()=>
    {
        removeWindow=null;
    })

    removeWindow.webContents.on('did-finish-load',()=>
    {
        removeWindow.webContents.send('create-algorithm-list',algorithms_and_descriptions[0]);
    })
    
    ipcMain.on('remove-algorithm-request', async(event,id)=>
{
    await removeAlgorithm(id);
    await checkDB();
    algorithms_and_descriptions = await chargeData();
    primaryWindow[0].webContents.send('new-data-from-database',algorithms_and_descriptions[0]);
    removeWindow.close();
}) // it's removed the algorithm and description

}// window that serve to remove an algorithm

function createSaveFileWindow(type,data) // window used for recieve file name to save
{
    let addFileWindow = new BrowserWindow(
        {
            width: 400,
            maxHeight: 400,
            maxWidth :400,
            minHeight :400,
            minWidth :400,
            height: 400,
            webPreferences :
            {
                nodeIntegration:true,
                contextIsolation:false
            },

        })
    addFileWindow.setMenu(null);
    addFileWindow.loadFile(path.join(__dirname, 'views/saveFile.html'));
    addFileWindow.on('closed',()=>
    {
        addFileWindow=null;
    })

    addFileWindow.webContents.on('did-finish-load',()=>
    {
        addFileWindow.webContents.send('create-interface');
    })   

    ipcMain.on('send-name', async function save(event,file_name)
    {
        if (type == "results")
        {
            let direction = path.join(__dirname, '../results_saved')
            await createArchive(file_name,direction,data)
        }
        if(type == "config")
        {
            let direction = path.join(__dirname, '../config_saved')
            await createArchive(file_name,direction,data)
        }    
        ipcMain.removeListener('send-name',save); 
        addFileWindow.close()
    })
}

async function saveResults()// save results function from Menu
{
    let results = await chargeResults();
    let config = await chargeConfig();
    delete config.id;
    let data = {}
    const id =await getId();

    data["algorithm"] = algorithms_and_descriptions[0][id]["name"];
    data["results"] = results;
    data["configuration"] = config
    createSaveFileWindow("results",data);
}

async function saveConfiguration()// save configuration function from Menu
{
    let id = await getId();
    let algorithm_name = algorithms_and_descriptions[0][id]["name"]

    let configuration = await chargeConfig();
    delete configuration.id;
    configuration["algorithm"] = algorithm_name

    createSaveFileWindow("config",configuration)
}

let primaryMenuTemplate = [
    {
        label: 'File',
        submenu:[
            {
                label: 'Add Algorithms',
                accelerator: process.platform == 'darwin' ? 'command + T' :'Ctrl+T',
                click()
                {
                    createAddWindow();
                }
            },
            {
                label: 'Edit Algorithms',
                accelerator: process.platform == 'darwin' ? 'command + Y' :'Ctrl+Y',
                click()
                {
                    createEditWindow();
                }
            },
            {
                label: 'Remove Algorithms',
                accelerator: process.platform == 'darwin' ? 'command + U' :'Ctrl+U',
                click()
                {
                    createRemoveWindow();
                }
            },
            {
                label: 'Exit',
                accelerator: process.platform == 'darwin' ? 'command + Q' :'Ctrl+Q',
                click()
                {
                    app.exit();
                }
            }
        ]
    }
]// Window's Menu conformation

let MenuResult =[
    {
        label : 'File',
        submenu : [
            {
                label : 'Save Results',
                accelerator: process.platform == 'darwin' ? 'command + S' :'Ctrl+S',
                click ()
                {
                    saveResults();
                }
            },
            {
                label : 'Save Configuration',
                accelerator: process.platform == 'darwin' ? 'command + D' :'Ctrl+D',
                click()
                {
                    saveConfiguration();
                }
            }
        ]
    }
] // window's Menu Save and charge 

if (process.platform === 'darwin')
{
    primaryMenuTemplate.unshift(
        {
            label: app.getName(),
        }
    )
}// Mac diferrences

if (process.env.NODE_ENV !== 'production')
{
    primaryMenuTemplate.push(
        {
            label: 'Dev Tools',
            submenu:
            [
                {
                    label: 'Show/Hide Dev Tools',
                    click(item,focussedWindow)
                    {
                        focussedWindow.toggleDevTools();
                    }
                },
                {
                    role: 'reload'
                }
            ]
        }
    )
}// Dev Tools added

app.whenReady().then(createPrimaryWindow) // if all it's ready the aplication will show the primary window
