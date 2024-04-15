const _ = require("lodash");
const dedent = require("dedent");
const moment = require("moment-timezone");
const Promise = require("bluebird");
const { Client } = require("@notionhq/client");

const WeeklyTask = require("./WeeklyTask");
const Setting = require("../models/Setting");
const Voting = require("../processors/Voting");

const notion = new Client({ auth: process.env.NOTION_KEY });

class VotingCloser extends WeeklyTask {
  constructor(discord, _notion = notion) {
    super(
      "VotingCloser",
      process.env.VOTING_CLOSER_WEEKDAY || "Monday",
      process.env.VOTING_CLOSER_STARTS_AT || "12",
    );
    this.discord = discord;
    this.notion = _notion;
  }

  async run() {
    console.log("VotingCloser picking winner...");
    await this.pickWinner();
  }

  filter({ msg, upVotes, downVotes }) {
    if (upVotes < 1) return false;
    if (msg.attachments.size < 1) return false;
    if (msg.reactions.cache.size < 1) return false;
    return true;
  }

  score(msg) {
    const upVotes = Voting.countUp(msg);
    const downVotes = Voting.countDown(msg);
    console.log(
      "   =>",
      `${_.get(msg, "author.username")}: ${_.get(
        msg,
        "content",
        "No content",
      )}`,
    );
    console.log("      upVotes: ", upVotes);
    return { msg, upVotes, downVotes };
  }

  rank(a, b) {
    return b.upVotes - a.upVotes;
  }

  async announce(channel, winnerData, runnerUpData) {
    const winner = _.get(winnerData, "msg.author");
    const runnerUp = _.get(runnerUpData, "msg.author");

    // const winnerText = winner
    //   ? `Banner do servidor atualizado para a foto enviada por <@${winner.id}> com ${winnerData.upVotes} upvotes.\n`
    //   : "Infelizmente nessa semana não tivemos ganhador do banner por falta de submissões.\n";
    //
    // const runnerUpText = runnerUpData
    //   ? `Em segundo lugar tivemos a foto enviada por <@${runnerUp.id}> com ${runnerUpData.upVotes} upvotes.\n`
    //   : "";
    //
    // const text = dedent`
    //   ${winnerText}${runnerUpText}
    //   Incentivamos a todos que mandem mais fotos de seus teclados, pois a sua foto pode estar em nosso banner! limite é de 10mb pra foto/gif
    //
    //   Lembrando que o banner é atualizado toda segunda-feira! Não deixem para postar depois!
    //   participem o quanto antes! @here
    //
    //   P.S.: Não esqueçam de mandar os seus banners com specs para facilitar caso você ganhe, e convido vocês para que venham conferir o nosso hall-of-fame aqui: https://kbrd.to/hall-of-fame
    // `;

    const winnerText = winner
      ? `Banner do servidor atualizado para a foto enviada por <@${winner.id}> com ${winnerData.upVotes} votos 🏆`
      : "Infelizmente nessa semana não tivemos ganhador do banner por falta de submissões.\n";

    const runnerUpText = runnerUpData
      ? `Em segundo lugar ficou <@${runnerUp.id}> com ${runnerUpData.upVotes} votos 🥈`
      : "";

    const text = dedent`
      ${winnerText}${runnerUpText}
      Lembrando que o banner é atualizado toda segunda-feira! Não deixem para postar depois!
      participem o quanto antes! @here 

      P.S.: Não esqueçam de mandar os seus banners com DESCRIÇÃO da build para facilitar caso você ganhe, limite de 10mb na foto.

      Sigam nosso Instagram https://www.instagram.com/mrkeebs.discord/
    `;

    return await channel.send(text);
  }

  async update(channel, msg) {
    console.log("Setting last draw to", msg.id);
    await Setting.set(`voting-last-draw-${channel.name}`, msg.id);
    const cycleKey = `votingcycle-${channel.name}`;
    const cycle = parseInt(await Setting.get(cycleKey, 1), 10);
    await Setting.set(cycleKey, cycle + 1);
  }

  async setBanner(channel, winnerData) {
    if (!winnerData) {
      console.log("Skipping banner - no winner");
      return;
    }
    const banner = winnerData.msg.attachments.array()[0].url;
    console.log("Setting Discord banner to", banner);
    try {
      await channel.guild.setBanner(
        banner,
        `Banner Winner - ${winnerData.msg.author.username}`,
      );
    } catch (error) {
      channel.send(`Sorry, could not set banner: ${error}`);
    }
  }

  async publishToNotion(winnerData) {
    if (!winnerData) return;
    const { msg } = winnerData;
    const url = msg.attachments.array()[0].url;
    const parts = msg.content.split("\n");
    const author = `${msg.author.username}#${msg.author.discriminator}`;
    const name = _.get(parts, "0", "N/A") || `${author}'s KB`;
    const details =
      msg.content.split("\n").splice(1).join("\n") ||
      "Nenhum detalhe enviado pelo usuário.";

    console.log("Sending winner to Notion Hall of Fame...");
    console.log("   Board Name:", name);
    console.log("   Details:", details);

    const page = await this.notion.pages.create({
      parent: {
        database_id: process.env.VOTING_NOTION_HOF_ID,
      },
      cover: {
        external: { url },
      },
      properties: {
        Date: {
          date: {
            start: moment().tz(this.timeZone),
          },
        },
        Image: {
          files: [
            {
              name,
              external: { url },
            },
          ],
        },
        Keyboard: {
          multi_select: [{ name }],
        },
        Winner: {
          title: [{ text: { content: author } }],
        },
      },
      children: [
        {
          object: "block",
          paragraph: {
            text: [{ text: { content: details } }],
          },
        },
        {
          object: "block",
          image: {
            external: { url },
          },
        },
      ],
    });
  }

  async pickWinner(votingChannels) {
    const channelStr = votingChannels || process.env.VOTING_CHANNELS;
    if (!channelStr) {
      throw new Error(`No channels defined for picking winner`);
    }

    const channels = channelStr.split(",");
    await Promise.map(channels, async (channelName) => {
      const channel = await this.discord.channels.cache.find(
        (c) => c.name === channelName,
      );
      if (!channel) {
        throw `No channel with name ${channelName} while picking a voting winner`;
      }
      const lastDraw = await Setting.get(`voting-last-draw-${channelName}`);
      const cycleMessages = await channel.messages.fetch({
        limit: 100,
        after: lastDraw,
      });
      const messages = cycleMessages
        .map(this.score.bind(this))
        .filter(this.filter.bind(this))
        .sort(this.rank.bind(this));
      const winner = _.get(messages, "0");
      const runnerUp = _.get(messages, "1");
      const announcementMessage = await this.announce(
        channel,
        winner,
        runnerUp,
      );
      await this.update(channel, announcementMessage);
      await this.setBanner(channel, winner);
      await this.publishToNotion(winner);
    });
  }
}

module.exports = VotingCloser;
