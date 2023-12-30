import json
import os


def run (name , teams , groups,players,lineups):
    with open(os.getcwd()+'/projects/FIFA_World_Cup_2022/groups.json','w') as f: 
        json.dump(groups, f,indent=4)
    with open(os.getcwd()+'/projects/FIFA_World_Cup_2022/teams_simulation.json','w') as f:
        json.dump(teams, f,indent=4)  
    with open(os.getcwd()+'/projects/FIFA_World_Cup_2022/data.json','w') as f: 
        json.dump(players, f,indent=4)
    with open(os.getcwd()+'/projects/FIFA_World_Cup_2022/lineups.json','w') as f:
        json.dump(lineups, f,indent=4)   
    os.system('python '+os.getcwd()+"/projects/FIFA_World_Cup_2022/"+name+'.py')
    
