class Author {
  constructor(message) {
    this.message = message;
  }

  async send(content) {
    this.message.addDirectMessage(content);
    return Promise.resolve();
  }
}

class Channel {
  constructor(message, name) {
    this.name = name;
  }
}

class FakeMessage {
  constructor(content, { channelName }) {
    this.content = content;
    this.author = new Author(this);
    if (channelName) {
      this.channel = new Channel(this, channelName);
    }
    this.directMessages = [];
  }

  addDirectMessage(content) {
    this.directMessages.push(content);
  }

  get lastDirectMessage() {
    return this.directMessages[this.directMessages.length-1];
  }
}

module.exports = FakeMessage;

{/* <ref *2> Message {
  channel: <ref *1> TextChannel {
    type: 'text',
    deleted: false,
    id: '643999206587105300',
    name: 'other',
    rawPosition: 1,
    parentID: '640907929683361802',
    permissionOverwrites: Collection(0) [Map] {},
    topic: null,
    lastMessageID: '777958140096413697',
    rateLimitPerUser: 0,
    lastPinTimestamp: null,
    guild: Guild {
      members: [GuildMemberManager],
      channels: [GuildChannelManager],
      roles: [RoleManager],
      presences: [PresenceManager],
      voiceStates: [VoiceStateManager],
      deleted: false,
      available: true,
      id: '640907929222119466',
      shardID: 0,
      name: 'Bot Test',
      icon: null,
      splash: null,
      discoverySplash: null,
      region: 'brazil',
      memberCount: 4,
      large: false,
      features: [],
      applicationID: null,
      afkTimeout: 300,
      afkChannelID: null,
      systemChannelID: null,
      embedEnabled: undefined,
      premiumTier: 0,
      premiumSubscriptionCount: 0,
      verificationLevel: 'NONE',
      explicitContentFilter: 'DISABLED',
      mfaLevel: 0,
      joinedTimestamp: 1604709403308,
      defaultMessageNotifications: 'MENTIONS',
      systemChannelFlags: [SystemChannelFlags],
      maximumMembers: 250000,
      maximumPresences: null,
      approximateMemberCount: null,
      approximatePresenceCount: null,
      vanityURLCode: null,
      vanityURLUses: null,
      description: null,
      banner: null,
      rulesChannelID: null,
      publicUpdatesChannelID: null,
      preferredLocale: 'en-US',
      ownerID: '399970540586270722',
      emojis: [GuildEmojiManager]
    },
    messages: MessageManager {
      cacheType: [class LimitedCollection extends Collection],
      cache: [LimitedCollection [Map]],
      channel: [Circular *1]
    },
    nsfw: false,
    _typing: Map(0) {}
  },
  deleted: false,
  id: '777958140096413697',
  type: 'DEFAULT',
  system: false,
  content: 'teste',
  author: User {
    id: '399970540586270722',
    system: null,
    locale: null,
    flags: UserFlags { bitfield: 512 },
    username: 'fcoury | mrkeebs.com',
    bot: false,
    discriminator: '0001',
    avatar: '806efe9ef1fb414b53a73ec1375d23ff',
    lastMessageID: '777958140096413697',
    lastMessageChannelID: '643999206587105300'
  },
  pinned: false,
  tts: false,
  nonce: '777958139856158720',
  embeds: [],
  attachments: Collection(0) [Map] {},
  createdTimestamp: 1605550074362,
  editedTimestamp: 0,
  reactions: ReactionManager {
    cacheType: [class Collection extends Collection],
    cache: Collection(0) [Map] {},
    message: [Circular *2]
  },
  mentions: MessageMentions {
    everyone: false,
    users: Collection(0) [Map] {},
    roles: Collection(0) [Map] {},
    _members: null,
    _channels: null,
    crosspostedChannels: Collection(0) [Map] {}
  },
  webhookID: null,
  application: null,
  activity: null,
  _edits: [],
  flags: MessageFlags { bitfield: 0 },
  reference: null
} */}
