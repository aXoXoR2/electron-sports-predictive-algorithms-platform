from multiprocessing import Pool
from team import Team
from game import Football
from field import Field
from team import Team
import os
import json
from group import Group
import random as rd

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
        with open(os.getcwd()+"/projects/FIFA_World_Cup_2022/format.json", 'r') as f:
            # load json file
            self.format = json.load(f)

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
        clasified = self.format[2]
        if self.format[3] !=0:
            clasified +=1
        return group.get_groups_classifications(clasified),group.name , matches_group_result
      
    def run_games(self, matches):
        teams = []
        with Pool(12) as p:
            teams.append(p.map(self.play_game, matches))
        # for match in matches:
        #     teams.append(self.play_game(match))
            # p.join()
        return teams[0]
    
    def getExtraPlace(self):
        teams_classifications = []
        placements = []
        points = []
        goals = []
        favor_goals = []
        
        for i in range(len(self.group_winners)):
            placements.append(self.group_winners[i][0][self.format[2]])
            points.append(0)
            goals.append(0)
            favor_goals.append(0)
            
            for j in range(len(self.group_winners[i][2])):
                if self.group_winners[i][2][j][0] == self.group_winners[i][0][self.format[2]] and self.group_winners[i][2][j][1] != self.group_winners[i][2][j][3]:
                    points[i]+=3
                    favor_goals[i] += self.group_winners[i][2][j][1]
                    goals[i]= goals[i] + self.group_winners[i][2][j][1] -self.group_winners[i][2][j][3] 
                
                elif self.group_winners[i][2][j][0] == self.group_winners[i][0][self.format[2]]:
                    points[i] += 1
                    favor_goals[i] += self.group_winners[i][2][j][1]
                
                elif self.group_winners[i][2][j][2] == self.group_winners[i][0][self.format[2]] and self.group_winners[i][2][j][1] == self.group_winners[i][2][j][3]:
                    points[i] +=1
                    favor_goals[i] += self.group_winners[i][2][j][3]

                elif self.group_winners[i][2][j][2] == self.group_winners[i][0][self.format[2]]:
                    goals[i] = goals[i] + self.group_winners[i][2][j][3] - self.group_winners[i][2][j][1]
                    favor_goals[i] += self.group_winners[i][2][j][3]
        
        clasified = self.format[3]
        while (clasified>0):
            betters = []
            personal_points = 0
            for j in range(len(points)):
                if points[j] > personal_points:
                    betters = []
                    betters.append(j)
                    personal_points = points[j]
                elif points[j] == personal_points:
                    betters.append(j)
            if (clasified >= len(betters)):
                for i in range(len(betters)):
                    teams_classifications.append(placements[betters[i]])
                    points[betters[i]] = -1
                clasified -= len(betters)
            else:
                count = clasified
                better = []
                go_goals = False
                go_against_goals = False
                random = False
                while (count>0):
                    better = []
                    personal_goals = -100000000000 
                    for i in range(len(betters)):
                        if goals[betters[i]] > personal_goals:
                            better = []
                            better.append(betters[i])
                            personal_goals = goals[betters[i]]
                        elif goals[betters[i]] == personal_goals:
                            better.append(betters[i])
                    if (len(better)>count):
                        go_goals = True
                        break
                    else:
                        for i in range(len(better)):
                             goals[better[i]] = -100000000000
                             teams_classifications.append(placements[better[i]])
                             count-=1
                             clasified -=1
                if go_goals:
                    while (count> 0):
                        personal_goals = 0
                        maximun_goals = []
                        for i in range(len(better)):
                            if favor_goals[better[i]] > personal_goals:
                                maximun_goals = []
                                maximun_goals.append(better[i])
                                personal_goals = favor_goals[better[i]]
                            elif favor_goals[better[i]] == personal_goals:
                                maximun_goals.append(better[i]) 
                        if len(maximun_goals) > count:
                            random = True
                            break
                        else:
                            for i in range(len(maximun_goals)):
                                favor_goals[maximun_goals[i]] = 0
                                teams_classifications.append(placements[maximun_goals[i]])
                                count-=1
                                clasified -=1
                        
                    if random:
                        for i in range(count):
                            teams_classifications.append(placements[maximun_goals[i]])          
                break
        
        return teams_classifications
              
    def run(self):
        result = []
        matches_results = {}
        
        #for group in self.groups:
        #    self.group_winners.append(self.run_group_games( group))
        with Pool(12) as p:
            self.group_winners.append(p.map(self.run_group_games, self.groups))
        self.group_winners = self.group_winners[0]
        
        if(self.format[3] !=0):
            extra_promoved =self.getExtraPlace()
              
        teams_promoved = []
        
        matches_results["Group Fase"] = {}
        for i in range(len(self.group_winners)):
            matches_results["Group Fase"][self.group_winners[i][1]] = self.group_winners[i][2]
            for j in range(self.format[2]):
                teams_promoved.append([self.group_winners[i][0][j]])   
        
        self.matches =[]
        
        if(self.format[3] !=0):
            chosen = []
            for i in extra_promoved:
                teams_first = []
                teams_promoved.append([i])
                for k in range(len(self.group_winners)):
                     if self.group_winners[k][0][self.format[2]] != i and not chosen.__contains__(self.group_winners[k][0][0]):
                        teams_first.append(self.group_winners[k][0][0])
                choice = rd.choice(teams_first)
                chosen.append(choice)
                self.matches.append((choice,i))      
            
            for i in range(int(self.format[2]/2)):    
                second_choice = []  
                 
                for k in range(len(self.group_winners)):
                    rivals = []
                    
                    if not chosen.__contains__(self.group_winners[k][0][i]):
                        chosen.append(self.group_winners[k][0][i])
                        for l in range(len(self.group_winners)):
                            if not second_choice.__contains__(self.group_winners[l][0][self.format[2]-1-i]) and k != l:
                                rivals.append(self.group_winners[l][0][self.format[2]-1-i])              
                        choice = rd.choice(rivals)
                        second_choice.append(choice)
                        self.matches.append((choice,self.group_winners[k][0][i]))
                        
                    if len(chosen) == self.format[1]:
                        
                        chosen = []
                        rivals = []
                        for l in range(len(self.group_winners)):
                            if not second_choice.__contains__(self.group_winners[l][0][self.format[2]-1-i]):
                                second_choice.append(self.group_winners[l][0][self.format[2]-1-i])
                                for m in range(len(self.group_winners)):
                                    if m != l and not chosen.__contains__(self.group_winners[m][0][i+1]) and not second_choice.__contains__(self.group_winners[m][0][i+1]):
                                        rivals.append(self.group_winners[m][0][i+1])
                                choice = rd.choice(rivals)
                                chosen.append(choice)
                                second_choice.append(choice)
                                self.matches.append((choice,self.group_winners[l][0][self.format[2]-1-i])) 
                            if len(second_choice) ==self.format[1]:
                                break
                        break 

            if len(chosen) != self.format[1] and self.format[2] ==1:
                for k in range(len(self.group_winners)):
                    rivals = []
                    if not chosen.__contains__(self.group_winners[k][0][0]):
                        chosen.append(self.group_winners[k][0][0])
                        for l in range(len(self.group_winners)):
                            if not chosen.__contains__(self.group_winners[l][0][0]) and k != l:
                                rivals.append(self.group_winners[l][0][0])
                        
                        choice = rd.choice(rivals)
                        chosen.append(choice)
                        self.matches.append((choice,self.group_winners[k][0][0])) 
                
            for k in range(len(self.group_winners)):
                is_in_it = False
                for j in extra_promoved:
                    if self.group_winners[k][0][self.format[2]]== j:
                        is_in_it = True
                        break
                if not is_in_it:
                    self.group_winners[k][0].remove(self.group_winners[k][0][self.format[2]])
                is_in_it = False    
        
        else:
            for i in range (int(len(self.group_winners)/2)):
                for j in range(self.format[2]):
                    self.matches.append((self.group_winners[2*i][0][j], self.group_winners[2*i+1][0][self.format[2]-j-1]))
       
        self.group_winners.sort(key=lambda x: x[1])
        result.append(self.group_winners)
        
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
                    
                result.append(finals)  
                result.append(third)
                result.append(winner)
                
                break
            
            elif int(instance) == 1:
                winner = self.play_game(self.matches[0])
                
                if winner == self.matches[0][0]:
                    second = self.matches[0][1]
                else:
                    second = self.matches[0][0]
                
                matches_results ["Final"] = []
                matches_results ["Final"].append(winner)
                
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
    with open(os.getcwd()+"/projects/FIFA_World_Cup_2022/format.json", 'r') as f:
            format = json.load(f)
    
    for i in range(len(teams)):
        instance = (format[2]*format[1] + format[3])/2
        pos = {}
        
        for j in range(format[2]):
            pos[str(j+1)+" in Group"] = 0
            
        if format[3] !=0:
            pos[str(format[3]+1)+" in Group"] = 0
        
        while(True):
            if instance  == 2:
                pos["Semi Finals"] = 0
                pos["Final"] = 0
                pos["Winner"] = 0
                pos["Third"] = 0  
                break   
            if instance == 1:
                pos["Final"] = 0
                pos["Winner"] = 0
                break
            else:
                pos[str(int(instance))+"th Finals"] = 0
            instance/=2
        teams_stats[teams[i]] = pos
    
    iterations =  30
    
    teams_full_times = {}
    for i in range(iterations):
        teams_full_times[i] = {}
    for i in range(iterations):  
        t = Tournament()
        tournament,matches_results = t.run()
        

        teams_full_times[i] = matches_results
        
        instance =(format[2]*format[1] + format[3])
        direct_final = False
        
        for fase in tournament: 
            if instance == (format[2]*format[1] + format[3]):
                for j in fase: 
                    for no,team in enumerate(j[0]):
                        teams_stats[team][str(no+1)+" in Group"] += 1
                if instance == 2:
                    direct_final = True
                    instance = 0
            else:
                if instance == 2:
                    for k in fase:
                        teams_stats[k[0]]['Semi Finals'] += 1
                        teams_stats[k[2]]['Semi Finals'] += 1
                elif instance == 1:
                    teams_stats[fase[0]]['Third'] += 1 
                    instance = 0
                elif instance == 0 and not direct_final:
                    teams_stats[fase[0]]["Final"] += 1
                    teams_stats[fase[2]]["Final"] += 1
                    break
                elif direct_final:
                    teams_stats[fase[0]]["Final"] += 1
                    teams_stats[fase[2]]["Final"] += 1
                    break
                else :
                    for k in fase:
                        teams_stats[k[0]][str(int(instance))+"th Finals"] += 1
                        teams_stats[k[2]][str(int(instance))+"th Finals"] += 1
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
        