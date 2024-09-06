const { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } = require('discord.js');
const { addPoint, correctPoint, clearPoint } = require('../../controller/point');
const { getAllAdmin } = require('../../services/admin');
const { deleteAllPoints } = require('../../services/point');
const logger = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('point')
    .setDescription('[RESTRICTED] Point commands.')
    .addSubcommand((command) =>
      command
        .setName('add')
        .setDescription('[RESTRICTED] Menambahkan point ke user.')
        .addUserOption((option) =>
          option.setName('user').setDescription('Pilih user').setRequired(true),
        )
        .addNumberOption((option) =>
          option
            .setName('point')
            .setDescription('Jumlah point.')
            .setMinValue(0)
            .setMaxValue(20)
            .setRequired(true),
        )
        .addStringOption((option) =>
          option.setName('reason').setDescription('Keterangan menambah point.').setRequired(true),
        ),
    )
    .addSubcommand((command) =>
      command
        .setName('minus')
        .setDescription('[RESTRICTED] Mengurangi point user.')
        .addUserOption((option) =>
          option.setName('user').setDescription('Pilih user').setRequired(true),
        )
        .addNumberOption((option) =>
          option
            .setName('point')
            .setDescription('Jumlah point.')
            .setMinValue(0)
            .setMaxValue(20)
            .setRequired(true),
        )
        .addStringOption((option) =>
          option.setName('reason').setDescription('Keterangan mengurangi point.').setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('adjust')
        .setDescription('[RESTRICTED] Koreksi poin yang telah ditambahkan atau dikurangi')
        .addUserOption((option) =>
          option
            .setName('user')
            .setDescription('User yang akan dikoreksi poinnya')
            .setRequired(true),
        )
        .addStringOption((option) =>
          option
            .setName('type')
            .setDescription('Tipe poin yang akan dikoreksi')
            .setRequired(true)
            .addChoices(
              { name: 'Add Point', value: 'add' },
              { name: 'Minus Point', value: 'minus' },
            ),
        )
        .addIntegerOption((option) =>
          option
            .setName('point')
            .setDescription('Jumlah poin yang akan dikoreksi')
            .setMinValue(-20)
            .setMaxValue(-1)
            .setRequired(true),
        )
        .addStringOption((option) =>
          option.setName('reason').setDescription('Alasan koreksi').setRequired(true),
        ),
    )
    .addSubcommandGroup((group) =>
      group
        .setName('clear')
        .setDescription('[RESTRICTED] Menghapus poin.')
        .addSubcommand((command) =>
          command.setName('all').setDescription('[RESTRICTED] Menghapus seluruh poin semua user.'),
        )
        .addSubcommand((command) =>
          command
            .setName('user')
            .setDescription('[RESTRICTED] Menghapus poin user tertentu.')
            .addUserOption((option) =>
              option.setName('user').setDescription('Pilih user').setRequired(true),
            ),
        ),
    ),

  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    try {
      const admins = await getAllAdmin();
      const leadRoles = [
        '1141920753709760573',
        '1141921470822498425',
        '1258312863135694899',
        '1215136667661246544',
        '1265537635758116965',
      ];
      const highestRoles = [
        '1258265953884442675',
        '1258310391478485084',
        '1015108944332595210',
        '1141938506642501712',
        '1141934301420732567',
        '1141934059203858524',
        '1015108828070690826',
      ];

      const userId = interaction.user.id;
      const userRoles = interaction.member.roles.cache.map((role) => role.id);

      if (!admins.includes(userId) && !userRoles.some((roleId) => leadRoles.includes(roleId))) {
        return await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor('Red')
              .setDescription(
                'Anda tidak memiliki izin untuk mengakses command ini! <a:amor:1275258588608069756>',
              ),
          ],
          ephemeral: true,
        });
      }

      const user = interaction.options.getUser('user');
      const targetMember = interaction.guild.members.cache.get(user.id);

      if (user.bot) {
        return await interaction.reply({
          embeds: [
            new EmbedBuilder().setColor('Red').setDescription('User yang anda pilih adalah bot!.'),
          ],
          ephemeral: true,
        });
      }

      const highRole = targetMember.roles.highest.id;
      if (leadRoles.includes(highRole) && leadRoles.includes(interaction.member.roles.highest.id)) {
        return await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor('Red')
              .setDescription(
                'Lead tim tidak diperbolehkan memberikan poin kepada diri sendiri atau anggota lead tim lainnya!',
              ),
          ],
          ephemeral: true,
        });
      } else if (highestRoles.includes(highRole)) {
        return await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor('Red')
              .setDescription(
                `Kamu tidak diperbolehkan memberikan poin kepada role ${targetMember.roles.highest}!`,
              ),
          ],
          ephemeral: true,
        });
      }

      const subcommandGroup = interaction.options.getSubcommandGroup(false);
      const subcommand = interaction.options.getSubcommand();

      const actions = {
        async clear() {
          if (subcommand === 'all') {
            await deleteAllPoints();
            await replyWithEmbed('clear_all');
          } else if (subcommand === 'user') {
            await clearPoint({ user_id: user.id });
            await replyWithEmbed('clear_user', user.id);
          }
        },
        async adjust() {
          const type = interaction.options.getString('type');
          const point = interaction.options.getInteger('point');
          const reason = interaction.options.getString('reason');
          await correctPoint({
            member: targetMember,
            type,
            point,
            reason,
            addedBy: interaction.member,
          });
          await replyWithEmbed(`correct_${type}`, user.id, point);
        },
        async add() {
          await modifyPoint('add');
        },
        async minus() {
          await modifyPoint('minus');
        },
      };

      async function modifyPoint(type) {
        const point = interaction.options.getNumber('point');
        const reason = interaction.options.getString('reason');
        const addedPoint = await addPoint({
          member: targetMember,
          type,
          point,
          reason,
          addedBy: interaction.member,
        });
        await replyWithEmbed(addedPoint.type, user.id, point);
      }

      async function replyWithEmbed(type, userId = null, point = null) {
        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(0x758694)
              .setDescription(generateResponseMessage({ type, userId, point })),
          ],
          ephemeral: true,
        });
      }

      if (actions[subcommandGroup]) {
        await actions[subcommandGroup]();
      } else {
        await actions[subcommand]();
      }
    } catch (error) {
      logger.error(error, 'Error executing point command');
      await interaction.reply({
        embeds: [new EmbedBuilder().setColor('Red').setDescription(`${error.message}`)],
        ephemeral: true,
      });
    }
  },
};

function generateResponseMessage({ type, point, userId }) {
  const messages = {
    add: `✨\u2009 **${point} poin** telah diberikan kepada <@${userId}>!`,
    minus: `🔽\u2009 **${point} poin** telah dikurangi dari <@${userId}>!`,
    clear_all: '🗑️\u2009 Semua poin user telah dihapus!',
    clear_user: `🗑️\u2009 Semua poin dari user <@${userId}> telah dihapus!`,
    correct_add: `✨\u2009 **${point} poin** telah dikoreksi untuk user <@${userId}>!`,
    correct_minus: `🔽\u2009 **${point} poin** telah dikoreksi untuk user <@${userId}>!`,
  };
  return messages[type];
}
