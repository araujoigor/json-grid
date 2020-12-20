'use strict';

var DOMHelper = {
  EXPANDER_TARGET_ATTRIBUTE: 'data-target-id',
  TABLE_SHRINKED_CLASSNAME: 'shrinked',
  JSON_GRID_CONTAINER_CLASSNAME: 'json-grid-container',
  JSON_GRID_ELEMENT_CONTAINER_CLASSNAME: 'json-grid-element-container',
  createElement: function (type, valueType, additionalClasses, id) {
    var element = document.createElement(type);
    var classes = additionalClasses || [];

    if (!Array.isArray(classes)) classes = [classes];
    if (valueType) classes.push(valueType);

    DOMTokenList.prototype.add.apply(element.classList, classes);

    if (id) {
      element.id = id;
    }

    return element;
  },
  createJsonGridContainerElement: function (
    data,
    domType,
    dataType,
    additionalClasses,
    id
  ) {
    // -- Anything that is not a valid object/array should be stringified
    // -- (undefined and null included)
    var value =
      typeof data === 'object' && data
        ? new JSONGrid(data).generateDOM()
        : DOMHelper.createElement('span', typeof data, 'value');

    if (!value.innerHTML) {
      value.textContent = '' + data;
    }

    var container = DOMHelper.createElement(
      domType,
      dataType,
      additionalClasses,
      id
    );
    container.appendChild(value);

    return container;
  },
  createExpander: function (dataItems, target) {
    var expander = DOMHelper.createElement('span', 'expander');
    expander.textContent =
      '[' + DOMHelper.getExpanderSign(target) + '] ' + dataItems + ' items';
    expander.setAttribute(DOMHelper.EXPANDER_TARGET_ATTRIBUTE, target.id);
    expander.onclick = DOMHelper.onExpanderClick;
    return expander;
  },
  onExpanderClick: function (event) {
    var tableId = event.target.getAttribute(
      DOMHelper.EXPANDER_TARGET_ATTRIBUTE
    );
    var target = document.getElementById(tableId);
    if (target) {
      target.classList.toggle(DOMHelper.TABLE_SHRINKED_CLASSNAME);
      event.target.textContent =
        '[' +
        DOMHelper.getExpanderSign(target) +
        event.target.textContent.slice(2);
    }
  },
  getExpanderSign: function (target) {
    return target.classList.contains(DOMHelper.TABLE_SHRINKED_CLASSNAME)
      ? '+'
      : '-';
  },
};

function JSONGrid(data, container) {
  this.data = data;
  this.container = container instanceof HTMLElement ? container : null;
  this.instanceNumber = JSONGrid.instances || 0;
  JSONGrid.instances = (JSONGrid.instances || 0) + 1;
}

JSONGrid.prototype.processArray = function () {
  var keys = this.data
    .reduce(function (acc, val) {
      if (typeof val !== 'object') {
        return acc;
      }
      var keys = Object.keys(val);
      return acc.concat(keys);
    }, [])
    // -- Remove duplicates
    .filter(function (value, idx, reducedKeys) {
      return reducedKeys.indexOf(value) === idx;
    });

  var headers = DOMHelper.createElement('tr');
  headers.appendChild(DOMHelper.createElement('th'));

  // -- Add value as header (for primitive, non-object, types)
  // -- otherwise, they are not shown or shown as arrays (strings)
  headers.appendChild(DOMHelper.createElement('th'));

  // -- Add object keys as headers
  keys.forEach(function (value) {
    headers.appendChild(
      DOMHelper.createJsonGridContainerElement(
        value,
        'th',
        typeof value,
        'header'
      )
    );
  });

  var rows = this.data.map(function (obj, index) {
    var tr = DOMHelper.createElement('tr');
    tr.appendChild(
      DOMHelper.createJsonGridContainerElement(
        index,
        'td',
        typeof index,
        'header'
      )
    );
    tr.appendChild(
      DOMHelper.createJsonGridContainerElement(obj, 'td', typeof obj)
    );

    keys.forEach(function (key) {
      tr.appendChild(
        DOMHelper.createJsonGridContainerElement(
          obj[key],
          'td',
          typeof obj,
          'table-wrapper'
        )
      );
    });

    return tr;
  });

  return {
    headers: [headers],
    rows: rows,
  };
};

JSONGrid.prototype.processObject = function () {
  var data = this.data;
  var rows = Object.keys(this.data).map(function (key) {
    var tr = DOMHelper.createElement('tr');
    tr.appendChild(
      DOMHelper.createJsonGridContainerElement(key, 'td', 'string', 'header')
    );
    tr.appendChild(
      DOMHelper.createJsonGridContainerElement(data[key], 'td', typeof value)
    );
    return tr;
  });

  return {
    headers: [],
    rows: rows,
  };
};

JSONGrid.prototype.generateDOM = function () {
  var dom;

  if (Array.isArray(this.data)) {
    dom = this.processArray();
  } else if (typeof this.data === 'object') {
    dom = this.processObject();
  } else {
    // -- Create a span element and early return since this is a "leaf"
    var span = DOMHelper.createElement('span', typeof this.data);
    span.textContent = '' + this.data;
    return span;
  }

  var container = DOMHelper.createElement(
    'div',
    DOMHelper.JSON_GRID_ELEMENT_CONTAINER_CLASSNAME
  );
  var tableId = 'table-' + this.instanceNumber;
  var intialClasses =
    this.instanceNumber !== 0 ? [DOMHelper.TABLE_SHRINKED_CLASSNAME] : [];
  var table = DOMHelper.createElement('table', 'table', intialClasses, tableId);
  var tbody = DOMHelper.createElement('tbody');
  var expander = DOMHelper.createExpander(dom.rows.length, table);
  container.appendChild(expander);

  dom.headers.forEach(function (val) {
    tbody.appendChild(val);
  });
  dom.rows.forEach(function (val) {
    tbody.appendChild(val);
  });

  table.appendChild(tbody);

  container.appendChild(table);

  return container;
};

JSONGrid.prototype.render = function () {
  if (!this.container || !this.data) {
    return;
  }

  // -- Remove the children for re-render
  this.container.innerHTML = '';
  this.container.appendChild(this.generateDOM());

  this.container.classList.add(DOMHelper.JSON_GRID_CONTAINER_CLASSNAME);
};

if (typeof window !== 'undefined') {
  window.JSONGrid = JSONGrid;
}

if (typeof module !== 'undefined') {
  module.exports = JSONGrid;
}
