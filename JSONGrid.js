'use strict';

var DOMHelper = {
  EXPANDER_TARGET_ATTRIBUTE: 'data-target-id',
  TABLE_SHRINKED_CLASSNAME: 'shrinked',
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
  createExpander: function (dataItems, target) {
    var expander = DOMHelper.createElement('span', 'expander');
    expander.textContent = '[' + DOMHelper.getExpanderSign(target) + '] ' + dataItems + ' items';
    expander.setAttribute(DOMHelper.EXPANDER_TARGET_ATTRIBUTE, target.id);
    expander.onclick = DOMHelper.onExpanderClick;
    return expander;
  },
  onExpanderClick: function (event) {
    var tableId = event.target.getAttribute(DOMHelper.EXPANDER_TARGET_ATTRIBUTE);
    var target = document.getElementById(tableId);

    if (target) {
      target.classList.toggle(DOMHelper.TABLE_SHRINKED_CLASSNAME);
      event.target.textContent = '[' + DOMHelper.getExpanderSign(target) + event.target.textContent.slice(2);
    }
  },
  getExpanderSign: function (target) {
    return target.classList.contains(DOMHelper.TABLE_SHRINKED_CLASSNAME)
      ? '+'
      : '-'
      ;
  }
}

function JSONGrid(data, container) {
  this.data = data;
  this.container = container instanceof HTMLElement
    ? container
    : null;
  this.instanceNumber = JSONGrid.instances || 0;
  JSONGrid.instances = (JSONGrid.instances || 0) + 1;
}

JSONGrid.prototype.processArray = function () {
  var keys = this.data.reduce(function (acc, val) {
    var keys = Object.keys(val);
    return acc.concat(keys);
  }, []);

  keys = keys.filter(function (value, idx) {
    return keys.indexOf(value) === idx;
  });

  var headers = DOMHelper.createElement('tr');
  headers.appendChild(DOMHelper.createElement('th'))
  keys.forEach(function (value) {
    var td = DOMHelper.createElement('th');
    td.textContent = value.toString();
    headers.appendChild(td);
  });

  var rows = this.data.map(function (obj, index) {
    var tr = DOMHelper.createElement('tr')
    var firstTd = DOMHelper.createElement('td', typeof index);

    firstTd.appendChild(new JSONGrid(index).generateDOM());
    tr.appendChild(firstTd);

    keys.forEach(function (key, keyIdx) {
      var td = DOMHelper.createElement('td', typeof obj, 'table-wrapper');
      var value = (obj[key] === undefined || obj[key] === null)
        ? '' + obj[key]
        : obj[key]
        ;
      td.appendChild(new JSONGrid(value).generateDOM());
      tr.appendChild(td);
    });

    return tr;
  });

  return {
    headers: [headers],
    rows: rows,
  };
}

JSONGrid.prototype.processObject = function () {
  var keys = Object.keys(this.data);
  var headers = DOMHelper.createElement('tr');
  keys.forEach(function (value) {
    var td = DOMHelper.createElement('td');
    td.textContent = '' + value;
    headers.appendChild(td);
  });
  var that = this;
  var rows = keys.map(function (key, index) {
    var tr = DOMHelper.createElement('tr')
    var keyTd = DOMHelper.createElement('td', 'string', 'rowName');
    var value = that.data[key];
    var tdType = typeof value;

    if (tdType === 'object') {
      var grid = new JSONGrid(value);
      value = grid.generateDOM();
    } else {
      value = DOMHelper.createElement('span', tdType, 'value');
      value.textContent = '' + that.data[key];
    }

    var valTd = DOMHelper.createElement('td', tdType);

    keyTd.textContent = key;

    valTd.appendChild(value);
    tr.appendChild(keyTd);
    tr.appendChild(valTd);

    return tr;
  });

  return {
    headers: [],
    rows: rows,
  };
}

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

  var container = DOMHelper.createElement('div', 'container');
  var tableId = 'table-' + this.instanceNumber;
  var intialClasses = this.instanceNumber !== 0 ? [DOMHelper.TABLE_SHRINKED_CLASSNAME] : [];
  var table = DOMHelper.createElement('table', 'table', intialClasses, tableId);
  var tbody = DOMHelper.createElement('tbody');
  var expander = DOMHelper.createExpander(dom.rows.length, table);
  container.appendChild(expander);

  dom.headers.forEach(function (val) { tbody.appendChild(val); });
  dom.rows.forEach(function (val) { tbody.appendChild(val); });

  table.appendChild(tbody);

  container.appendChild(table);

  return container;
};

JSONGrid.prototype.render = function (cb) {
  if (!this.container || !this.data) {
    return;
  }

  // -- Remove the children for re-render
  this.container.innerHTML = '';
  this.container.appendChild(this.generateDOM());
};

window.JSONGrid = JSONGrid;