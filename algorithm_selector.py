import proyects.test_algorithm as pta
import sys
import json

def run():
    json_args = open(sys.argv[2])
    data = json.load(json_args)
    id = data["id"]
    response = ""
    
    if id=="0":
        response=pta.run("test_algorithm test_algorithm test_algorithm")

    if id=="1":
        response= pta.run("run run run")
        
    json_result = json.dumps([response],indent=4)
    with open(sys.argv[3], 'w') as outfile:
        outfile.write(json_result)

if sys.argv[1]== "run":
    run()
print("OK")
sys.stdout.flush()
