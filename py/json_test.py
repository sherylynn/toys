import subprocess,json,io,os
subprocess.run(["ls","-l"])
subprocess.run(["powershell","echo $ENV:PATH"])

localDir=os.path.dirname(__file__)
jsonDir=os.path.join(localDir,"../json/test.json")
with open(jsonDir,"r") as jsonFile:
    test_json=json.load(jsonFile)
print(test_json['name'])