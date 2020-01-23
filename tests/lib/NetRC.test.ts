import { NetRC } from '../../src/lib/NetRC';
import path from 'path';
import { expect } from 'chai';
import { AssertionError } from 'assert';

describe('NetRC', () => {
   it('should correctly return default config', async () => {
      const netrc = new NetRC(path.resolve(__dirname, '../fixtures/withDefault'));

      await netrc.load();

      const defaultMachine = netrc.getConfig('thisdoesntexist.net');

      expect(defaultMachine).to.be.an('object');
      if (!defaultMachine) {
         throw new AssertionError();
      }
      expect(defaultMachine.login).to.eql('somethingelse');
      expect(defaultMachine.password).to.eql('mydefaultpassword');
   });

   it('should get the correct machine config', async () => {
      const netrc = new NetRC(path.resolve(__dirname, '../fixtures/withDefault'));

      await netrc.load();

      const defaultMachine = netrc.getConfig('example.com');

      expect(defaultMachine).to.be.an('object');
      if (!defaultMachine) {
         throw new AssertionError();
      }
      expect(defaultMachine.login).to.eql('something');
      expect(defaultMachine.password).to.eql('mypassword');
   });

   it('should parse one line configs', async () => {
      const netrc = new NetRC(path.resolve(__dirname, '../fixtures/withDefault'));

      await netrc.load();

      const defaultMachine = netrc.getConfig('oneline.com');

      expect(defaultMachine).to.be.an('object');
      if (!defaultMachine) {
         throw new AssertionError();
      }
      expect(defaultMachine.login).to.eql('oneliner');
      expect(defaultMachine.password).to.eql('thisisoneline#');
   });

   it('should ignore comments on a property line', async () => {
      const netrc = new NetRC(path.resolve(__dirname, '../fixtures/withDefault'));

      await netrc.load();

      const defaultMachine = netrc.getConfig('comment.com');

      expect(defaultMachine).to.be.an('object');
      if (!defaultMachine) {
         throw new AssertionError();
      }
      expect(defaultMachine.login).to.eql('commentuser');
   });

   it('returns null for missing machines with no default', async () => {
      const netrc = new NetRC(path.resolve(__dirname, '../fixtures/withoutDefault'));

      await netrc.load();

      const defaultMachine = netrc.getConfig('notthere.com');

      expect(defaultMachine).to.be.a('null');
   });

   describe('no indentation', async () => {
      it('should correctly return default config', async () => {
         const netrc = new NetRC(path.resolve(__dirname, '../fixtures/noIndentation'));

         await netrc.load();

         const defaultMachine = netrc.getConfig('thisdoesntexist.net');

         expect(defaultMachine).to.be.an('object');
         if (!defaultMachine) {
            throw new AssertionError();
         }
         expect(defaultMachine.login).to.eql('somethingelse');
         expect(defaultMachine.password).to.eql('mydefaultpassword');
      });

      it('should get the correct machine config', async () => {
         const netrc = new NetRC(path.resolve(__dirname, '../fixtures/noIndentation'));

         await netrc.load();

         const defaultMachine = netrc.getConfig('example.com');

         expect(defaultMachine).to.be.an('object');
         if (!defaultMachine) {
            throw new AssertionError();
         }
         expect(defaultMachine.login).to.eql('something');
         expect(defaultMachine.password).to.eql('mypassword');
      });
   });
});
