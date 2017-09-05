import baseConfig from './config';
import cloneDeep from 'lodash/cloneDeep';

describe('config', () => {

  let config;

  beforeEach(() => {
    config = cloneDeep(baseConfig);
  });

  it('initializes required properties', () => {
    config.has = config.hasOwnProperty;
    expect(config.has('apiUrl')).toBe(true);
    expect(config.has('schemaName')).toBe(true);
    expect(config.has('displayField')).toBe(true);
    expect(config.has('thisEntity')).toBe(true);
  });

  describe('.hasRequiredProps', () => {

    it('returns false if all required props are falsy', () => {
      expect(config.hasRequiredProps()).toBe(false);
    });

    it ('returns true if all required props are truthy', () => {
      config.apiUrl = 'https://fake.url';
      config.schemaName = 'wa_wa_entity_wa_entity';
      config.displayField = 'wa_field';
      config.thisEntity = {
        name: 'wa_entity',
        id: '12345'
      };

      expect(config.hasRequiredProps()).toBe(true);
    });

    const incompleteConfigs = [
      {
        apiUrl: undefined,
        schemaName: 'wa_wa_entity_wa_entity',
        displayField: 'wa_field',
        thisEntity: { name: 'wa_entity', id: '12345' },
      },
      {
        apiUrl: 'https://fake.url',
        schemaName: undefined,
        displayField: 'wa_field',
        thisEntity: { name: 'wa_entity', id: '12345' },
      },
      {
        apiUrl: 'https://fake.url',
        schemaName: 'wa_wa_entity_wa_entity',
        displayField: undefined,
        thisEntity: { name: 'wa_entity', id: '12345' },
      },
      {
        apiUrl: 'https://fake.url',
        schemaName: 'wa_wa_entity_wa_entity',
        displayField: 'wa_field',
        thisEntity: undefined,
      },
      {
        apiUrl: 'https://fake.url',
        schemaName: 'wa_wa_entity_wa_entity',
        displayField: 'wa_field',
        thisEntity: { name: undefined, id: '12345' },
      },
      {
        apiUrl: 'https://fake.url',
        schemaName: 'wa_wa_entity_wa_entity',
        displayField: 'wa_field',
        thisEntity: { name: 'wa_entity', id: undefined },
      },
    ];

    incompleteConfigs.forEach(incompleteConfig => {
      it (`returns false if config is ${JSON.stringify(incompleteConfig, null, 2)}`, () => {
        expect(Object.assign(config, incompleteConfig).hasRequiredProps()).toBe(false);
      });
    });

  });

});
