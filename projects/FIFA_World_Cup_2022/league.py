from multiprocessing import Pool
from team import Team
from game import Football
from field import Field
from team import Team
import os
import json


class League:
    def load_teams(self):
        data = []
        with open(os.getcwd()+"/projects/FIFA_World_Cup_2022/teams_simulation.json", 'r') as f:
            # load json file
            data = json.load(f)
        return data
    
    def get_matches(self):
        matches = [[] for i in range(int(len(self.teams)-1)*2)]
        mask = []
        mask_matches = []
        
        for i in range(len(self.teams)):
            mask.append([False for j in range(int(len(self.teams)-1)*2)])
            mask_matches.append([False for j in range(len(self.teams))])
            mask_matches [i][i] = True
        
        for i in range (len(self.teams)-1):      
            for k in range(len(self.teams)):
                for j in range(len(self.teams)):
                    if mask_matches[k][j] == False and mask[k][i] == False and mask[j][i] == False:
                        mask_matches[k][j] = True
                        mask_matches[j][k] = True
                        mask[k][i] =True
                        mask[j][i] = True
                        matches[i].append([self.teams[k],self.teams[j]])
                        break
        
        mask = []
        mask_matches = []
        for i in range(len(self.teams)):
            mask.append([False for j in range(int(len(self.teams)-1)*2)])
            mask_matches.append([False for j in range(len(self.teams))])
            mask_matches [i][i] = True
        
        count = len(self.teams) -1
        for i in range (len(self.teams)-1):      
            for k in range(len(self.teams)):
                for j in range(len(self.teams)):
                    if mask_matches[k][j] == False and mask[k][i+count] == False and mask[j][i+count] == False:
                        mask_matches[k][j] = True
                        mask_matches[j][k] = True
                        mask[k][i+count] =True
                        mask[j][i+count] = True
                        matches[i+count].append([self.teams[j],self.teams[k]])
                        break
        return matches 
        
    def __init__(self) -> None:
        self.teams = self.load_teams()
        self.matches = self.get_matches()
  
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
        # print(match)
        team1 = Team(match[0], field.field)
        team2 = Team(match[1], field.field)

        # Pros = []
        # match = {
        #     team1.team_name: 0,
        #     team2.team_name: 0
        # }

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
        teams = []
        with Pool(12) as p:
            teams.append(p.map(self.play_game, matches))
        # for match in matches:
        #     teams.append(self.play_game(match))
            # p.join()
        return teams[0]
    
    def run(self):
        results = []
        
        teams_matchdays_results = {}
        
        for i in range(int(len(self.teams)-1)*2):
            teams_matchdays_results[i] = []
        
        pos_table = {}
        for i in range(len(self.teams)):
            pos_table[self.teams[i]] = 0
        
        for i in range(len(self.matches)):
            matchday = self.run_games(self.matches[i])
            for j in matchday:
                pos_table[j[0]] +=3
                teams_matchdays_results[i].append(j)
        
        
        sorted_table = dict(sorted(pos_table.items(),key= lambda item:item[1], reverse=True))
        for i in sorted_table.keys():
            results.append(i)
        
        return results,teams_matchdays_results
 
if __name__ == '__main__':
    with open(os.getcwd()+"/projects/FIFA_World_Cup_2022/teams_simulation.json", 'r') as f:
        teams= json.load(f)    
    
    
    teams_stats = {}
    teams_full_times = {}
    
    for i in range(len(teams)):
        pos = {}
        for j in range(len(teams)):
            pos[str(j+1)+"_in_league"] = 0
        teams_stats[ teams[i]] = pos

    iterations = 30
    
    for i in range(iterations):
        teams_full_times[i] = {}
    
    for i in range(iterations):  
        l = League()
        (result,team_matchdays_results) = l.run()
        for j in range(len(teams)):
            teams_stats[result[j]][str(j+1)+"_in_league"]+=1
        
        teams_full_times[i]=team_matchdays_results
            
    
    for i in teams_stats:
        for attr in teams_stats[i]:
            teams_stats[i][attr] /= iterations
    
    dumped = {}
    dumped["probabilities"] = teams_stats
    dumped ["matches"] = teams_full_times
    
    with open(os.getcwd()+'/projects/FIFA_World_Cup_2022/results.json', "w") as f:
        f.write(json.dumps(dumped,indent=4))
        