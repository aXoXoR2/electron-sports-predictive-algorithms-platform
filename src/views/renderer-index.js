const {ipcRenderer} = require('electron');

ipcRenderer.on('data-algorithms-from-database',(event,args)=>
{
    createAlgorithms(args);
}) // initial data recive from database

ipcRenderer.on('new-data-from-database',(event,args)=>
{
    createAlgorithms(args);
    goStart();
    alert("Data was updated successfully")
}) // actualization event, in case of add or remove some algorithm

ipcRenderer.on('new-data-from-database-added',(event,args)=>
{
    createAlgorithms(args);
    goStart();
    alert("Data was updated successfully")
    ipcRenderer.send('add-archives');

}) // actualization event, in case of add or remove some algorithm

ipcRenderer.on('create-description-section',(event,args)=>
{
    createDescriptions(args);
}) // here recive the algorithm description from database 

function createAlgorithms(algorithms) 
{
var algorithm_lis =''
algorithms.forEach((c)=>
{
    algorithm_lis +=`<li class="p-2 mt-2 card" onclick='changeDescription(${c.id})'>
        <div>
            <p class="fw-bold mb-0"> ${c.name}</p>
            <p class="small text-muted">${c.brief_description}</p>
        </div>
    </li>`
})
document.querySelector('.algorithms').innerHTML=algorithm_lis;
}//create algorithms section

function createDescriptions(descriptions) //create description section
{
var description_lis =''
descriptions.forEach((d)=>
{
    description_lis +=`<div class="d-flex descriptions">
        <div class="w-50">
            <div class="card">
                <div class="card-body">
                  ${d.about}
                </div>
            </div>
        </div>
        <div class="w-50">
        </div>
    </div>
    <div class="d-flex descriptions">
        <div class="w-50">
        </div>
        <div class="w-50 mt-2">
            <div class="card">
                <div class="card-body">
                    ${d.Inputs_and_Outputs}
                </div>
            </div>
        </div>
    </div>
    <button class="btn btn-outline-dark" onclick='showModalitys(${d.id})'>Select</button>`
})
document.querySelector('.descriptions_section').innerHTML=description_lis;
}

function changeDescription(id) // algorithm description request
{
    ipcRenderer.send('description-request',id);
}

function showModalitys(id)
{
    ipcRenderer.send('algorithm-request',id)
}// algorithm modalities request to index.js

function goStart()
{
    document.querySelector('.descriptions_section').innerHTML= `<div class="d-flex descriptions">
        <div>
            <div class="card">
                <div class="card-body">
                    Welcome to the Sport Predictive Platform. 
                        Here, the user has access to some predictive algorithms from 
                        the Artificial Intelligence Research Group at the University of 
                        Havana. The user can interact and use these projects to make 
                        predictions. To do so, select one from the left section and then 
                        click the select button.
                </div>
            </div>
        </div>
    </div>`
}// bottom home interaction

function chargeConfig()
{
    ipcRenderer.send('saved-charge',"config")
}

function chargeResult()
{
    ipcRenderer.send('saved-charge',"results")
}
