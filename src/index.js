//#region imports
const {app, BrowserWindow,ipcMain, Menu} =require('electron');
const path = require('path');
const { run} = require ('./js_algorithm_runner.js');
const { exit } = require('process');
const { algorithmSelectionJson,chargeData,removeAlgorithm,editAlgorithm,addAlgorithm} = require ('./db/db_managment.js');
//#endregion

let primaryWindow
let addWindow
let editWindow
let removeWindow
let algorithms_and_descriptions

function createPrimaryWindow()
{
    primaryWindow = new BrowserWindow(
    {
        width: 1000,
        height: 1000,
        webPreferences :
        {
            nodeIntegration:true,
            contextIsolation:false
        }
    })
    primaryWindow.loadFile(path.join(__dirname, "views/index.html"));

    const primaryMenu = Menu.buildFromTemplate(primaryMenuTemplate);
    Menu.setApplicationMenu(primaryMenu);

    primaryWindow.on('closed', ()=>
    {
        app.quit();
    })// if primary window it's closed, all app will be shut down
    
    primaryWindow.webContents.on('did-finish-load', async()=>
    {
        algorithms_and_descriptions = await chargeData();
        primaryWindow.webContents.send('data-algorithms-from-database', algorithms_and_descriptions[0]);
    })// if primary window its charged, database it's readed and send it to the index.html file
    
    ipcMain.on('description-request', (event,id)=>
    {
        primaryWindow.webContents.send('create-description-section',[algorithms_and_descriptions[1][id]]);
    })// handle algorithm description request

    ipcMain.on('execute-algorithm-request', async(event,id)=>
    {
        await algorithmSelectionJson(id.toString())
        await run()
    })//handle algorithm execution request
}// app primary window

function createAddWindow()
{
    addWindow = new BrowserWindow(
        {
            width: 400,
            height: 400,
            webPreferences :
            {
                nodeIntegration:true,
                contextIsolation:false
            }
        })
    addWindow.setMenu(null);
    addWindow.loadFile(path.join(__dirname, 'views/addAlgorithm.html'));
    addWindow.on('closed',()=>
    {
        addWindow=null;
    })

    ipcMain.on('new-algorithm', async(event,name,lenguage,brief_description,about,Inputs_and_Outputs)=>
{
    await addAlgorithm(name,lenguage,about,brief_description,Inputs_and_Outputs);
    algorithms_and_descriptions = await chargeData();
    primaryWindow.webContents.send('new-data-from-database',algorithms_and_descriptions[0]);
})// it's added the new algorithm and description

}// window that serve to add an algorithm

function createEditWindow()
{
    editWindow = new BrowserWindow(
        {
            width: 400,
            height: 400,
           webPreferences :
            {
                nodeIntegration:true,
                contextIsolation:false
            }
        })
    //editWindow.setMenu(null);
    editWindow.loadFile(path.join(__dirname, 'views/editAlgorithm.html'));
    editWindow.on('closed',()=>
    {
        editWindow=null;
    })

    editWindow.webContents.on('did-finish-load',()=>
    {
        editWindow.webContents.send('create-algorithm-list',algorithms_and_descriptions[0]);
    })

    ipcMain.on('edited-algorithm', async(event,id,name,lenguage,brief_description,about,Inputs_and_Outputs)=>
{
    await editAlgorithm(id,name,lenguage,brief_description,about,Inputs_and_Outputs)
    algorithms_and_descriptions = await chargeData()
    primaryWindow.webContents.send('new-data-from-database',algorithms_and_descriptions[0]);
    editWindow.webContents.send('new-data-from-database-edited',algorithms_and_descriptions[0],algorithms_and_descriptions[1]);

    }) // it's edited the designed algorithm

    ipcMain.on('information-request', async(event,id)=>
    {
    editWindow.webContents.send('all-algorithm-information',algorithms_and_descriptions[0][id],algorithms_and_descriptions[1][id]);
    })
}// window that serve to edit an algorithm

function createRemoveWindow()
{
    removeWindow = new BrowserWindow(
        {
            width: 400,
            height: 400,
            webPreferences :
            {
                nodeIntegration:true,
                contextIsolation:false
            }
        })
    //removeWindow.setMenu(null);
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
    algorithms_and_descriptions = await chargeData();
    primaryWindow.webContents.send('new-data-from-database',algorithms_and_descriptions[0]);
    removeWindow.webContents.send('new-data-from-database-removed',algorithms_and_descriptions[0]);
}) // it's removed the algorithm and description

}// window that serve to remove an algorithm

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
                accelerator: process.platform == 'darwin' ? 'command + Q' :'Ctrl+Q'
            }
        ]
    }
]// Window's Menu conformation

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