/**
 * @jest-environment jsdom
 */

const { JSONGrid, DOMHelper } = require('../JSONGrid');

describe('collapseAll', () => {
  let data;
  let grid;

  beforeEach(() => {
    data = {
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

    document.body.innerHTML = '<div id="container"></div>';

    grid = new JSONGrid(
      data,
      document.getElementById('container')
    );

    grid.render();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('collapses all expanded tables', () => {
    const expanders = grid.container.querySelectorAll('.expander');

    grid.expandAll();

    const spy = jest.spyOn(DOMHelper, 'onExpanderClick');

    grid.collapseAll();

    expect(spy).toHaveBeenCalledTimes(expanders.length);
  });
});