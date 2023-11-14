import requests

import pandas

file_path = "data/Node.js Sample_Test_File.csv"
# file_path = "data/blank.csv"
root_url = "http://127.0.0.1:3000"

with open(file_path, 'rb') as file:
    files = {'csvFile': file}
    response = requests.post(url=f"{root_url}/upload",files=files)  


# df = pandas.read_csv("data/Node.js Sample_Test_File.csv", delimiter=",")
# print(df)

print(response.status_code)