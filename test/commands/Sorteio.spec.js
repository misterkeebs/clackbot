const { expect } = require('chai');
const nock = require('nock');
const moment = require('moment');

const FakeInterface = require('./FakeInterface');
const iface = new FakeInterface();

const User = require('../../src/models/User');
const Raffle = require('../../src/models/Raffle');
const sorteio = require('../../src/commands/Sorteio');

describe('Sorteio', () => {
  beforeEach(() => iface.reset());

  describe('with no clacks or subcommand', () => {
    describe('with no ongoing raffle', () => {
      beforeEach(async () => {
        await sorteio(iface, { channel: 'channel', user: 'user', message: '!sorteio' });
      });

      it('replies no active raffle', () => {
        expect(iface.lastMessage).to.eql('nenhum sorteio ativo no momento.');
      });
    });

    describe('with an ongoing raffle', () => {
      beforeEach(async () => {
        await Raffle.query().insertAndFetch({
          name: 'Sticker',
          startsAt: moment().add(-2, 'minutes'),
          endsAt: moment().add(1, 'minutes'),
        });

        await sorteio(iface, { channel: 'channel', user: 'user', message: '!sorteio' });
      });

      it('replies with raffle info', () => {
        expect(iface.lastMessage).to.include('estamos sorteando Sticker. O sorteio se encerra daqui');
      });
    });
  });

  describe('with clacks', () => {
    describe('with no ongoing raffle', () => {
      beforeEach(async () => {
        await sorteio(iface, { channel: 'channel', user: 'user', message: '!sorteio 10' });
      });

      it('replies no active raffle', () => {
        expect(iface.lastMessage).to.eql('nenhum sorteio ativo no momento.');
      });
    });

    describe('with an ongoing raffle', () => {
      beforeEach(async () => {
        await Raffle.query().insertAndFetch({
          name: 'Sticker',
          startsAt: moment().add(-2, 'minutes'),
          endsAt: moment().add(1, 'minutes'),
        });
      });

      describe('with no clacks at all', () => {
        beforeEach(async () => {
          await sorteio(iface, { channel: 'channel', user: 'user', message: '!sorteio 10' });
        });

        it('replies with an error saying user has no clacks', () => {
          expect(iface.lastMessage).to.eql('infelizmente você não tem clacks prá participar desse sorteio.');
        });
      });

      describe('with not enough clacks', () => {
        beforeEach(async () => {
          await User.query().insert({ displayName: 'user', bonus: 9 });
          await sorteio(iface, { channel: 'channel', user: 'user', message: '!sorteio 10' });
        });

        it('replies with an error saying user has not enough clacks', () => {
          expect(iface.lastMessage).to.eql('você não tem saldo suficiente prá participar com 10 clacks. Use !clacks prá saber quantas vc tem.');
        });
      });

      describe('with enough clacks', () => {
        let user;

        beforeEach(async () => {
          user = await User.query().insert({ displayName: 'user', bonus: 11 });
          await sorteio(iface, { channel: 'channel', user: 'user', message: '!sorteio 10' });
        });

        it('replies saying user is participating', () => {
          expect(iface.lastMessage).to.eql('você está participando com 10 clacks. Você tem agora 1 clacks.');
        });

        it('discounts the used bonus from the user', async () => {
          const newUser = await user.$query();
          expect(newUser.bonus).to.eql(1);
        });
      });
    });
  });

  describe('with create subcommand', () => {
    describe('when mod', () => {
      describe('with wrong command', () => {
        it('replies with the error message', async () => {
          await sorteio(iface, { channel: 'channel', user: 'user', message: '!sorteio criar', userData: { mod: true } });
          expect(iface.lastMessage).to.eql('use !sorteio criar <duração em minutos> <nome>.');
        });
      });

      describe('with wrong params', () => {
        it('replies with the error message', async () => {
          await sorteio(iface, { channel: 'channel', user: 'user', message: '!sorteio criar outro 2', userData: { mod: true } });
          expect(iface.lastMessage).to.eql('use !sorteio criar <duração em minutos> <nome>.');
        });
      });

      describe('with existing raffle', () => {
        beforeEach(async () => {
          await Raffle.create('sorteio', 2);
          await sorteio(iface, { channel: 'channel', user: 'user', message: '!sorteio criar 2 outro', userData: { mod: true } });
        });

        it('tells the user about it', () => {
          expect(iface.lastMessage).to.eql('já existe sorteio aberto - sorteio');
        });

        it(`doesn't create a new raffle`, async () => {
          const [ { count }] = await Raffle.query().count();
          expect(count).to.eql('1');
        });
      });

      describe('with no existing raffle', () => {
        let raffle;

        beforeEach(async () => {
          await sorteio(iface, { channel: 'channel', user: 'user', message: '!sorteio criar 2 Novo Sorteio', userData: { mod: true } });
          [ raffle ] = await Raffle.query();
        });

        it('returns an error', () => {
          expect(iface.lastMessage).to.eql('sorteio Novo Sorteio criado e aberto por 2 minutos! Mande !sorteio <clacks> para participar!');
        });

        it(`creates a new raffle with the proper name`, async () => {
          expect(raffle.name).to.eql('Novo Sorteio');
        });
      });
    });

    describe('when not mod', () => {
      it('igores the command', async () => {
        await sorteio(iface, { channel: 'channel', user: 'user', message: '!sorteio criar 2 Velho Sorteio' });
        expect(iface.lastMessage).to.eql('nenhum sorteio ativo no momento.');
      });
    });
  });

  describe('with run subcommand', () => {
    describe('with no ongoing raffle', () => {
      beforeEach(async () => {
        await sorteio(iface, { channel: 'channel', user: 'user', message: '!sorteio rodar', userData: { mod: true } });
      });

      it('sends an error message', async () => {
        expect(iface.lastMessage).to.eql('não existe sorteio aberto no momento.');
      });
    });

    describe('with an ongoing raffle', () => {
      let raffle, occurrences;

      beforeEach(async () => {
        nock('http://localhost:5000').post('/startRaffle').reply(200, (uri, body) => {
          occurrences = Array.from(new Set(body.players)).reduce((hash, val) => {
            hash[val] = body.players.filter(v => v === val).length;
            return hash;
          }, {});
        });
        await User.query().insert({ displayName: 'player1', bonus: 22 });
        await User.query().insert({ displayName: 'player2', bonus: 22 });
        await User.query().insert({ displayName: 'player3', bonus: 22 });

        raffle = await Raffle.create('Meu Sorteio', 2);
        await raffle.addPlayer('player1', 1);
        await raffle.addPlayer('player2', 10);
        await raffle.addPlayer('player3', 21);

        await sorteio(iface, { channel: 'channel', user: 'user', message: '!sorteio rodar', userData: { mod: true } });
      });

      it('opens the raffle', async () => {
        expect(iface.lastMessage).to.eql('iniciando abertura do sorteio.');
      });

      it('sends 1 player1', async () => {
        expect(occurrences['player1']).to.eql(1);
      });

      it('sends 10 player2', async () => {
        expect(occurrences['player2']).to.eql(10);
      });

      it('sends 1 player1', async () => {
        expect(occurrences['player3']).to.eql(21);
      });
    });
  });

  describe('with choose subcommand', () => {
    describe('with no ongoing raffle', () => {
      beforeEach(async () => {
        await sorteio(iface, { channel: 'channel', user: 'user', message: '!sorteio escolher', userData: { mod: true } });
      });

      it('sends an error message', async () => {
        expect(iface.lastMessage).to.eql('não existe sorteio aberto no momento.');
      });
    });

    describe('with an ongoing raffle', () => {
      let raffle, player;

      beforeEach(async () => {
        player = await User.query().insert({ displayName: 'player1', bonus: 22 });

        const theRaffle = await Raffle.create('Meu Sorteio', 2);
        await theRaffle.addPlayer('player1', 1);

        await sorteio(iface, { channel: 'channel', user: 'user', message: '!sorteio escolher', userData: { mod: true } });
        raffle = await theRaffle.$query();
      });

      it('selects a winner', async () => {
        expect(iface.lastMessage).to.eql('o sorteado foi player1! Parabéns!');
      });

      it('sets the raffle winner', async () => {
        expect(raffle.winnerId).to.eql(player.id);
      });

      it('sets the raffled at time', () => {
        expect(raffle.raffledAt).to.not.be.null;
      });
    });
  });
});
