import sys
import scrapper as sc
import lineups as lp
import json

def request_handler():
    json_args = open(sys.argv[2])
    data_selection = json.load(json_args)
    
    if data_selection["request"]== "scrap_team":  
        if data_selection['option']=='reboot':
            sc.search_and_actualize_only_one_selection_reboot(data_selection["team_name"])
        else:
            sc.search_and_actualize_only_one_selection(data_selection["team_name"])
            
    elif data_selection["request"]== "scrap_region":
        sc.search_and_actualize_changes(data_selection["region_name"])

    elif data_selection["request"]== "search_player":
        response = sc.look_for_players(data_selection["player_name"])
        json_result = json.dumps(response,indent=4)
        with open(sys.argv[3], 'w') as outfile:
            outfile.write(json_result)

    elif data_selection["request"]== "add_player":
        sc.add_player(data_selection["player_id"],data_selection["player_name"])

    elif data_selection["request"]== "edit_lineup":
        sc.edit_lineup(data_selection["team_name"],data_selection["new_lineup"])
    
    elif data_selection["request"]== "last_lineup":
        players = lp.get_national_selection_last_lineup(data_selection["team_name"])
        sc.save_players(players,data_selection["team_name"])

    elif data_selection["request"]== "get_data":
        response=sc.get_data(data_selection["type"])
        json_result = json.dumps(response,indent=4)
        with open(sys.argv[3], 'w') as outfile:
            outfile.write(json_result)

    
    
if sys.argv[1]== "request_handler":
    try:
        request_handler()
        print("OK")
    except :
        print("Request go Wrong")
        