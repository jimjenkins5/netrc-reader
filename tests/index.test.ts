import * as lib from '../src/index';
import { expect } from 'chai';

describe('index', () => {
   it('should exist', () => {
      expect(lib).to.be.an('object');
   });

   it('should export NetRC', () => {
      expect(lib.NetRC).to.be.a('function');
   });
});
