import pandas as pd
import json
import os
import seaborn as sns
import matplotlib.pyplot as plt
import sys

def create_images(columns,groups): 
    
    df = pd.read_csv('src/db/results/algorithm_results.csv')
    if groups != {}:
        for g in groups.keys():
            df1 = df[df['Team'].isin(groups[g])]
            labels = [i for i in df1["Team"]]
            fig, ax = plt.subplots(figsize=(10,10))
            ax = sns.heatmap(data=df1[["1st Group","2nd Group"]],vmin=0,vmax=1,linewidths=2, linewidth='.5',yticklabels=labels, annot=True, cmap="crest")
            plt.savefig(f"src/db/results/{g}.jpg", dpi=1000 )
            plt.close()
        
        columns.remove('1st Group')
        columns.remove('2nd Group')
        
        labels = [i for i in df["Team"]]
        fig, ax = plt.subplots(figsize=(10,10))
        ax = sns.heatmap(data=df[columns],vmin=0,vmax=1,linewidths=2, linewidth='.5',yticklabels=labels, annot=True, cmap="crest")
        plt.savefig(f"src/db/results/algorithm_results.jpg", dpi=1000 )
        plt.close()
        
        
    else:
        labels = [i for i in df["Team"]]
        fig, ax = plt.subplots(figsize=(10,10))
        ax = sns.heatmap(data=df[columns],vmin=0,vmax=1,linewidths=2, linewidth='.5',yticklabels=labels, annot=True, cmap="crest")
        plt.savefig(f"src/db/results/algorithm_results.jpg", dpi=1000 )
        plt.close()
        
def json_to_csv():
    
    with open('src/db/algorithm_results.json') as f:
        all_data = json.load(f)
        
    for_group = all_data["matches"]
    data = all_data["probabilities"]
        
    groups = {}
    there_group = False
    column =["Team"]
        
    for i in data:
        for key in data[i]:
            if key == "1st Group":
                there_group = True
            column.append(key)
        break
        
    if there_group:
        for i in for_group["0"]["Group Fase"]:
            groups[i]=[]
            for j in for_group["0"]["Group Fase"][i]:
                groups[i].append(j[0])
                groups[i].append(j[2])
            unique_teams = []
            [unique_teams.append(team) for team in groups[i] if team not in unique_teams]
            groups[i] = unique_teams
        
    print(groups)
    
    df = pd.DataFrame(columns=column)
    column.__delitem__(0)
        
    for key in data:
        newline = [key]
        for i in column: 
            newline.append(data[key][i])   
                
            # append newlinw to dataframe
        df.loc[len(df)] = newline
        df.to_csv("src/db/results/algorithm_results.csv", index=False)
        
    create_images(column, groups)

if sys.argv[1]== "json_to_csv":
    json_to_csv()
print("OK")
sys.stdout.flush()