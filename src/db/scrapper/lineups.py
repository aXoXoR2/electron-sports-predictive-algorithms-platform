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
        
def extract_ids_from_tournament_url(url):
    parts = url.split("/")
    return (parts[6],parts[8])

def get_lineups(lineups, groups,HEADERS):
    for k in groups:
        (team_id,team_name,team_slug) = k["team"]["id"],k["team"]["name"],k["team"]["slug"]
        URL_TEAM = "https://api.sofascore.com/api/v1/team/"+str(team_id)+"/performance"
        response = requests.get(URL_TEAM,headers=HEADERS)
        team_last_matches = response.json()["events"]
        last_match_id = team_last_matches[len(team_last_matches)-1]["id"]
        URL_LINUP = "https://api.sofascore.com/api/v1/event/"+str(last_match_id)+"/lineups"
        response = requests.get(URL_LINUP,headers=HEADERS) 
        team_lineups = response.json()
        if team_lineups["away"]["players"][0]["player"]["country"]["name"] == team_name:
            players= team_lineups["away"]["players"]
        else:
            players= team_lineups["home"]["players"]
        lineup = get_lineup(players)
        lineups[team_slug] = lineup
    return lineups
    
def scrap_lineup(name,URL,HEADERS):
    
    lineups={}
    (id_0,id_1) = extract_ids_from_tournament_url(URL)
    URL ="https://api.sofascore.com/api/v1/unique-tournament/"+str(id_0)+"/season/"+str(id_1)+"/standings/total"
            
    response = requests.get(URL,headers=HEADERS)
    tournaments_teams = response.json()["standings"]
            
    if len(tournaments_teams) > 1:
        for j in tournaments_teams:
            group = j["rows"]
            lineups = get_lineups(lineups,group,HEADERS)
            
    else:
        group= tournaments_teams[0]["rows"]
        lineups = get_lineups(lineups,group,HEADERS)
        
    lineup_file = open(os.getcwd()+"/src/db/scrapper/"+ name+"_lineups"+".json",'w')
    json.dump(lineups, lineup_file,indent=4)
    lineup_file.close()

def scrapper(name="all"):
    
    out_file_header = open(os.getcwd()+"/src/db/scrapper/headers.txt")
    headers_string = out_file_header.read()
    out_file_header.close()
    HEADERS = ast.literal_eval(headers_string)
    out_file_tournament = open(os.getcwd()+"/src/db/scrapper/tournaments_urls_and_local_locations.json")
    tournaments = json.load(out_file_tournament)          
    
    if name == "all":
        for i in tournaments:
            if i["name"] != "world_cup_qatar_2022":
                scrap_lineup(i["name"],i["URL"],HEADERS)       
    else:
        for i in tournaments:
            if i["name"] == name:
                scrap_lineup(i["name"],i["URL"],HEADERS)
                break
                  
def get_national_selection_last_lineup(tournament_name,URL,team_name):
    lineup_file = open(os.getcwd()+"/src/db/scrapper/"+tournament_name+"_lineups.json")
    lineups= json.load(lineup_file)
    lineup_file.close()
    
    out_file_header = open(os.getcwd()+"/src/db/scrapper/headers.txt")
    headers_string = out_file_header.read()
    out_file_header.close()
    HEADERS = ast.literal_eval(headers_string)
    
    (id_0,id_1) = extract_ids_from_tournament_url(URL)
    URL ="https://api.sofascore.com/api/v1/unique-tournament/"+str(id_0)+"/season/"+str(id_1)+"/standings/total"
      
    response = requests.get(URL,headers=HEADERS)
    tournaments_teams = response.json()["standings"]
            
    if len(tournaments_teams) > 1:
        for j in tournaments_teams:
            group = j["rows"]
            for k in group:
                if k["team"]["slug"] == team_name:
                    URL_TEAM = "https://api.sofascore.com/api/v1/team/"+str(k["team"]["id"])+"/performance"
                    response = requests.get(URL_TEAM,headers=HEADERS)
                    team_last_matches = response.json()["events"]
                    last_match_id = team_last_matches[len(team_last_matches)-1]["id"]
                    URL_LINUP = "https://api.sofascore.com/api/v1/event/"+str(last_match_id)+"/lineups"
                    response = requests.get(URL_LINUP,headers=HEADERS) 
                    team_lineups = response.json()
                    if team_lineups["away"]["players"][0]["player"]["country"]["name"] == k["team"]["name"]:
                        players= team_lineups["away"]["players"] 
                    else:
                        players= team_lineups["home"]["players"]
                    lineup = get_lineup(players)
                    lineups[k["team"]["slug"]] = lineup
                    new_lineup_file = open(os.getcwd()+"/src/db/scrapper/"+tournament_name+"_lineups.json","w")
                    json.dump(lineups, new_lineup_file,indent=4)
                    new_lineup_file.close()
                    return 
                          
    else:
        group= tournaments_teams[0]["rows"]
        for k in group:
            if k["team"]["slug"] == team_name:
                URL_TEAM = "https://api.sofascore.com/api/v1/team/"+str(k["team"]["id"])+"/performance"
                response = requests.get(URL_TEAM,headers=HEADERS)
                team_last_matches = response.json()["events"]
                last_match_id = team_last_matches[len(team_last_matches)-1]["id"]
                URL_LINUP = "https://api.sofascore.com/api/v1/event/"+str(last_match_id)+"/lineups"
                response = requests.get(URL_LINUP,headers=HEADERS) 
                team_lineups = response.json()
                if team_lineups["away"]["players"][0]["player"]["country"]["name"] == k["team"]["name"]:
                    players= team_lineups["away"]["players"] 
                else:
                    players= team_lineups["home"]["players"]
                lineup = get_lineup(players)
                lineups[k["team"]["slug"]] = lineup
                new_lineup_file = open(os.getcwd()+"/projects/FIFA_World_Cup_2022/scrapper/"+tournament_name+"_lineup.json","w")
                json.dump(lineups, new_lineup_file,indent=4)
                new_lineup_file.close()
                return 
           

