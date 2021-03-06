'use strict';

const _ = require('lodash');
const inherits = require('../../utils/inherits');

module.exports = BaseTypes => {
  const warn = BaseTypes.ABSTRACT.warn.bind(undefined, 'https://www.sqlite.org/datatype3.html');

  /**
   * Removes unsupported SQLite options, i.e., UNSIGNED and ZEROFILL, for the integer data types.
   * @param dataType The base integer data type.
   * @private
   */
  function removeUnsupportedIntegerOptions(dataType) {
    if (dataType._zerofill || dataType._unsigned) {
      warn(`SQLite does not support '${dataType.key}' with UNSIGNED or ZEROFILL. Plain '${dataType.key}' will be used instead.`);
      dataType._unsigned = undefined;
      dataType._zerofill = undefined;
    }
  }

  /**
   * @see https://sqlite.org/datatype3.html
   */

  BaseTypes.DATE.types.sqlite = ['DATETIME'];
  BaseTypes.STRING.types.sqlite = ['VARCHAR', 'VARCHAR BINARY'];
  BaseTypes.CHAR.types.sqlite = ['CHAR', 'CHAR BINARY'];
  BaseTypes.TEXT.types.sqlite = ['TEXT'];
  BaseTypes.TINYINT.types.sqlite = ['TINYINT'];
  BaseTypes.SMALLINT.types.sqlite = ['SMALLINT'];
  BaseTypes.MEDIUMINT.types.sqlite = ['MEDIUMINT'];
  BaseTypes.INTEGER.types.sqlite = ['INTEGER'];
  BaseTypes.BIGINT.types.sqlite = ['BIGINT'];
  BaseTypes.FLOAT.types.sqlite = ['FLOAT'];
  BaseTypes.TIME.types.sqlite = ['TIME'];
  BaseTypes.DATEONLY.types.sqlite = ['DATE'];
  BaseTypes.BOOLEAN.types.sqlite = ['TINYINT'];
  BaseTypes.BLOB.types.sqlite = ['TINYBLOB', 'BLOB', 'LONGBLOB'];
  BaseTypes.DECIMAL.types.sqlite = ['DECIMAL'];
  BaseTypes.UUID.types.sqlite = ['UUID'];
  BaseTypes.ENUM.types.sqlite = false;
  BaseTypes.REAL.types.sqlite = ['REAL'];
  BaseTypes.DOUBLE.types.sqlite = ['DOUBLE PRECISION'];
  BaseTypes.GEOMETRY.types.sqlite = false;
  BaseTypes.JSON.types.sqlite = ['JSON', 'JSONB'];

  function JSONTYPE() {
    if (!(this instanceof JSONTYPE)) return new JSONTYPE();
    BaseTypes.JSON.apply(this, arguments);
  }
  inherits(JSONTYPE, BaseTypes.JSON);

  JSONTYPE.parse = function parse(data) {
    return JSON.parse(data);
  };

  function DATE(length) {
    if (!(this instanceof DATE)) return new DATE(length);
    BaseTypes.DATE.apply(this, arguments);
  }
  inherits(DATE, BaseTypes.DATE);

  DATE.parse = function parse(date, options) {
    if (!date.includes('+')) {
      // For backwards compat. Dates inserted by sequelize < 2.0dev12 will not have a timestamp set
      return new Date(date + options.timezone);
    }
    return new Date(date); // We already have a timezone stored in the string
  };

  function DATEONLY() {
    if (!(this instanceof DATEONLY)) return new DATEONLY();
    BaseTypes.DATEONLY.apply(this, arguments);
  }
  inherits(DATEONLY, BaseTypes.DATEONLY);

  DATEONLY.parse = function parse(date) {
    return date;
  };

  function STRING(length, binary) {
    if (!(this instanceof STRING)) return new STRING(length, binary);
    BaseTypes.STRING.apply(this, arguments);
  }
  inherits(STRING, BaseTypes.STRING);

  STRING.prototype.toSql = function toSql() {
    if (this._binary) {
      return `VARCHAR BINARY(${this._length})`;
    } else {
      return BaseTypes.STRING.prototype.toSql.call(this);
    }
  };

  function TEXT(length) {
    if (!(this instanceof TEXT)) return new TEXT(length);
    BaseTypes.TEXT.apply(this, arguments);
  }
  inherits(TEXT, BaseTypes.TEXT);

  TEXT.prototype.toSql = function toSql() {
    if (this._length) {
      warn('SQLite does not support TEXT with options. Plain `TEXT` will be used instead.');
      this._length = undefined;
    }
    return 'TEXT';
  };

  function CITEXT() {
    if (!(this instanceof CITEXT)) return new CITEXT();
    BaseTypes.CITEXT.apply(this, arguments);
  }
  inherits(CITEXT, BaseTypes.CITEXT);

  CITEXT.prototype.toSql = function toSql() {
    return 'TEXT COLLATE NOCASE';
  };

  function CHAR(length, binary) {
    if (!(this instanceof CHAR)) return new CHAR(length, binary);
    BaseTypes.CHAR.apply(this, arguments);
  }
  inherits(CHAR, BaseTypes.CHAR);

  CHAR.prototype.toSql = function toSql() {
    if (this._binary) {
      return `CHAR BINARY(${this._length})`;
    } else {
      return BaseTypes.CHAR.prototype.toSql.call(this);
    }
  };

  function NUMBER(options) {
    if (!(this instanceof NUMBER)) return new NUMBER(options);
    BaseTypes.NUMBER.apply(this, arguments);
  }
  inherits(NUMBER, BaseTypes.NUMBER);

  NUMBER.prototype.toSql = function toSql() {
    let result = this.key;

    if (this._unsigned) {
      result += ' UNSIGNED';
    }
    if (this._zerofill) {
      result += ' ZEROFILL';
    }

    if (this._length) {
      result += `(${this._length}`;
      if (typeof this._decimals === 'number') {
        result += `,${this._decimals}`;
      }
      result += ')';
    }
    return result;
  };

  function TINYINT(length) {
    if (!(this instanceof TINYINT)) return new TINYINT(length);
    BaseTypes.TINYINT.apply(this, arguments);

    removeUnsupportedIntegerOptions(this);
  }
  inherits(TINYINT, BaseTypes.TINYINT);

  TINYINT.prototype.toSql = function toSql() {
    return NUMBER.prototype.toSql.call(this);
  };

  function SMALLINT(length) {
    if (!(this instanceof SMALLINT)) return new SMALLINT(length);
    BaseTypes.SMALLINT.apply(this, arguments);

    removeUnsupportedIntegerOptions(this);
  }
  inherits(SMALLINT, BaseTypes.SMALLINT);

  SMALLINT.prototype.toSql = function toSql() {
    return NUMBER.prototype.toSql.call(this);
  };

  function MEDIUMINT(length) {
    if (!(this instanceof MEDIUMINT)) return new MEDIUMINT(length);
    BaseTypes.MEDIUMINT.apply(this, arguments);

    removeUnsupportedIntegerOptions(this);
  }
  inherits(MEDIUMINT, BaseTypes.MEDIUMINT);

  MEDIUMINT.prototype.toSql = function toSql() {
    return NUMBER.prototype.toSql.call(this);
  };

  function INTEGER(length) {
    if (!(this instanceof INTEGER)) return new INTEGER(length);
    BaseTypes.INTEGER.apply(this, arguments);

    removeUnsupportedIntegerOptions(this);
  }
  inherits(INTEGER, BaseTypes.INTEGER);

  INTEGER.prototype.toSql = function toSql() {
    return NUMBER.prototype.toSql.call(this);
  };

  function BIGINT(length) {
    if (!(this instanceof BIGINT)) return new BIGINT(length);
    BaseTypes.BIGINT.apply(this, arguments);

    removeUnsupportedIntegerOptions(this);
  }
  inherits(BIGINT, BaseTypes.BIGINT);

  BIGINT.prototype.toSql = function toSql() {
    return NUMBER.prototype.toSql.call(this);
  };

  function FLOAT(length, decimals) {
    if (!(this instanceof FLOAT)) return new FLOAT(length, decimals);
    BaseTypes.FLOAT.apply(this, arguments);
  }
  inherits(FLOAT, BaseTypes.FLOAT);
  FLOAT.prototype.toSql = function toSql() {
    return NUMBER.prototype.toSql.call(this);
  };

  function DOUBLE(length, decimals) {
    if (!(this instanceof DOUBLE)) return new DOUBLE(length, decimals);
    BaseTypes.DOUBLE.apply(this, arguments);
  }
  inherits(DOUBLE, BaseTypes.DOUBLE);
  DOUBLE.prototype.toSql = function toSql() {
    return NUMBER.prototype.toSql.call(this);
  };

  function REAL(length, decimals) {
    if (!(this instanceof REAL)) return new REAL(length, decimals);
    BaseTypes.REAL.apply(this, arguments);
  }
  inherits(REAL, BaseTypes.REAL);
  REAL.prototype.toSql = function toSql() {
    return NUMBER.prototype.toSql.call(this);
  };

  [FLOAT, DOUBLE, REAL].forEach(floating => {
    floating.parse = function parse(value) {
      if (_.isString(value)) {
        if (value === 'NaN') {
          return NaN;
        }
        if (value === 'Infinity') {
          return Infinity;
        }
        if (value === '-Infinity') {
          return -Infinity;
        }
      }
      return value;
    };
  });

  function ENUM() {
    if (!(this instanceof ENUM)) {
      const obj = Object.create(ENUM.prototype);
      ENUM.apply(obj, arguments);
      return obj;
    }
    BaseTypes.ENUM.apply(this, arguments);
  }
  inherits(ENUM, BaseTypes.ENUM);

  ENUM.prototype.toSql = function toSql() {
    return 'TEXT';
  };

  const exports = {
    DATE,
    DATEONLY,
    STRING,
    CHAR,
    NUMBER,
    FLOAT,
    REAL,
    'DOUBLE PRECISION': DOUBLE,
    TINYINT,
    SMALLINT,
    MEDIUMINT,
    INTEGER,
    BIGINT,
    TEXT,
    ENUM,
    JSON: JSONTYPE,
    CITEXT
  };

  _.forIn(exports, (DataType, key) => {
    if (!DataType.key) DataType.key = key;
    if (!DataType.extend) {
      DataType.extend = oldType => {
        return new DataType(oldType.options);
      };
    }
  });

  return exports;

};
