# aruodas-flat-checker

The main idea of this project is to upload a specific website's url and get new flats (for renting reasons).


The first run only uploads flats to the `flats-database.json` file
The second and above runs fetches all the flats and compares with the `flats-database.json` file. In the end, the new flats appear on `new-flats.json` file.

`flats-database.json` file won't change (when running the program second and above time), unless it will be deleted.
