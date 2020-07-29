# JSON Grid

JSON Grid is a open source javascript library meant to be run in the browser that aims to allow users to convert JSON objects into user-friendly and interactive tables/grids.

## Instalation

In order to install, just require the package through `unpkg` (https://unpkg.com/@araujoigor/json-grid) and use the `JSONGrid` object to generate your grid.

## Usage

A simple usage case would be:

1. Include the lib from [unpkg](https://unpkg.com)
2. Create a `div` with id `container`
3. Store your JSON into a variable.
4. Create a `JSONGrid` instance with the references to your data and the container (see the [API](#API) section)
5. Run the `render` method of the instance.


```html
  <!DOCTYPE html>
  <html lang="en">

  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>JSON Grid</title>
    <link href="https://fonts.googleapis.com/css?family=Roboto+Mono:400,500,700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://unpkg.com/@araujoigor/json-grid/dist/json-grid.css">
    <script src="https://unpkg.com/@araujoigor/json-grid/dist/JSONGrid.min.js"></script>
  </head>

  <body>
    <div id="container"></div>
    <script>
      var container = document.getElementById("container");
      var data = {
        sport: "Formula 1",
        GP: "Brazilian GP - Interlagos",
        date: "2019-11-17T17:10:00.000Z",
        track: "Autódromo José Carlos Pace",
        stadings: [
          { "pos": 1, "driver": "M. Verstappen","team": "Red Bull", "number#": 33, "time": "+1:33:14.678", "pts": 25 },
          { "pos": 2, "driver": "P. Gasly","team": "Toro Rosso", "number#": 10, "time": "+6.077s", "pts": 18 },
          { "pos": 3, "driver": "C. Sainz, Jr.","team": "McLaren", "number#": 55, "time": "+8.896s", "pts": 15 },
          { "pos": 4, "driver": "K. Räikkönen","team": "Alfa Romeo", "number#": 7, "time": "+9.452s", "pts": 12 },
          { "pos": 5, "driver": "A. Giovinazzi","team": "Alfa Romeo", "number#": 99, "time": "+10.201s", "pts": 10 },
          { "pos": 6, "driver": "D. Ricciardo","team": "Renault", "number#": 3, "time": "+10.541s", "pts": 8 },
          { "pos": 7, "driver": "L. Hamilton","team": "Mercedes", "number#": 44, "time": "+11.139s", "pts": 6 },
          { "pos": 8, "driver": "L. Norris","team": "McLaren", "number#": 4, "time": "+11.204s", "pts": 4 },
          { "pos": 9, "driver": "S. Pérez","team": "Racing Point", "number#": 11, "time": "+11.529s", "pts": 2 },
          { "pos": 10, "driver": "D. Kvyat","team": "Toro Rosso", "number#": 26, "time": "+11.931s", "pts": 1 },
          { "pos": 11, "driver": "K. Magnussen","team": "Haas", "number#": 20, "time": "+12.732s", "pts": 0 },
          { "pos": 12, "driver": "G. Russell","team": "Williams", "number#": 63, "time": "+13.599s", "pts": 0 },
          { "pos": 13, "driver": "R. Grosjean","team": "Haas", "number#": 8, "time": "+13.599s", "pts": 0 },
          { "pos": 14, "driver": "A. Albon","team": "Red Bull", "number#": 23, "time": "+14.927s", "pts": 0 },
          { "pos": 15, "driver": "N. Hülkenberg","team": "Renault", "number#": 27, "time": "+18.059s", "pts": 0 },
          { "pos": 16, "driver": "R. Kubica","team": "Williams", "number#": 88, "time": "+1 Lap", "pts": 0 },
          { "pos": 17, "driver": "S. Vettel","team": "Ferrari", "number#": 5, "time": "DNF", "pts": 0 },
          { "pos": 18, "driver": "C. Leclerc","team": "Ferrari", "number#": 16, "time": "DNF", "pts": 0 },
          { "pos": 19, "driver": "L. Stroll","team": "Racing Point", "number#": 18, "time": "DNF", "pts": 0 },
          { "pos": 20, "driver": "V. Bottas","team": "Mercedes", "number#": 77, "time": "DNF", "pts": 0 }
        ]
      };
      var jsonGrid = new JSONGrid(data, container);
      jsonGrid.render();
    </script>
  </body>
  </html>
```

## API

The functions that are meant to be used publicily are:

### `JSONGrid(data, container)`

> The constructor receives two arguments: `data` and `container`.

The `data` parameter is expected to be JSON object.
The `container` paramenter is expected to be a DOM node and will be used to render the contents.

After the object is created, you can use the `render` function to render the grid.

### `JSONGrid.prototype.render`

Used to render grid based on the given `data` to the given `container`.

### `JSONGrid.prototype.generateDOM`

Returns the grid DOM without rendering it to the `container`.