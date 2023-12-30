from multiprocessing import Pool
from team import Team
from game import Football
from field import Field
from team import Team
import os
import json
from group import Group


class Tournament:

    def load_groups(self):
        
        data = {}
        with open(os.getcwd()+"/projects/FIFA_World_Cup_2022/groups.json", 'r') as f:
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
        result = []
        matches_results = {}
        
        #for group in self.groups:
        #    self.group_winners.append(self.run_group_games( group))
        with Pool(12) as p:
            self.group_winners.append(p.map(self.run_group_games, self.groups))
        self.group_winners = self.group_winners[0]
        
        teams_promoved = []
        
        matches_results["Group Fase"] = {}
        for i in range(len(self.group_winners)):
            matches_results["Group Fase"][self.group_winners[i][1]] = self.group_winners[i][2]
            teams_promoved.append([self.group_winners[i][0][0]])
            teams_promoved.append([self.group_winners[i][0][1]])
        
        self.group_winners.sort(key=lambda x: x[1])
        result.append(self.group_winners)
        
        self.matches =[]
        for i in range (int(len(self.group_winners)/2)):
            self.matches.append((self.group_winners[2*i][0][0], self.group_winners[2*i+1][0][1]))
            self.matches.append((self.group_winners[2*i+1][0][0], self.group_winners[2*i][0][1]))
        
        instance = len(teams_promoved)/2
        while(True):
            if int(instance) == 2:
                finals = self.run_games(self.matches)
                
                matches_results ["Semi-Finals"] = []
                
                for i in range (len(finals)):
                    matches_results ["Semi-Finals"].append(finals[i])
                
                third = []
                for t in teams_promoved:
                    if not (t[0] in [t1[0] for t1 in finals]):
                        third.append(t[0])

                winner = self.play_game((finals[0][0],finals[1][0]))
                
                if winner == finals[0]:
                    second = finals[1]
                else:
                    second = finals[0]
                    
                third = self.play_game((third[0],third[1]))
                
                matches_results ["3rd Place"] = []
                matches_results ["3rd Place"].append(third)
                
                matches_results ["Final"] = []
                matches_results ["Final"].append(winner)
                      
                result.append(third)
                result.append(finals)
                result.append(winner)
                
                break
            else:
                teams_promoved = self.run_games(self.matches)
                matches_results [str(int(instance))+"th Finals"] = []
                for i in range (len(teams_promoved)):
                    matches_results [str(int(instance))+"th Finals"].append(teams_promoved[i])
                result.append(teams_promoved)
                self.matches = []
                for i in range (int(len(teams_promoved)/2)):
                    self.matches.append((teams_promoved[2*i][0], teams_promoved[2*i+1][0]))
            instance /=2
        
        return result,matches_results
 
if __name__ == "__main__":
    with open(os.getcwd()+"/projects/FIFA_World_Cup_2022/teams_simulation.json", 'r') as f:
        teams= json.load(f)     
    
    
    teams_stats = { }
    
    for i in range(len(teams)):
        instance =len(teams)/4
        pos = {}
        pos["1st Group"] = 0
        pos["2nd Group"] = 0
        while(True):
            if instance  == 2:
                pos["Semi Finals"] = 0
                pos["Final"] = 0
                pos["Winner"] = 0
                pos["Third"] = 0  
                break           
            else:
                pos[str(int(instance))+"th Finals"] = 0
            instance/=2
        teams_stats[teams[i]] = pos
        
    
    iterations = 30
    
    teams_full_times = {}
    for i in range(iterations):
        teams_full_times[i] = {}
    
    for i in range(iterations):  
        t = Tournament()
        tournament,matches_results = t.run()
        
        teams_full_times[i] = matches_results
        
        instance =len(teams)/4
        
        for fase in tournament: 
            if instance == len(teams)/4:
                for j in fase: 
                    for no,team in enumerate(j[0]):
                        if instance != 2:
                            teams_stats[team][str(int(instance))+"th Finals"] += 1
                        if no == 0:
                            teams_stats[team]["1st Group"] += 1
                        else:
                            teams_stats[team]["2nd Group"] += 1 
            else:
                if instance == 2:
                    for k in fase:
                        teams_stats[k[0]]['Semi Finals'] += 1
                elif instance == 1:
                    teams_stats[fase[0]]['Third'] += 1 
                    instance = 0
                elif instance == 0:
                    for k in fase:
                        teams_stats[k[0]]["Final"] += 1
                    break
                else :
                    for k in fase:
                        teams_stats[k[0]][str(int(instance))+"th Finals"] += 1
            instance /=2
        teams_stats[tournament[len(tournament)-1][0]]["Winner"] += 1
        
    
    
    for t in teams_stats:
        for attr in teams_stats[t]:
            teams_stats[t][attr] /= iterations
    
    dumped = {}
    dumped["probabilities"] = teams_stats
    dumped ["matches"] = teams_full_times
    
    with open(os.getcwd()+'/projects/FIFA_World_Cup_2022/results.json', "w") as f:
        f.write(json.dumps(dumped,indent=4))
        