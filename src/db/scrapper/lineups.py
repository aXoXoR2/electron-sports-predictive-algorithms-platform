import requests
import json
import ast
import os

def get_lineup(players):
    lineup = { "att" :[],"def" :[],"goalkeeper" :"","mid" :[]}
    count = 0
    for i in players:
        player = i["player"]
        player_slug,player_position = player["slug"], player["position"]
        if player_position == "G":
            lineup["goalkeeper"] = player_slug
        if player_position == "F":
            lineup["att"].append(player_slug)
        if player_position == "M":
            lineup["mid"].append(player_slug)
        if player_position == "D":
            lineup["def"].append(player_slug)
        count +=1
        if count == 11:
            break
    return lineup
        
    parts = url.split("/")
    return (parts[6],parts[8])

def get_lineups(lineups, team_id,team_slug,HEADERS):
   
    URL_TEAM = "https://api.sofascore.com/api/v1/team/"+str(team_id)+"/performance"
    response = requests.get(URL_TEAM,headers=HEADERS)
    team_last_matches = response.json()["events"]
    last_match_id = team_last_matches[len(team_last_matches)-1]["id"]
    URL_LINUP = "https://api.sofascore.com/api/v1/event/"+str(last_match_id)+"/lineups"
    response = requests.get(URL_LINUP,headers=HEADERS) 
    team_lineups = response.json()
   
    NationURL = "https://api.sofascore.com/api/v1/player/"+str(team_lineups["away"]["players"][0]["player"]["id"])+"/national-team-statistics"
    response = requests.get(NationURL,headers=HEADERS)
    player_nationality =response.json()["statistics"][0]["team"]["slug"]
    
    if player_nationality== team_slug:
        players= team_lineups["away"]["players"]
    else:
        players= team_lineups["home"]["players"]
    lineup = get_lineup(players)
    lineups[team_slug] = lineup
    
    return lineups
    
def scrap_lineup(name,HEADERS):
    
    lineups={}
    out_file_tournament = open(os.getcwd()+"/src/db/scrapper/tournaments_urls_and_local_locations.json")
    tournaments = json.load(out_file_tournament)
    out_file_tournament.close()
    
    for i in tournaments:
            if i["name"]==name:
                out_file = open(os.getcwd()+"/src/db/scrapper/"+i["location"]+"/"+i["name"]+"_selections.json")
                selections = json.load(out_file)
                out_file.close()
                for j in selections.keys():
                    lineups = get_lineups(lineups,selections[j]["id"],j,HEADERS)
        
    lineup_file = open(os.getcwd()+"/src/db/scrapper/"+ name+"_lineups"+".json",'w')
    json.dump(lineups, lineup_file,indent=4)
    lineup_file.close()

def get_national_selection_last_lineup(team_name):
    
    
    out_file_header = open(os.getcwd()+"/src/db/scrapper/headers.txt")
    headers_string = out_file_header.read()
    out_file_header.close()
    HEADERS = ast.literal_eval(headers_string)
    
    out_file_tournament = open(os.getcwd()+"/src/db/scrapper/tournaments_urls_and_local_locations.json")
    tournaments = json.load(out_file_tournament)
    out_file_tournament.close()
    
    for i in tournaments:
        if i["name"] != "world_cup_qatar_2022":
            out_file = open(os.getcwd()+"/src/db/scrapper/"+i["location"]+"/"+i["name"]+"_selections.json")
            selections = json.load(out_file)
            out_file.close()
            for j in selections.keys():
                if j == team_name:
                    lineup_file = open(os.getcwd()+"/src/db/scrapper/"+i["name"]+"_lineups.json")
                    lineups= json.load(lineup_file)
                    lineup_file.close()
                   
                    new_lineup = get_lineups(lineups,selections[j]["id"],team_name,HEADERS)
                   
                    new_lineup_file = open(os.getcwd()+"/src/db/scrapper/"+i["name"]+"_lineups.json","w")
                    json.dump(new_lineup,new_lineup_file,indent=4)
                    new_lineup_file.close()
                    return 
    
    
    
    
