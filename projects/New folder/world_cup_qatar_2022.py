from team import Team
from game import Football
from field import Field
import os
from multiprocessing import Pool
from time import sleep
import pandas as pd
import json
from group import Group


class world_cup_qatar_2022:

    def load_groups(self):
        
        data = {}
        with open(os.getcwd()+"/projects/FIFA_World_Cup_2022/groups_world_qatar_2022.json", 'r') as f:
            # load json file
            data = json.load(f)

        groups = []
        for g in data.keys():
            teams = data[g]
            groups.append(Group(g,teams))
            # break
            
        return groups

    def __init__(self) -> None:
        groups = self.load_groups()
        self.groups = groups
        self.group_winners = []
        self.teams_8th = []
        self.teams_4th = []
        self.matches = []
        self.teams = []

    def play_match_group(self,match,g):
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

        Pros = []
        match = {
            team1.team_name: 0,
            team2.team_name: 0
        }

        game = Football(team1, team2, field, 90)
        all_result = game.play()
        result = all_result[0]
        
        if type(result) is tuple:
            g.Tie(Team(result[0][0],field.field))
            g.Tie(Team(result[1][0],field.field))
            
            return [result[0][0],result[0][1],result[1][0],result[1][1]]
        else:
            g.Winner(Team(all_result[0], field.field))
            return all_result

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

    def run_group_games(self, group:Group):
        matches = group.get_matches() 
        matches_group_result = []
        while len(matches) > 0:
            match = matches.pop()
            # p.map(self.play_match_group, [match,group])
            # p.apply_async(self.play_match_group, args=(match,group))
            all_result = self.play_match_group(match,group)
            matches_group_result.append(all_result)
        
        return group.get_groups_classifications(),group.name , matches_group_result
    
    def run_games(self, matches):
        teams = []
        with Pool(12) as p:
            teams.append(p.map(self.play_game, matches))
        # for match in matches:
        #     teams.append(self.play_game(match))
            # p.join()
        return teams[0]
    
    def run(self):
        
        matches_results = {}
        #for group in self.groups:
        #    self.group_winners.append(self.run_group_games( group))
        with Pool(12) as p:
            self.group_winners.append(p.map(self.run_group_games, self.groups))
        
        self.group_winners = self.group_winners[0]
        
        matches_results["Group Fase"] = {}
        for i in range(len(self.group_winners)):
            matches_results["Group Fase"][self.group_winners[i][1]] = self.group_winners[i][2]
        
        
        self.group_winners.sort(key=lambda x: x[1])
          
          
        self.matches = [
                        (self.group_winners[0][0][0], self.group_winners[1][0][1]), # 49
                        (self.group_winners[2][0][0], self.group_winners[3][0][1]), # 50
                        (self.group_winners[1][0][0], self.group_winners[0][0][1]), # 51
                        (self.group_winners[3][0][0], self.group_winners[2][0][1]), # 52
                        
                        (self.group_winners[4][0][0], self.group_winners[5][0][1]), # 53
                        (self.group_winners[6][0][0], self.group_winners[7][0][1]), # 54
                        (self.group_winners[5][0][0], self.group_winners[4][0][1]), # 55
                        (self.group_winners[7][0][0], self.group_winners[6][0][1])] # 56
        
        self.teams_8th = self.run_games(self.matches)
        
        matches_results ["8th Finals"] = []
        
        for i in range (len(self.teams_8th)):
            matches_results ["8th Finals"].append(self.teams_8th[i])
        # Quarter Finals
        
        self.matches = [
            (self.teams_8th[0][0],self.teams_8th[1][0]),
            (self.teams_8th[2][0],self.teams_8th[3][0]),
            (self.teams_8th[4][0],self.teams_8th[5][0]),
            (self.teams_8th[6][0],self.teams_8th[7][0]),
        ] 
        
        self.teams_4th = self.run_games(self.matches)
        
        matches_results ["4th Finals"] = []
        
        for i in range (len(self.teams_4th)):
            matches_results ["4th Finals"].append(self.teams_4th[i])
            
        # Semi Finals
        self.matches = [
            (self.teams_4th[0][0],self.teams_4th[1][0]),
            (self.teams_4th[2][0],self.teams_4th[3][0])
        ]
        
        final_teams = self.run_games(self.matches)
        matches_results ["Semi-Finals"] = []
        
        for i in range (len(final_teams)):
            matches_results ["Semi-Finals"].append(final_teams[i])
        
        # print(final_teams)
        third = []
        for t in self.teams_4th:
            if not (t[0] in [t1[0] for t1 in final_teams]):
                # print(t.team_name)
                third.append(t[0])
        
        # Final
        winner = self.play_game((final_teams[0][0],final_teams[1][0]))  
            
        if winner == final_teams[0][0]:
            second = final_teams[1][0]
        else:
            second = final_teams[0][0]
            
        third = self.play_game((third[0],third[1]))
        
        matches_results ["3rd Place"] = []
        matches_results ["3rd Place"].append(third)
        
        matches_results ["Final"] = []
        matches_results ["Final"].append(winner)
        
        return self.group_winners,self.teams_8th,self.teams_4th,[third[0]],final_teams,winner,matches_results
 
if __name__ == "__main__":
    with open(os.getcwd()+"/projects/FIFA_World_Cup_2022/groups_world_qatar_2022.json") as f:
        data = json.loads(f.read())
    
    teams_full_times = {}
    teams_stats = { item:{"1st Group":0,"2nd Group":0,"8th Finals":0,"4th Finals":0,"Semi Finals":0, "Final":0, "Winner":0, "Third":0} for i in data.values() for item in i}
    
    iterations = 30
    
    for i in range(iterations):
        teams_full_times[i] = {}
    
    for i in range(iterations):  
        t = world_cup_qatar_2022()
        groups,t_8th,t_4,third,t_final,win,matches_results = t.run()
        
        teams_full_times[i] = matches_results
        
        for i in groups:
            for no,team in enumerate(i[0]):
                teams_stats[team]["8th Finals"] += 1
                if no == 0:
                    teams_stats[team]["1st Group"] += 1
                else:
                    teams_stats[team]["2nd Group"] += 1
        for t in t_8th:
            teams_stats[t[0]]['4th Finals'] += 1
        for t in t_4:
            teams_stats[t[0]]['Semi Finals'] += 1
        for t in third:
            teams_stats[t]['Third'] += 1
        for t in t_final:
            teams_stats[t[0]]["Final"] += 1
        teams_stats[win[0]]["Winner"] += 1 
    
    for t in teams_stats:
        for attr in teams_stats[t]:
            teams_stats[t][attr] /= iterations
            
    dumped = {}
    dumped["probabilities"] = teams_stats
    dumped ["matches"] = teams_full_times
    
    with open(os.getcwd()+'/projects/FIFA_World_Cup_2022/results.json', "w") as f:
        f.write(json.dumps(dumped,indent=4))
        