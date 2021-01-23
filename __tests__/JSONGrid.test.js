const data = require('./__data__/complexJson.json');
const { JSONGrid } = require('../JSONGrid');

afterEach(() => {
  JSONGrid.instances = 0;
});

test('it should properly build the component tree', () => {
  document.body.innerHTML = `
    <div id="container"></div>
  `;

  const container = document.getElementById('container');

  new JSONGrid(data, container).render();

  expect(document.body.innerHTML).toMatchSnapshot();
});

describe('constructor', () => {
  it('should increase the number of instances as they are created', () => {
    [1, 2, 3].forEach((_, idx) => {
      const instance1 = new JSONGrid();
      expect(instance1.instanceNumber).toBe(idx);
      expect(JSONGrid.instances).toBe(idx + 1);
    });
  });

  it('should retain the data and the container in the instance', () => {
    let instance = new JSONGrid({ a: 1, b: 2 });
    expect(instance.data).toEqual({ a: 1, b: 2 });
    expect(instance.container).toEqual(null);

    instance = new JSONGrid([1, 2, 3], { a: 1, b: 2 });
    expect(instance.data).toEqual([1, 2, 3]);
    expect(instance.container).toEqual(null);

    let el = document.getElementsByTagName('body')[0];
    instance = new JSONGrid([1, 2, 3, { a: 1, b: 2 }], el);
    expect(instance.data).toEqual([1, 2, 3, { a: 1, b: 2 }]);
    expect(instance.container).toEqual(el);

    el = document.createElement('div');
    instance = new JSONGrid(1, el);
    expect(instance.data).toEqual(1);
    expect(instance.container).toEqual(el);
  });
});

describe('processArray', () => {
  it('should add a header entry for indexes and one for the raw values', () => {
    const __this = {
      data: [1, 'string', true, null, undefined, { a: 1, b: 2 }, [1, 2, 3]],
    };

    const {
      headers: [header],
    } = JSONGrid.prototype.processArray.apply(__this);

    expect(header.nodeName.toLowerCase()).toBe('tr');
    expect(header.children[0].nodeName.toLowerCase()).toBe('th');
    expect(header.children[0].innerHTML).toBe('');
    expect(header.children[1].nodeName.toLowerCase()).toBe('th');
    expect(header.children[1].innerHTML).toBe('');
  });

  it('should add the unique keys of all entries to the header', () => {
    const __this = {
      data: [
        1,
        'string',
        true,
        null,
        undefined,
        { a: 1, b: 2 },
        [1, 2, 3],
        { a: 3, b: 4, c: { d: 5 }, e: [1] },
      ],
    };

    const {
      headers: [header],
    } = JSONGrid.prototype.processArray.apply(__this);

    const dataHeaders = Array.from(header.children).slice(2);
    const headerValues = dataHeaders.map((h) => h.textContent);

    dataHeaders.forEach((header) => {
      expect(header.nodeName.toLowerCase()).toBe('th');
      expect(header.classList.contains('header')).toBeTruthy();
    });

    expect(headerValues).toEqual(['a', 'b', '0', '1', '2', 'c', 'e']);
  });

  it('should add one row per entry, with each individual field properly rendered', () => {
    const __this = {
      data: [
        1,
        'string',
        true,
        null,
        undefined,
        { a: 1, b: 2 },
        [1, 2, 3],
        { a: 3, b: 4, c: { d: 5 }, e: [1] },
      ],
    };

    const keys = ['a', 'b', '0', '1', '2', 'c', 'e'];

    const { rows } = JSONGrid.prototype.processArray.apply(__this);

    rows.forEach((row, rowIdx) => {
      const data = __this.data[rowIdx];

      // -- For each row we check each individual cell
      Array.from(row.children).forEach((entry, idx) => {
        // -- All cells must be `td`s
        expect(entry.nodeName.toLowerCase()).toBe('td');

        // -- The first cell is the index
        if (idx === 0) {
          expect(entry.textContent).toBe(rowIdx + '');
          expect(Array.from(entry.classList)).toContain('header');
        }

        // -- The second, the raw value
        if (idx === 1) {
          if (data && typeof data === 'object') {
            expect(entry.textContent).toMatch(/\[[\+|\-]\] \d* items/i);
          } else {
            expect(entry.textContent).toBe(data + '');
          }
          expect(Array.from(entry.classList)).toContain(typeof data);
        }

        // -- From the second onwards, the actual raw value represented by the key `k`
        if (idx > 2) {
          const keyid = idx - 2;
          const objKeyEntry = data[keys[keyid]];
          if (objKeyEntry && typeof objKeyEntry === 'object') {
            expect(entry.textContent).toMatch(/\[[\+|\-]\] \d* items/i);
          } else {
            expect(entry.textContent).toBe(objKeyEntry + '');
          }
          expect(Array.from(entry.classList)).toContain('table-wrapper');
        }
      });
    });
  });
});
