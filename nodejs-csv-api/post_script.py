import requests

import pandas

file_path = "nodejs-csv-api/data/Node.js Sample_Test_File.csv"
# file_path = "nodejs-csv-api/data/blank.csv"
# file_path = "nodejs-csv-api/data/incorrectfileformat.txt"
# file_path = "nodejs-csv-api/data/partialsuccess.csv"
root_url = "http://127.0.0.1:3000"

with open(file_path, 'rb') as file:
    files = {'csvFile': file}
    response = requests.post(url=f"{root_url}/upload",files=files)  

# df = pandas.read_csv("data/Node.js Sample_Test_File.csv", delimiter=",")
# print(df)

print(response.status_code)