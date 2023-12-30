#region imports
import sys
import json
#endregion

#region import projects root archives format : project.(algorithm_name).archive_name
import projects.FIFA_World_Cup_2022.futbol_simulator as FS
#endregion

def run():
    json_args = open(sys.argv[2])
    data_selection = json.load(json_args)
    data = open('src/db/algorithms.json')
    id = int(data_selection["id"])
    data_algorithm =  json.load(data)
    algorithm = data_algorithm[id]
    response = ""
    
    if algorithm["name"]== "football-simulator-qatar-2022":
        modalitie = data_selection["modalitie"].lower()
        teams = data_selection["data"]["teams"]
        groups = data_selection["data"]["groups"]
        players = data_selection["data"]["players"]
        lineups = data_selection["data"]["lineups"]
        FS.run(modalitie,teams,groups,players,lineups)
        with open( "projects/FIFA_World_Cup_2022/results.json") as outfile:
            response = json.load(outfile)
        
    json_result = json.dumps(response,indent=4)
    with open(sys.argv[3], 'w') as outfile:
        outfile.write(json_result)

if sys.argv[1]== "run":
    run()
print("OK")
sys.stdout.flush()
