from urllib.request import urlopen
import json

response = urlopen('https://api.openf1.org/v1/car_data?driver_number=14&session_key=latest&speed>50')
data = json.loads(response.read().decode('utf-8'))[-1]
print(data)

# If you want, you can import the results in a DataFrame (you need to install the `pandas` package first)
# import pandas as pd
# df = pd.DataFrame(data)