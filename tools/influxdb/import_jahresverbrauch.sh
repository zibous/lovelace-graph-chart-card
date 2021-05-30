
#!/bin/bash

python3 app.py --dbname jahresverbrauch --create -u admin -p theSecretOne -d ';' --input ./data/jahresverbrauch.csv -m "reportdata" --fieldcolumns strom_kwh,stromkosten,preis_kwh,kostal_kwh,stromertrag,preis_ertrag,gas_m3,gas_kwh,gaskosten,gaskosten_kwh,wasser_m3,wasserkosten,wasserkosten_m3  --tagcolumns tagname

