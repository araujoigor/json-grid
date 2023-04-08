const data = require('./__data__/complexJson.json');
const { JSONGrid, DOMHelper } = require('../JSONGrid');

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

it('should populate window if it exist', () => {
  expect(new JSONGrid()).toBeInstanceOf(window.JSONGrid);
})

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

describe('processObject', () => {
  it('should create and array of rows for each key-pair value in the object', () => {
    const __this = {
      data: {
        numValue: 1,
        strValue: 'value',
        undefinedValue: undefined,
        nullValue: null,
        trueValue: true,
        falseValue: false,
        obj: { a: 1, b: '2', c: ['a', 1, 2, false] },
        array: [1, '2', null, false, true, { a: 1, b: '2' }],
      },
    };
    const dataKeys = Object.keys(__this.data);

    const { rows } = JSONGrid.prototype.processObject.apply(__this);

    // -- Reset instance counter to compare each row against
    // -- the createJsonGridContainerElement implementation
    JSONGrid.instances = 0;

    expect(rows.length).toEqual(Object.keys(__this.data).length);
    rows.forEach((tableRow, idx) => {
      expect(tableRow.children.length).toEqual(2);
      expect(tableRow.children[0]).toEqual(
        DOMHelper.createJsonGridContainerElement(
          dataKeys[idx],
          'td',
          'string',
          'header'
        )
      );
      expect(tableRow.children[1]).toEqual(
        DOMHelper.createJsonGridContainerElement(
          __this.data[dataKeys[idx]],
          'td'
        )
      );
    });
  });
});

describe('generateDOM', () => {
  const processArraySpy = jest.spyOn(JSONGrid.prototype, 'processArray');
  const processObjectSpy = jest.spyOn(JSONGrid.prototype, 'processObject');
  const createElementSpy = jest.spyOn(DOMHelper, 'createElement');

  afterEach(() => {
    processArraySpy.mockClear();
    processObjectSpy.mockClear();
    createElementSpy.mockClear();
  });

  it('should create the right DOM wrapping structure within the container', () => {
    const data1 = 'text';
    const data2 = 0;
    const data3 = [
      { data: 'data', tab: 'tab' },
      { data: 'data1', tab: 'tab1' },
      [1, 2, 3],
      'test',
      1,
      false,
      null,
      undefined,
    ];
    const data4 = {
      data: 'data',
      tab: 'tab',
      arr: ['a', 'b', 'c', 1, 2, false, null, 0, undefined],
      falsy: false,
      nully: null,
    };

    const dom1 = new JSONGrid(data1).generateDOM();
    const dom2 = new JSONGrid(data2).generateDOM();
    const dom3 = new JSONGrid(data3).generateDOM();
    const dom4 = new JSONGrid(data4).generateDOM();

    expect(dom1).toMatchSnapshot();
    expect(dom2).toMatchSnapshot();
    expect(dom3).toMatchSnapshot();
    expect(dom4).toMatchSnapshot();
  });

  it('should only call processObject when initialized with an object', () => {
    new JSONGrid({ key1: 'data1', key2: 'data2' }).generateDOM();
    expect(processObjectSpy).toHaveBeenCalled();
    expect(processArraySpy).not.toHaveBeenCalled();
    expect(createElementSpy.mock.calls.length).toBeGreaterThan(0);
  });

  it('should only call processArray when initialized with an array', () => {
    new JSONGrid([1, 2, 3]).generateDOM();
    expect(processArraySpy).toHaveBeenCalled();
    expect(processObjectSpy).not.toHaveBeenCalled();
    expect(createElementSpy.mock.calls.length).toBeGreaterThan(0);
  });

  it('should only call createElement when initialized with scalar values', () => {
    new JSONGrid('test').generateDOM();
    expect(processArraySpy).not.toHaveBeenCalled();
    expect(processObjectSpy).not.toHaveBeenCalled();
    expect(createElementSpy.mock.calls.length).toEqual(1);

    new JSONGrid(0).generateDOM();
    expect(processArraySpy).not.toHaveBeenCalled();
    expect(processObjectSpy).not.toHaveBeenCalled();
    expect(createElementSpy.mock.calls.length).toEqual(2);
  });
});

describe('render', () => {
  const spy = jest.spyOn(JSONGrid.prototype, 'generateDOM');

  beforeEach(() => {
    spy.mockClear();
  });

  it('should fill the container with generateDOM return value and append JSON_GRID_CONTAINER_CLASSNAME to the class list', () => {
    const container = DOMHelper.createElement('div', null, 'container');
    new JSONGrid('data', container).render();

    expect(container.classList).toContain(
      DOMHelper.JSON_GRID_CONTAINER_CLASSNAME
    );
    expect(spy).toHaveBeenCalled();
  });

  it('should not do anything if the data is null or undefined', () => {
    const container = DOMHelper.createElement('div', null, 'container');
    new JSONGrid(null, container).render();
    new JSONGrid(undefined, container).render();

    expect(container.classList).not.toContain(
      DOMHelper.JSON_GRID_CONTAINER_CLASSNAME
    );
    expect(spy).not.toHaveBeenCalled();
  });

  it('should not do anything if the container is null or undefined', () => {
    new JSONGrid('test', undefined).render();
    new JSONGrid('test', null).render();

    expect(spy).not.toHaveBeenCalled();
  });
});
