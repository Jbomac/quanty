import { Test, TestingModule } from '@nestjs/testing'

import { GuildResolver } from './guild.resolver'

describe('GuildResolver', () => {
  let resolver: GuildResolver

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GuildResolver,
        {
          provide: 'GUILD_SERVICE',
          useFactory: () => ({
            fetchGuild: jest.fn().mockResolvedValue([
              {
                guildId: '123',
                owner: true,
                owner_id: '123',
              },
            ]),
            fetchGuildChannels: jest.fn().mockResolvedValue([
              {
                guild_id: '123',
                position: 2,
                icon: '123',
              },
            ]),
          }),
        },
      ],
    }).compile()

    resolver = module.get<GuildResolver>(GuildResolver)
  })

  it('should be defined', () => {
    expect(resolver).toBeDefined()
  })

  describe('query guilds', () => {
    it('should return an array of guilds', async () => {
      expect(await resolver.guilds('123')).toEqual([
        {
          guildId: '123',
          owner: true,
          owner_id: '123',
        },
      ])
    })

    it('should return an array of channels', async () => {
      expect(
        await resolver.channels({
          id: '123',
          owner: true,
          afk_timeout: 2,
          emojis: [],
          features: [],
          name: 'guild',
          nsfw_level: 0,
          owner_id: '123',
          preferred_locale: 'us',
          premium_tier: 0,
          roles: [],
          stickers: [],
          splash: 'splash',
        }),
      ).toEqual([
        {
          guild_id: '123',
          position: 2,
          icon: '123',
        },
      ])
    })
  })
})
