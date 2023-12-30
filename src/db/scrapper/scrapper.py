import requests
import json
import ast
import os
from lineups import scrap_lineup
from lineups import get_national_selection_last_lineup
import os
import sys


def search_irregularities(tournament_location,tournament_name): # search for players not convocated in the previous data
    
    selections_file = open(os.getcwd()+"/src/db/scrapper/"+tournament_location+"/"+tournament_name+"_selections.json")
    selections= json.load(selections_file)
    selections_file.close()
    
    players_file = open(os.getcwd()+"/src/db/scrapper/"+tournament_name+"_players.json")
    players= json.load(players_file)
    players_file.close()
    
    
   
    for i in selections.keys():
        count = 0
        Keys = []
        for j in players[i].keys():
            Keys.append(j)
        for j in Keys:
            if count < len(selections[i]["players"]):
                if selections[i]["players"][count]["name"] == j:
                    count+=1
                else:
                    del(players[i][j])
            else:
                del(players[i][j])
    players_file = open(os.getcwd()+"/src/db/scrapper/"+tournament_name+"_players.json",'w')
    json.dump(players,players_file,indent=4)
    players_file.close()
    
def scrapper_player_stats(player_id,player_name , player_nationality, players_old): # method used for collect player stats
    
    out_file_header = open(os.getcwd()+"/src/db/scrapper/headers.txt")
    headers_string = out_file_header.read()
    out_file_header.close()
    HEADERS = ast.literal_eval(headers_string)

    URL="https://api.sofascore.com/api/v1/player/"+str(player_id)+"/attribute-overviews"
    
    player_data = {}
    response = requests.get(URL,headers=HEADERS)
    try:
        atributes_json = response.json()["playerAttributeOverviews"][0]
        if atributes_json["position"] == "G":
            player_data ={
                            "aerial": str(atributes_json["aerial"]),
                            "anticipation": str(atributes_json["anticipation"]),
                            "ballDistribution": str(atributes_json["ballDistribution"]),
                            "position": "G",
                            "saves": str(atributes_json["saves"]),
                            "tactical": str(atributes_json["tactical"])
                            }
        else:
            player_data= {"attack": str(atributes_json["attacking"]),"creativity": str(atributes_json["creativity"]),"defending": str(atributes_json["defending"]),"position": str(atributes_json["position"]),"tactical": str(atributes_json["tactical"]),"technical": str(atributes_json["technical"])}
    except:
        player_data= {}
    try:
        players_old [player_nationality][player_name]= player_data
    except KeyError:
        players_old [player_nationality]={}
        players_old [player_nationality][player_name]= player_data
         
    return players_old  

def scrapper_players_tournament(URL,location): #method used for scrap all players in the tournament url
    out_file_header = open(os.getcwd()+"/src/db/scrapper/headers.txt")
    headers_string = out_file_header.read()
    out_file_header.close()
    HEADERS = ast.literal_eval(headers_string)

    response = requests.get(URL,headers=HEADERS)
    players_json=response.json()['results']
    pages = response.json()['pages']
    out_file = open(os.getcwd()+"/src/db/scrapper/"+location+"/data0.json", "w")
    json.dump(players_json, out_file)
    out_file.close()
    
    part_URL = URL[0: len(URL)-14]
    end_URL = URL[len(URL)-14: len(URL)]
    for i in range(pages-1):
        URL1= part_URL+'&offset='+str(20*(i+1))+end_URL
        response = requests.get(URL1,headers=HEADERS)
        players_json=response.json()['results']
        out_file = open(os.getcwd()+"/src/db/scrapper/"+location+"/data"+str(i+1)+".json", "w")
        json.dump(players_json, out_file)
        out_file.close()
    return pages

def get_national_selections(name,pages):# method used for obtain all actual players in every selection of one tournament
    
    selections= {}
    out_file = open(os.getcwd()+"/src/db/scrapper/tournaments_urls_and_local_locations.json")
    tournaments = json.load(out_file)
    out_file.close()
    
    for i in tournaments:
        if name == i["name"]:
            for j in range(pages):
                 out_file = open(os.getcwd()+"/src/db/scrapper/"+i["location"]+"/data"+str(j)+".json")
                 data = json.load(out_file)
                 out_file.close()
                 for k in range(len(data)):
                     try:
                         selections[data[k]["team"]["slug"]]["players"].append({"name":data[k]["player"]["slug"], "id":data[k]["player"]["id"]})
                     except:
                         selections[data[k]["team"]["slug"]]={"players":[],"id":data[k]["team"]["id"]}
                         selections[data[k]["team"]["slug"]]["players"].append({"name":data[k]["player"]["slug"], "id":data[k]["player"]["id"]})
            selections_file = open(os.getcwd()+"/src/db/scrapper/"+i["location"]+"/"+i["name"]+"_selections.json",'w')
            json.dump(selections, selections_file,indent=4)
            selections_file.close()
            
def scrap_all_national_selections(name): # method for scrap all player stats of all national selections of a tournament
    out_file = open(os.getcwd()+"/src/db/scrapper/tournaments_urls_and_local_locations.json")
    tournaments = json.load(out_file)
    out_file.close()
    
    for i in tournaments:
        if name == i["name"]:
            out_file = open(os.getcwd()+"/src/db/scrapper/"+i["location"]+"/"+i["name"]+"_selections.json")
            selections = json.load(out_file)
            out_file.close()
            for j in selections.keys():
                scrap_selection(i,selections,j)           

def scrap_selection(tournament,selections,team):# auxiliar method for scrap every player of one selection
    data_players = {}
    try:
        players_outfile = open(os.getcwd()+"/src/db/scrapper/"+tournament["name"]+"_players.json")
        data_players = json.load(players_outfile)
    except:
        players_outfile = open(os.getcwd()+"/src/db/scrapper/"+tournament["name"]+"_players.json","w")
        json.dump({},players_outfile, indent=4)
        players_outfile.close()  
    
    players_outfile.close()
                
    for k in selections[team]["players"]:
        player_name = k["name"]
        player_id = k["id"]
        player_nationality = team
        data_players = scrapper_player_stats(player_id,player_name,player_nationality,data_players)
    players_outfile = open(os.getcwd()+"/src/db/scrapper/"+tournament["name"]+"_players.json","w")
    json.dump(data_players, players_outfile,indent=4)
    players_outfile.close()

def create_directory(direction , name):
    try:
        os.mkdir(direction+name)
    except OSError as e:
        return
        
#################### used methods down here #############################

def search_and_actualize_changes(name = "all"):# method for actualize convocatories of all national selections of one zone
    out_file_tournament = open(os.getcwd()+"/src/db/scrapper/tournaments_urls_and_local_locations.json")
    tournaments = json.load(out_file_tournament)
    out_file_tournament.close()
    
    out_file_header = open(os.getcwd()+"/src/db/scrapper/headers.txt")
    headers_string = out_file_header.read()
    out_file_header.close()
    HEADERS = ast.literal_eval(headers_string)
    
    if name == "all":
        for i in tournaments:           
            if i["name"] != "world_cup_qatar_2022":
                create_directory(os.getcwd()+"/src/db/scrapper/",i["location"])
                pages = scrapper_players_tournament(i["URL"],i["location"]) 
                get_national_selections(i["name"],pages)
                scrap_all_national_selections(i["name"])
                search_irregularities(i["location"],i["name"]) 
                scrap_lineup(i["name"],i["URL"],HEADERS)
            else:
                scrap_all_national_selections(i["name"])
                
    else:
        for i in tournaments:
            if i["name"]==name:
                if i["name"] != "world_cup_qatar_2022":
                    create_directory(os.getcwd()+"/src/db/scrapper/",i["location"])
                    pages = scrapper_players_tournament(i["URL"],i["location"])
                    get_national_selections(i["name"],pages)
                    scrap_all_national_selections(i["name"])
                    search_irregularities(i["location"],i["name"])
                    scrap_lineup(i["name"],i["URL"],HEADERS)
                else:
                    scrap_all_national_selections(i["name"])
                break
    
def search_and_actualize_only_one_selection_reboot(name):
    out_file_tournament = open(os.getcwd()+"/src/db/scrapper/tournaments_urls_and_local_locations.json")
    tournaments = json.load(out_file_tournament)
    out_file_tournament.close()
    
    for i in tournaments:
        if i["name"] != "world_cup_qatar_2022":
            out_file = open(os.getcwd()+"/src/db/scrapper/"+i["location"]+"/"+i["name"]+"_selections.json")
            selections = json.load(out_file)
            out_file.close()
            for j in selections.keys():
                if j == name: # edit here if reboot its recently only scrap selection and search last lineup
                    pages = scrapper_players_tournament(i["URL"],i["location"]) 
                    get_national_selections(i["name"],pages)
                    scrap_selection(i,selections,j)
                    search_irregularities(i["location"],i["name"]) 
                    get_national_selection_last_lineup(i["name"],i["URL"],j)
                    return
    
def search_and_actualize_only_one_selection(name): #method used for actualize only one seletion
    out_file_tournament = open(os.getcwd()+"/src/db/scrapper/tournaments_urls_and_local_locations.json")
    tournaments = json.load(out_file_tournament)
    out_file_tournament.close()
    
    for i in tournaments:
        if i["name"] != "world_cup_qatar_2022":
            out_file = open(os.getcwd()+"/src/db/scrapper/"+i["location"]+"/"+i["name"]+"_selections.json")
            selections = json.load(out_file)
            out_file.close()
            for j in selections.keys():
                if j == name:
                    scrap_selection(i,selections,j)
                    return
                
def add_player(player_id,player_name):#method to add a player in his national selection
    out_file_tournament = open(os.getcwd()+"/src/db/scrapper/tournaments_urls_and_local_locations.json")
    tournaments = json.load(out_file_tournament)
    out_file_tournament.close()
    
    out_file_header = open(os.getcwd()+"/src/db/scrapper/headers.txt")
    headers_string = out_file_header.read()
    out_file_header.close()
    HEADERS = ast.literal_eval(headers_string)
    NationURL = "https://api.sofascore.com/api/v1/player/"+str(player_id)+"/national-team-statistics"
    response = requests.get(NationURL,headers=HEADERS)
    
    player_nationality =response.json()["statistics"][0]["team"]["slug"]
    region= ""
    founded = False
    location =""
    for i in tournaments:
        if i["name"] != "world_cup_qatar_2022":
            out_file = open(os.getcwd()+"/src/db/scrapper/"+i["location"]+"/"+i["name"]+"_selections.json")
            selections = json.load(out_file)
            out_file.close()
            for j in selections.keys():
                if j == player_nationality:
                    region = i["name"]
                    location = i["location"]
                    founded = True
                    break
        if founded == True:
            break
        
    out_file = open(os.getcwd()+"/src/db/scrapper/"+region+"_players.json")
    data = json.load(out_file)
    out_file.close()
    
    selections_outfile = open(os.getcwd()+"/src/db/scrapper/"+location +"/"+region+"_selections.json")
    selections = json.load(selections_outfile)
    selections_outfile.close()
        
    data_players = scrapper_player_stats(player_id,player_name,player_nationality,data)
    players_file = open(os.getcwd()+"/src/db/scrapper/"+region+"_players.json",'w')
    json.dump(data_players, players_file,indent=4)
    players_file.close()
    
    for i in selections[player_nationality]["players"]:
        if i["id"] == player_id:
            return
        
    selections[player_nationality]["players"].append({"name":player_name , "id":player_id})
    
    selections_outfile =open(os.getcwd()+"/src/db/scrapper/"+location +"/"+region+"_selections.json", 'w')
    json.dump(selections, selections_outfile,indent=4)
           
def look_for_players(name):# method for search players in sofascore database
    out_file= open(os.getcwd()+"/src/db/scrapper/search_sofascore_url.json")
    URL_file= json.load(out_file)
    out_file.close()
    
    splited_name = name.split(" ")
    URL = URL_file["url"]
    for i in range(len(splited_name)):
        if i == len(splited_name) -1:
            URL += splited_name[i] + "&page=0"
        else:
            URL+= splited_name[i]+"%20"
    
    out_file_header = open(os.getcwd()+"/src/db/scrapper/headers.txt")
    headers_string = out_file_header.read()
    out_file_header.close()
    HEADERS = ast.literal_eval(headers_string)
    
    response = requests.get(URL,headers=HEADERS)
    return  response.json()['results']
    
def edit_lineup(team_name , new_lineup):#method to do a change in a lineup
    out_file_tournament = open(os.getcwd()+"/src/db/scrapper/tournaments_urls_and_local_locations.json")
    tournaments = json.load(out_file_tournament)
    out_file_tournament.close()
    
    region= ""
    founded = False
    for i in tournaments:
        if i["name"] != "world_cup_qatar_2022":
            out_file = open(os.getcwd()+"/src/db/scrapper/"+i["location"]+"/"+i["name"]+"_selections.json")
            selections = json.load(out_file)
            out_file.close()
            for j in selections.keys():
                if j == team_name:
                    region = i["name"]
                    founded = True
                    break
        if founded == True:
            break
        
    out_file = open(os.getcwd()+"/src/db/scrapper/"+region+"_lineups.json")
    data = json.load(out_file)
    out_file.close()
    data[team_name] = new_lineup
    lineups_file = open(os.getcwd()+"/src/db/scrapper/"+region+"_lineups"+".json",'w')
    json.dump(data, lineups_file,indent=4)
    lineups_file.close()



if sys.argv[1]== "scrap_team":
    json_args = open(sys.argv[2])
    data_selection = json.load(json_args)
    if data_selection['option']=='reboot':
        search_and_actualize_only_one_selection_reboot(data_selection["team_name"])
    else:
        search_and_actualize_only_one_selection(data_selection["team_name"])
    
elif sys.argv[1]== "scrap_region":
    json_args = open(sys.argv[2])
    data_selection = json.load(json_args)
    search_and_actualize_changes(data_selection["region_name"])

elif sys.argv[1]== "search_player":
    json_args = open(sys.argv[2])
    data_selection = json.load(json_args)
    response = look_for_players(data_selection["player_name"])
    json_result = json.dumps(response,indent=4)
    with open(sys.argv[3], 'w') as outfile:
        outfile.write(json_result)

elif sys.argv[1]== "add_player":
    json_args = open(sys.argv[2])
    data_selection = json.load(json_args)
    add_player(data_selection["player_id"],data_selection["player_name"])

elif sys.argv[1]== "edit_lineup":
    json_args = open(sys.argv[2])
    data_selection = json.load(json_args)
    edit_lineup(data_selection["team_name"],data_selection["new_lineup"])
    
print("OK")
sys.stdout.flush()  


