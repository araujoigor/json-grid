const { DOMHelper } = require('../JSONGrid');

describe('createElement', () => {
  it('should create an element of the given type', () => {
    const elTypes = [
      'div',
      'p',
      'span',
      'customType',
      'blockquote',
      'h1',
      'script',
      'td',
      'th',
    ];

    elTypes.forEach((type) =>
      expect(DOMHelper.createElement(type).nodeName.toLowerCase()).toBe(
        type.toLowerCase()
      )
    );
  });

  it('should not apply any classes if valueType and additionalClasses are falsy/empty', () => {
    const el = DOMHelper.createElement('div');
    expect(el.classList.length).toBe(0);
  });

  it('should add the additionalClasses to the element class list', () => {
    const classes = ['class1', 'class2', 'class3', 'class4'];
    let el = DOMHelper.createElement('div', undefined, classes);
    classes.forEach((className) => expect(el.classList.contains(className)));

    el = DOMHelper.createElement('p', 'a_type', 'myClass');
    expect(el.classList.contains('myClass')).toBeTruthy();
  });

  it('should add the valueType to the element class list', () => {
    const classes = ['class1', 'class2', 'class3', 'class4'];
    let el = DOMHelper.createElement('div', 'a_type', classes);
    expect(el.classList.contains('a_type')).toBeTruthy();

    el = DOMHelper.createElement('p', 'a_type');
    expect(el.classList.contains('a_type')).toBeTruthy();
  });

  it('should set the element id if given', () => {
    let el = DOMHelper.createElement('div', 'a_type', 'classes', 'myId');
    expect(el.id).toBe('myId');

    el = DOMHelper.createElement('p');
    expect(el.id).toBe('');
  });

  it('should never mutate parameters', () => {
    const classes = ['test'];
    const classesCopy = classes.slice();
    DOMHelper.createElement('h1', 'a_type', classes, 'an_id');
    expect(classes).toEqual(classesCopy);
  });
});

describe('createJsonGridContainerElement', () => {
  it('should create a container with the correct type, classes and id', () => {
    const classes = ['class1', 'class2'];

    let el = DOMHelper.createJsonGridContainerElement(
      'my data',
      'div',
      'string',
      classes,
      'my_id'
    );

    [...classes, 'string'].forEach((className) =>
      expect(el.classList.contains(className)).toBeTruthy()
    );
    expect(el.nodeName.toLowerCase()).toBe('div');
    expect(el.id).toBe('my_id');

    el = DOMHelper.createJsonGridContainerElement(
      'my data',
      'td',
      undefined,
      'class'
    );
    expect(el.className).toBe('class');
    expect(el.nodeName).toBe('TD');

    el = DOMHelper.createJsonGridContainerElement('my data', 'th');
    expect(el.className).toBe('');
    expect(el.nodeName).toBe('TH');
  });

  it('should generate a JSONGrid DOM content if `data` is a truthy object', () => {
    const generateDOM = jest.fn().mockImplementation(() => {
      const mockedElement = document.createElement('div');
      mockedElement.innerHTML = 'mocked_inner_html';
      return mockedElement;
    });
    const JSONGrid = jest.fn().mockImplementation(() => ({ generateDOM }));

    expect(
      DOMHelper.createJsonGridContainerElement(
        {
          a: 1,
          b: 2,
        },
        'div',
        'dataType',
        'additionalClasses',
        'id',
        JSONGrid
      ).innerHTML
    ).toBe('<div>mocked_inner_html</div>');
    expect(JSONGrid).toHaveBeenCalledTimes(1);
    expect(generateDOM).toHaveBeenCalledTimes(1);

    generateDOM.mockClear();
    JSONGrid.mockClear();

    expect(
      DOMHelper.createJsonGridContainerElement(
        [1, 2],
        'div',
        'dataType',
        'additonalClases',
        'id',
        JSONGrid
      ).innerHTML
    ).toBe('<div>mocked_inner_html</div>');
    expect(JSONGrid).toHaveBeenCalledTimes(1);
    expect(generateDOM).toHaveBeenCalledTimes(1);
  });

  it('should generate DOM content throut createElement if `data` is not an object or a falsy object', () => {
    const values = [1, undefined, null, 'hi'];
    jest.spyOn(DOMHelper, 'createElement');

    values.forEach((value) => {
      DOMHelper.createJsonGridContainerElement(value);
      expect(DOMHelper.createElement).toHaveBeenCalledWith(
        'span',
        typeof value,
        'value'
      );
      DOMHelper.createElement.mockClear();
    });
  });
});

describe('createExpander', () => {
  afterAll(() => {
    DOMHelper.getExpanderSign.mockRestore();
  });

  it('should properly prepare the expander element', () => {
    const expanderSign = '#';
    const num = 5;

    DOMHelper.getExpanderSign = jest
      .spyOn(DOMHelper, 'getExpanderSign')
      .mockImplementation(() => expanderSign);

    const el = DOMHelper.createExpander(num, { id: 'id' });

    expect(el.getAttribute(DOMHelper.EXPANDER_TARGET_ATTRIBUTE)).toBe('id');
    expect(el.onclick).toEqual(DOMHelper.onExpanderClick);
    expect(el.textContent).toBe(`[#] ${num} items`);
  });
});

describe('onExpanderClick', () => {
  it('should properly toggle the class and update the content', () => {
    const elTable = document.createElement('div');
    elTable.classList.add(DOMHelper.TABLE_SHRINKED_CLASSNAME);
    elTable.id = 'id';

    const elShrinker = document.createElement('div');
    elShrinker.setAttribute(DOMHelper.EXPANDER_TARGET_ATTRIBUTE, elTable.id);
    elShrinker.textContent = '[+] any random content';

    document.body.appendChild(elTable);
    document.body.appendChild(elShrinker);

    DOMHelper.onExpanderClick({ target: elShrinker });

    expect(
      elTable.classList.contains(DOMHelper.TABLE_SHRINKED_CLASSNAME)
    ).toBeFalsy();
    expect(elShrinker.textContent).toBe('[-] any random content');

    DOMHelper.onExpanderClick({ target: elShrinker });

    expect(
      elTable.classList.contains(DOMHelper.TABLE_SHRINKED_CLASSNAME)
    ).toBeTruthy();
    expect(elShrinker.textContent).toBe('[+] any random content');
  });
});

describe('getExpanderSign', () => {
  it('should properly return the sign based on the target class', () => {
    const elShrinked = DOMHelper.createElement(
      'div',
      'string',
      DOMHelper.TABLE_SHRINKED_CLASSNAME
    );
    const el1 = DOMHelper.createElement('div', 'string');
    const el2 = DOMHelper.createElement('div', 'string', 'anything');

    expect(DOMHelper.getExpanderSign(elShrinked)).toBe('+');
    expect(DOMHelper.getExpanderSign(el1)).toBe('-');
    expect(DOMHelper.getExpanderSign(el2)).toBe('-');
  });
});
