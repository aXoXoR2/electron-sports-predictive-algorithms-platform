from multiprocessing import Pool
from team import Team
from game import Football
from field import Field
from team import Team
import os
import json

class Match:
   
    def load_teams(self):
        data = []
        with open(os.getcwd()+"/projects/FIFA_World_Cup_2022/teams_simulation.json", 'r') as f:
            data = json.load(f)
        return data
   
    def __init__(self) -> None:
        self.teams = self.load_teams()
        
    def play_game(self, match):
        zones = [
        "Defense Left",
        "Defense Center",
        "Defense Right",

        "Midfield Left",
        "Midfield Center",
        "Midfield Right",

        "Attack Left",
        "Attack Center",
        "Attack Right"
        ]
        field = Field("f1", 3, 3, zones)
        team1 = Team(match[0], field.field)
        team2 = Team(match[1], field.field)

        
        game = Football(team1, team2, field, 90)
        all_result = game.play()
        result = all_result[0]

        if type(result) is tuple:
            all_result = self.play_game((team1.team_name, team2.team_name))
            result = all_result[0]
            return all_result
        else:
            return all_result
 
    def run_games(self, matches):
        full_times = []
        with Pool(12) as p:
            full_times.append(p.map(self.play_game, matches))
        
        return full_times[0]
    
    def run(self,iter):
        matches = []
        for i in range(iter):
            matches.append((self.teams[0],self.teams[1]))
            
        result = self.run_games(matches)
         
        return result
 
if __name__ == '__main__':
    with open(os.getcwd()+"/projects/FIFA_World_Cup_2022/teams_simulation.json", 'r') as f:
        teams= json.load(f)    
    
    
    teams_stats = {}
    teams_full_times = {}
    
    for i in range(len(teams)):
        teams_stats[teams[i]] = {"winner":0}
    
    iterations = 30
    
    for i in range(iterations):
        teams_full_times[i] = []
     
    l = Match()
    result = l.run(iterations)
    
    for i in range(len(result)):
        teams_stats[result[i][0]]["winner"] +=1
        teams_full_times[i] =result[i]
    
    
    for i in teams:
        teams_stats[i]["winner"] /= iterations
        
    dumped = {}
    dumped["probabilities"] = teams_stats
    dumped ["matches"] = teams_full_times
    with open(os.getcwd()+'/projects/FIFA_World_Cup_2022/results.json', "w") as f:
        f.write(json.dumps(dumped,indent=4))
        